const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const timestamp = Date.now();

const directoryPath = "./"
function backupDatabaseToLocal(databaseName, host, username, password, subdomain) {
    // const logger = createFileLogger(subdomain);
  
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath);
    }
    const timestamp2 = Date.now()
    const filePath = path.join(directoryPath, `${subdomain}_${timestamp2}.dump`);
  
    if (fs.existsSync(filePath)) {
      console.log(`File ${filePath} already exists.`);
      return "ERROR";
    }
  
    const command = `PGPASSWORD=${password} pg_dump -U ${username} -h ${host} ${databaseName} > ${filePath}`;
  
    try {
      execSync(command);
      console.log('Backup file created successfully');
      return "OK";
  
    } catch (err){
      console.log(`Error: ${err.message}`);
      return "ERROR";
    }
  
  }

  function checkGCSUploadOperationDone(directoryPath,subdomain,timestamp2) {
    const logFilename = `${directoryPath}/gcsOutput_${subdomain}_${timestamp2}.log`;
    const buffer = fs.readFileSync(logFilename);
    const lines = buffer.toString().split('\n').reverse();
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('Operation completed')) {
        fs.unlinkSync(logFilename);
        fs.unlinkSync(`./Backup/${subdomain}_${timestamp2}.dump`);

        // deleteFilesWithExtension(directoryPath,'.dump');
        // TODO - the status message may change by google 
        return "OK";
      }
    }
    return "ERROR";
  }

  function uploadToGCS(subdomain) {
    // const logger = createFileLogger(subdomain);
  
     try {
  
    if (!fs.existsSync(directoryPath)) {
      console.log(`Directory ${directoryPath} does not exist.`);
      console.log('uploadToGCSFailed')
      return "ERROR";
    }
    const timestamp2 = Date.now();
    const logFiles = getFilenamesWithSubdomain(subdomain, directoryPath)
    logFiles.forEach((fileName) => {
      console.log(`Pushing ${fileName} to GCS`);
      const command = `gsutil -m cp -r ${directoryPath}/${fileName} gs://vewmet_central_db_backups 2>&1 | tee ${directoryPath}/gcsOutput_${subdomain}_${timestamp2}.log`;
      execSync(command);
      const isUploaded = checkGCSUploadOperationDone(directoryPath,subdomain,timestamp2);
      if (!isUploaded) {
        console.log('upload failed')
        throw new Error(`error while uploading ${fileName} file to GCS`)
      }
    })
  
    return "OK"
  
  } catch (err){
      //in this case we are getting error eventhough command is success
      console.log('uploadToGCSError', err)
      return "ERROR";
      
  }}
  const status = backupDatabaseToLocal("misskey","localhost","postgres","example-misskey-pass","bmtc_cmtc")
  console.log('******', status)