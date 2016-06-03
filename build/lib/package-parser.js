'use strict';

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var Promise = require('bluebird');

var packageParser = {};
/**
* packageParser is the parent for all of our internal package.json parsing
* Pretty much everything is private to the function itself
* To call it, use something like:
* packageParser.matchDependencies('./test/fixtures/package-test.json').then((p) => console.log(p));
* @private
**/

packageParser.dependencies = function dependencies(path_to_pkg) {
  /**
  * Load a package.json file
  * @param path_to_pkg {string} The path, from root of application (_not_ from this module) to the package.json to load
  * @returns {array} An array of all modules in the dependencies and the devDependencies
  * @private
  **/
  var pj = JSON.parse(fs.readFileSync(path_to_pkg, 'utf8'));
  return Object.keys(pj.dependencies).concat(Object.keys(pj.devDependencies));
};

packageParser.depURL = function depURL(pkg) {
  /**
  * Given a package name, get the npmjs url to that package
  * @param pkg {string} The package name, as seen in package.json
  * @returns {string} A fully-qualified URL to the package
  * @private
  **/
  return 'https://www.npmjs.com/package/' + pkg;
};

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
  return new Promise(function (resolve, reject) {
    request(depURL, function (error, response, content) {
      resolve(callback(content));
      reject(error);
    });
  });
};

packageParser.fetchNPM = function fetchNPM(depURL) {
  var _this = this;

  /**
  * Given a package url, fetch that url and get the dependencies
  * Call this instead of fetchPromise.
  * @param depurl {string} A fully-qualified URL to the package
  * @returns {Function} A resolved or rejected Promise
  * @private
  **/
  return this.fetchPromise(depURL, function (p) {
    return _this.parseDependencies(p);
  });
};

packageParser.parseDependencies = function parseDependencies(html) {
  /**
  * Takes the html content of an NPM module's page and parses out the keywords
  * Typically this is called when request returns a given NPM page
  * @param {string} The HTML content of the page
  * @returns {Function} A resolved or rejected Promise
  * @private
  **/
  var $ = cheerio.load(html);
  var deps = $('.sidebar>p.list-of-links:first-of-type').text().split(',');
  return deps.map(function (el) {
    return el.replace(/\s*(\S.*\S)\s*/g, '$1');
  });
};

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
  var dj = JSON.parse(dockerJSON);
  var dockers = {};
  dj.results.forEach(function (el) {
    dockers[el.name] = el.description;
  });
  return dockers;
};

packageParser.fetchDockers = function fetchDockers(url) {
  var _this2 = this;

  /**
  * Grabs all Official Docker repositories
  * @param {string} A URL, but usually we won't need this and will use the default
  * @returns {Function} A resolved or rejected Promise
  * @private
  **/
  var dockerURL = url || 'https://hub.docker.com/v2/repositories/library/?page_size=999';
  return this.fetchPromise(dockerURL, function (p) {
    return _this2.parseDockers(p);
  });
};

packageParser.matchDependencies = function matchDependencies(path_to_pkg) {
  var _this3 = this;

  /**
  * Given a package, return an object with the docker modules needed to launch
  * that package. This method pulls together all other methods in this object.
  * Response is an object that shows the docker module.
  * Example response:
  *   {  mongo : true,
  *   redis: true, }
  * @param {string} The path, from root of application (_not_ from this module) to the package.json to load
  * @returns {Object} An object describing all of the needed docker modules
  **/
  var packageJSON = this.dependencies(path_to_pkg);

  var packageURLs = packageJSON.map(function (pkg) {
    return _this3.depURL(pkg);
  });

  var depPromises = [];
  var depKeywords = [];
  // Drop our output in an array so that we can later see
  //  if an individual module is in that list
  var depList = [];

  var dockerPromises = this.fetchDockers();

  // We now have an array of NPM URLs
  // We need to iterate over the array
  packageURLs.forEach(function (url) {
    // And for each URL, grab a Promise of the fetch & parse
    // Drop that in an array
    depPromises.push(_this3.fetchNPM(url));
  });

  // Get a returnable Promise
  return Promise.all(depPromises).then(function () {
    // As each individual npm page fetch completes,
    Promise.each(depPromises, function (promiseList) {
      // Get the keywords and add to an array of keywords
      depKeywords = depKeywords.concat(promiseList);
    });
  }).then(function () {
    // When all npm page fetch-and-parses have resolved
    dockerPromises.then(function (data) {
      depKeywords.forEach(function (kw) {
        // For each keyword from an npm page
        if (!depList.hasOwnProperty(kw) && data.hasOwnProperty(kw)) {
          // If there's not a key in depList with that name
          // And if there's a matching Docker module
          // Add a key
          depList.push(kw);
        }
      });
    });
  }).then(function () {
    return depList;
  });
};

module.exports = packageParser;