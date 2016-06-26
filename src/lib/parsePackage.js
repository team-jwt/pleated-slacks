'use strict';

import fs from 'fs';
import request from 'request-promise';
import cheerio from 'cheerio';
import Promise from 'bluebird';

const ERR_NO_PJ = 'Can\'t find a package.json at that location'
const ERR_NO_PKG = 'Unable find package on NPM';

export const dependencies = path_to_pkg => {
  /**
  * Load a package.json file
  * @param path_to_pkg {string} The path, from root of application (_not_ from this module) to the package.json to load
  * @returns {array} An array of all modules in the dependencies and the devDependencies
  * @private
  **/

  let thePkg;
  let theJSON;

  try {
    thePkg = fs.readFileSync(path_to_pkg, 'utf8')
  } catch (err) {
    console.error('error:', err);
    throw new Error(ERR_NO_PKG);
  }

  try {
    theJSON = JSON.parse(thePkg);
  } catch (err) {
    console.error('error:', err);
    throw new Error(ERR_NO_PJ);
  }

  return Object.keys(theJSON.dependencies).concat(Object.keys(theJSON.devDependencies));
};

export const depURL = pkg => {
  /**
  * Given a package name, get the npmjs url to that package
  * @param pkg {string} The package name, as seen in package.json
  * @returns {string} A fully-qualified URL to the package
  * @private
  **/
  return `https://www.npmjs.com/package/${pkg}`;
};

export const fetchNPM = async function(depURL) {
  /**
  * Given a package url, fetch that url and get the dependencies
  * Call this instead of fetchPromise.
  * @param depurl {string} A fully-qualified URL to the package
  * @returns {Function} A Promise
  * @private
  **/
  const npmPage = await request(depURL);
  return parseDependencies(npmPage);
}

export const parseDependencies = html => {
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
};

export const parseDockers = dockerJSON => {
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
  return dockers;
}

export const fetchDockers = async function (url) {
  /**
  * Grabs all Official Docker repositories
  * @param {string} A URL, but usually we won't need this and will use the default
  * @returns {Function} A Promise
  * @private
  **/
  const dockerURL = url || 'https://hub.docker.com/v2/repositories/library/?page_size=999';
  const dockers = await request(dockerURL);
  return parseDockers(dockers);
}

export const matchDependencies = async function (path_to_pkg) {
  /**
  * Given a package, return an object with the docker modules needed to launch
  * that package. This method pulls together all other methods in this object.
  * Response is an object that shows the docker module.
  * Example response:
  *   [mongo,
  *   redis,]
  * @param {string} The path, from root of application (_not_ from this module) to the package.json to load
  * @returns {Function} A Promise containt an array listing all of the needed docker modules
  **/
  let packageJSON;

  try {
    packageJSON = dependencies(path_to_pkg);
  } catch (err) {
    console.error(err);
  }

  // From our dependencies, get a list of NPM URLs
  let packageURLs = packageJSON.map((pkg) => {
    return depURL(pkg);
  });

  // Create an array holding all our Promises, so that we can Promise.all them later
  let fetchedPromises = [fetchDockers()];

  // We now have an array of NPM URLs
  // We need to iterate over the array
  packageURLs.forEach(url => {
    // And for each URL, grab a Promise of the fetch & parse
    // Drop that in our array
    fetchedPromises.push(fetchNPM(url));
  });

  // If we separately awaited the dependencies and Docker promises
  // We'd do things serially. Instead, use destructuring and the spread
  // operator to await them in paralell
  const [...fetchedData] = await Promise.all(fetchedPromises);

  // The first item in fetchedData is our Docker module names
  // All remaining items are the dependencies... in multiple nested arrays
  const dockerKeywords = fetchedData.shift();
  const depKeywords = fetchedData.reduce((accum, el) => accum.concat(el), []);

  let depList = {};

  depKeywords.forEach(kw => {
    // For each keyword from an npm page
    if (!depList.hasOwnProperty(kw) && dockerKeywords.hasOwnProperty(kw)) {
      // If there's not already a key in depList with that name
      //  And if there's a matching Docker module
      //  Add a key
      depList[kw] = true;
    }
  });

  return Object.keys(depList);
};
