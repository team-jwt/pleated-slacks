'use strict';

const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

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

packageParser.depURL = function makeNPMURL(pkg) {
  /**
  * Given a package name, get the npmjs url to that package
  * @param pkg {string} The package name, as seen in package.json
  * @returns {string} A fully-qualified URL to the package
  * @private
  **/
  return `https://www.npmjs.com/package/${pkg}`;
}

module.exports = packageParser;
