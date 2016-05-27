'use strict';

const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const Promise = require('bluebird');

const packageParser = {};

packageParser.dependencies = function dependencies(path_to_pkg) {
  /**
  * Load a package.json file
  * @param path_to_pkg {string} The path, from root of application (_not_ from this module) to the package.json to load
  * @returns {array} An array of all modules in the dependencies and the devDependencies
  * @private
  **/
  const pj = JSON.parse(fs.readFileSync(path_to_pkg, 'utf8'));
  return Object.keys(pj.dependencies).concat(Object.keys(pj.devDependencies));
}

packageParser.depURL = function depURL(pkg) {
  /**
  * Given a package name, get the npmjs url to that package
  * @param pkg {string} The package name, as seen in package.json
  * @returns {string} A fully-qualified URL to the package
  * @private
  **/
  return `https://www.npmjs.com/package/${pkg}`;
}

packageParser.fetchPromise = function fetchPromise(depURL, callback) {
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
    request(depURL, (error, response, content) => {
      resolve(callback(content));
      reject(error);
    });
  });
}

packageParser.fetchNPM = function fetchNPM(depURL) {
  /**
  * Given a package url, fetch that url and get the dependencies
  * Call this instead of fetchPromise.
  * @param depurl {string} A fully-qualified URL to the package
  * @returns {Function} A resolved or rejected Promise
  * @private
  **/
  return this.fetchPromise(depURL, (p) => this.parseDependencies(p));
}

packageParser.parseDependencies = function parseDependencies(html) {
  /**
  * Takes the html content of an NPM module's page and parses out the keywords
  * Typically this is called when request returns a given NPM page
  * @param {string} The HTML content of the page
  * @returns {Function} A resolved or rejected Promise
  * @private
  **/
  let $ = cheerio.load(html);
  let deps = $('.sidebar>p.list-of-links:first-of-type').text().split(',');
  return deps.map((el) => {
    return el.replace(/\s*(\S.*\S)\s*/g, '$1');
  });
}

packageParser.parseDockers = function parseDockers(dockerJSON) {
  /**
  * Docker makes all the official repos available in a JSON file at one endpoint
  * URL: https://hub.docker.com/v2/repositories/library/
  * JSON from here comes in the format:
  *  {
  *   user: "library",
  *   name: "nginx",
  *   namespace: "library",
  *   status: 1,
  *   description: "Official build of Nginx.",
  *   is_private: false,
  *   is_automated: false,
  *   can_edit: false,
  *   star_count: 3054,
  *   pull_count: 196962844,
  *   last_updated: "2016-05-24T23:08:09.477673Z"
  * },
  * Grab that JSON and parse it into an easy-to-search object of the format:
  * {
  *   nginx: "Official build of Nginx."
  * }
  * @param dockerJSON {string} Stringified JSON from the Docker endpoint
  * @returns {Object} An object of Dockerfiles with the format:
  * { technol}
  * @private
  **/
  let dj = JSON.parse(dockerJSON);
  let dockers = {};
  dj.results.forEach((el) => {
    dockers[el.name] = el.description;
  });
  console.log(dockers);
  return dockers;
}

packageParser.fetchDockers = function fetchDockers() {
  /**
  * Grabs all Official Docker repositories
  * Takes no parameters -- API endpoint is unchanging
  * @returns {Function} A resolved or rejected Promise
  * @private
  **/
  const dockerURL = 'https://hub.docker.com/v2/repositories/library/?page_size=999';
  this.fetchPromise(dockerURL, (p) => this.parseDockers(p));
}

module.exports = packageParser;
