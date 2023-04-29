const admin = require("firebase-admin");
const { Pool } = require('pg');

var serviceAccount = require("./service-account-gcf.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://vewmetcalling.firebaseio.com"
});


const maxConnections = 5; // maximum parallel connections to database instances
const dbParams = {
  user: 'postgres',
      host: 'localhost',
      password: 'example-misskey-pass',
      port: 5432 // default PostgreSQL port
}

// Function to update UserDetails/{uuid} doc with merge for a given object
async function updateFederation(idToken, federation, fedInstancesArray) {
  const uuid = await getUidFromIdToken(idToken);
  if(!uuid){
    throw new Error(`could not get valid id token`);
  }
  const docRef = admin.firestore().collection('UserDetails').doc(uuid);
  const userDetails = (await docRef.get()).data();

  try {
    await docRef.set({[`fed:${federation}`]: fedInstancesArray}, { merge: true });
    console.log(`Federations with UUID ${uuid} updated successfully`);
  } catch (err) {
    console.error(`Error updating federation for UUID ${uuid}`, err);
    throw new Error(`Error while updating federations for uuid ${uuid}`, err);
  }

  const federationsArray = getSubdomainsForInstances(fedInstancesArray, userDetails.instances, userDetails.instances_subdomain);
  const databaseList = federationsArray; // db name is same as subdomain
  return updateAllDatabases(databaseList, federationsArray).finally(() => {});
}

async function getUidFromIdToken(idToken) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return null;
  }
}

function getSubdomainsForInstances(fedInstances, allInstances, instances_subdomain) {
  return fedInstances.map((fedInstance) => {
    const fedInstanceIndex = allInstances.indexOf(fedInstance);
    if (fedInstanceIndex !== -1) {
      return instances_subdomain[fedInstanceIndex];
    }
    return null;
  }).filter((subdomain) => subdomain !== null);
}

async function updateMetaTable(database, federationsArray) {
  const pool = new Pool({
      ...dbParams,
      database: database,
    });
  
const client = await pool.connect();
try {
  // execute query to update meta table
  const queryText = `UPDATE meta SET "whitelistedHosts" = (
    SELECT array_agg(DISTINCT x) FROM unnest("meta"."whitelistedHosts" || $1) AS x
  ), "blockedHosts"=$2`;
  const queryValues = [federationsArray, []];
  await client.query(queryText, queryValues);
} finally {
  client.release();
  pool.end();
}
}

async function updateAllDatabases(databaseList, federationsArray) {
let failedDatabases = [];

for (let i = 0; i < databaseList.length; i += maxConnections) {
  const databaseBatch = databaseList.slice(i, i + maxConnections);

  const promises = databaseBatch.map(database => updateMetaTable(database, federationsArray));
  const results = await Promise.allSettled(promises);

  results.forEach((result, index) => {
    const database = databaseBatch[index];
    if (result.status === 'rejected') {
      console.error(`Failed to update ${database}: ${result.reason}`);
      failedDatabases.push(database);
    }
  });
}

if (failedDatabases.length === 0) {
  console.log('All databases updated');
  return {status:"done", failedFor: []};
} else {
  console.log(`Failed to update the following databases: ${failedDatabases.join(', ')}`);
  return {status:"done",failedFor: failedDatabases};
}
}


// updateFederation(uuid, updates);

module.exports={
  updateFederation
}