const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

const walk = require('./walk');

const dir = process.argv[2] || './src';
const fileRegex = process.argv[3] || /.scss/;
const lookupToken = process.argv[4] || /(@mixin\ )([a-z0-9\-_]*)/;
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

  filteredFiles.forEach(async (file) => {
    const text = await readFileAsync(file, 'utf-8');
    const lines = text.replace('\r', '').split('\n');

    // to find css variable names: \.[a-z_-][\w-]*:
    // to find scss variable names: \$[a-z_-][\w-]*:
    // to find mixin names: (@mixin)\ ([a-z0-9\-_]*)

    const match = lines
      .map((line) => {
        const regex = new RegExp(lookupToken);
        const test = regex.test(line);
        if (!test) {
          return;
        }

        const match = line.match(lookupToken);

        if (match) {
          const [_, __, mixin ] = match;

          return mixin;
        }
      })
      .filter((match) => !!match);
    
    if (match) {
      console.log({ file, mixins: match });
    }
  });
});