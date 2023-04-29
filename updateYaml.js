const fs = require('fs');
const yaml = require('js-yaml');

function updateYamlFile(filePath, keysArray, valuesArray) {
    // Load the YAML file
    const doc = yaml.load(fs.readFileSync(filePath, 'utf8'));
  
    // Update each key-value pair in the YAML file
    for (let i = 0; i < keysArray.length; i++) {
      const keys = keysArray[i].split('.');
      let obj = doc;
      for (let j = 0; j < keys.length - 1; j++) {
        obj = obj[keys[j]];
      }
      obj[keys[keys.length - 1]] = valuesArray[i];
    }
  
    // Write the updated YAML file
    const yamlStr = yaml.dump(doc);
    fs.writeFileSync(filePath, yamlStr);
  }

function createYamlFileFromJson(jsonObj, fileName) {
    try {
      const yamlStr = yaml.dump(jsonObj);
      fs.writeFileSync(fileName, yamlStr);
      console.log(`YAML file created: ${fileName}`);
    } catch (err) {
      console.error(err);
    }
  }


updateYamlFile("./default.yml", ["db.db", "db.user", "db.pass"], ["jokerman", "vitpilen", "husqvarna"])
