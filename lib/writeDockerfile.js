'use strict';

/**  very basic description of what's going into the file */

const fs = require('fs');
const parser = require('./package-parser.js');
// just some basic official images
const arrOfImages = ['mongo', 'redis', 'postgres', 'mysql'];

const makeDockerFiles = {};

/** Make dockerfile for node server */
makeDockerFiles.makeNodeServer = function buildFile() {
  // get dependencies from package.json (for now test package)
  let dependencies = parser.dependencies(`${__dirname}/../test/fixtures/package-test.json`);

  // filter out ones that arent in official images
  dependencies = dependencies.filter(dep => arrOfImages.indexOf(dep) !== -1);

  // if there are no dependencies, just setup basic node container
  if (!dependencies.length) {
    const dockerfile = `FROM node:6.2-onbuild \n EXPOSE ${process.env.PORT}`;
    return fs.writeFileSync('Dockerfile', dockerfile);
  }
  // this part is clearly not what's actually going in (just to get a basis for it);
  const dockerfile = `FROM node:latest \nEXPOSE ${process.env.PORT || 3000}`;
  return fs.writeFileSync('Dockerfile', dockerfile);
};

module.exports = makeDockerFiles;
