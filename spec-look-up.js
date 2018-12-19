const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

const walk = require('./walk');

const dir = process.argv[2] || './src';

walk(dir, (err, files = []) => {
  if (err) {
    console.log(err);

    return;
  }

  const specs = files.filter((file) => {
    return file.match(/component.spec.ts/) ||
      file.match(/pipe.spec.ts/) ||
      file.match(/directive.spec.ts/) ||
      file.match(/service.spec.ts/);
  });

  console.log(`Specs count: ${specs.length}\n\n`);
  console.log(`Specs missing NO_ERRORS_SCHEMA:\n`);

  specs.forEach((spec) => {
    readFileAsync(spec, 'utf-8')
    .then((text) => {
        const lines = text.replace('\r', '').split('\n');

        const hasNoErrorsSchema = lines.reduce((prev, line) => {
          return prev || line.match(/NO_ERRORS_SCHEMA/);
        }, false);

        if (!hasNoErrorsSchema) {
          console.log(spec);
        }
      });
  });
});