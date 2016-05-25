'use strict';

const fs = require('fs');

const packageParser = {};

packageParser.dependencies = function load(path_to_pkg) {
  /**
  * Load a package.json file
  * @param path_to_pkg {string} The path, from root of application (_not_ from this module) to the package.json to load
  * @returns {array} An array of all modules in the dependencies and the devDependencies
  * @private
  **/
  const pj = JSON.parse(fs.readFileSync(path_to_pkg, 'utf8'));
  return Object.keys(pj.dependencies).concat(Object.keys(pj.devDependencies));
}

module.exports = packageParser;
