const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

const walk = require('./walk');

const dir = process.argv[2] || './src';
const fileRegex = process.argv[3] || /component.spec.ts/;
const lookupToken = process.argv[4] || /NO_ERRORS_SCHEMA/;
const argRule = process.argv[5] || false;
const rule = argRule === "true";

walk(dir, (err, projectFiles = []) => {
  if (err) {
    console.log(err);

    return;
  }

  const filteredFiles = projectFiles.filter((file = '') => {
    return file.match(fileRegex);
  });

  console.log(`Count: ${filteredFiles.length}\n\n`);
  console.log(`${rule ? 'Containing' : 'Missing'} ${lookupToken}\n`);

  filteredFiles.forEach((file) => {
    readFileAsync(file, 'utf-8')
      .then((text) => {
        const lines = text.replace('\r', '').split('\n');

        // to find css variable names: \.[a-z_-][\w-]*:
        // to find scss variable names: \$[a-z_-][\w-]*:

        const match = lines.reduce((prev, line) => {
          if (rule === true) { // token must match
            // console.log(`prev: ${prev}, token: ${lookupToken}, line: ${line}, match: ${line.match(lookupToken)}`);
            const lineMatch = line.match(lookupToken)
            if (lineMatch !== null) {
              console.log(lineMatch.toString());
            }
            return prev ? prev : (lineMatch !== null) === true;
          } else {

            return prev || (line.match(lookupToken) === null) === true;
          }
        }, false);
        
        // console.log(match, rule, file);
        
        if (match) {
          console.log(file);
        }
      });
  });
});