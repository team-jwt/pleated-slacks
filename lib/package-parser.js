'use strict';

const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const Promise = require('bluebird');

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

packageParser.fetchPromise = function getURL(depURL, callback) {
  /**
  * Given a package url, fetch that url and do the callback to it
  * This will usually be called using fetchNPM.
  * @param depurl {string} A fully-qualified URL to the package
  * @param callback {Function} A callback that takes one parameter.
  * This callback will only be called if the URL is successfully gotten
  * @returns {Function} A Promise
  * @private
  **/
  return new Promise( (resolve, reject) => {
    request(depURL, (error, response, html) => {
      resolve(callback(html));
      reject(error);
    });
  });
}

packageParser.fetchNPM = function getNPM(depURL) {
  /**
  * Given a package url, fetch that url and get the dependencies
  * Call this instead of fetchPromise.
  * @returns {Function} A resolved or rejected Promise
  * @private
  **/
  return this.fetchPromise(depURL, (p) => this.fetchDependencies(p));
}

packageParser.fetchDependencies = function traverseNPM(html) {
  let $ = cheerio.load(html);
  let dependencies = [];
  let deps = $('.sidebar>p.list-of-links:first-of-type').text().split(',');
  return deps.map((el) => {
    return el.replace(/\s*(\S.*\S)\s*/g, '$1');
    // console.log(el);
  });
  // console.log(deps);
  // console.log(deps);
  // for (let dep in deps) {
  //   console.log(dep);
  // }
}

// packageParser.fetchNPM('https://www.npmjs.com/package/sequelize').then(console.log(this));
// packageParser.fetchNPM('http://www.kaizendad.co');

module.exports = packageParser;
