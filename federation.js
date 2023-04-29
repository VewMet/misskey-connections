const { Pool } = require('pg');

const maxConnections = 5; // maximum parallel connections to database instances
const databaseList = ['limca', 'misskey']; // list of database names



async function updateMetaTable() {
    const pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: "limca",
        password: 'example-misskey-pass',
        port: 5432 // default PostgreSQL port
      });
    
  const client = await pool.connect();
  try {
    // execute query to update meta table
    const queryText = `UPDATE meta SET "whitelistedHosts" = (
      SELECT array_agg(DISTINCT x) FROM unnest("meta"."whitelistedHosts" || $1) AS x
    ), "blockedHosts"=$2`;
    const queryValues = [['cn.net', 'chainlink.db','sssssssssssssssssssss'], []]; // input string array, empty array
    await client.query(queryText, queryValues);
  } finally {
    client.release();
    pool.end();
  }
}

// updateAllDatabases(databaseList).finally(() => {});
updateMetaTable()
