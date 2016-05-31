'use strict';

const fs = require('fs');
const Promise = require('bluebird');
const parser = require('./package-parser.js');

// For the moment, stub out the package.json
const PKG_PATH = './test/fixtures/package-test.json';

// TODO: make this work from node_modules
const PATH_TO_DOCKER_FILES = 'docker/';

// Remove this when we're calling writeDockerfile from writeComposefile
const whatImages = parser.matchDependencies(PKG_PATH);

const makeDockerFiles = {};
/**
* makeDockerFiles is the parent for our internal Dockerfile construction
* processes. Pretty much everything is private to the function itself.
* To call it, use something like:
* makeDockerFiles.makeDockers(whatImages).then(p => console.log(p));
* @private
**/

makeDockerFiles.formulateDocker = function formulateDocker(dependency) {
  /**
  * Makes the text string for a dockerfile
  * @param {string} The name of the dependency
  * @returns {Object} What should be created, form of {dependency: the contents for the Dockerfile}
  * @private
  **/
  return `FROM ${dependency}: latestt
  EXPOSE $${dependency}_PORT`;
}

makeDockerFiles.saveDocker = function saveDocker(dependency, formulaObj) {
  /**
  * Saves a dockerfile
  * All dockerfiles will be saved in the /docker directory
  * @param {Object} Format: {dependency: the contents for the Dockerfile}
  * @returns {Function} Promise of filepath to saved dockerfile
  * @private
  **/
  if (formulaObj) {
    return new Promise((resolve, reject) => {
      // TODO: make this work from node_modules
      // Check for a /docker/ dir
      fs.stat(PATH_TO_DOCKER_FILES, (err, stats) => {
        if (err) {
          // If not, returns an error value
          // So, make a directory
          fs.mkdir(PATH_TO_DOCKER_FILES, (err) => {
            if (err) {
              // Can't make a directory!
              // Might as well just plotz
              reject(err);
            }
          });
        }
        // Now we know we have a directory. Save the file.
        fs.writeFile(PATH_TO_DOCKER_FILES + dependency, formulaObj, err => {
          if (err) {
            // Can't write a file!
            // Always the shlmiel. Might as well make the app my shlimazel.
            reject(err);
          } else {
            resolve(PATH_TO_DOCKER_FILES + dependency);
          }
        });
      });
    });
  } else {
    return null;
  }
}

// let foo = makeDockerFiles.formulateDocker('node');
// console.log(foo);
// makeDockerFiles.saveDocker('node', foo).then(p => console.log('p!', p));

makeDockerFiles.makeDockers = function makeDockers(imagesNeeded) {
  /**
  * Bring the other methods together, which we have to do because
  * There will be a lot of Promises here.
  * All dockerfiles will be saved in the /docker directory
  * @param {Function} a Promise of the images needed to be made
  * @returns {Function} a Promise of the dockerfiles and their paths. [{ dependency: path }]
  * @private
  **/
  // let imagesMade = [];
  let obj;

  // Map the promises of images needed to promises of images created
  return Promise.map(imagesNeeded, image => {
    //  Formulate a Docker, save it, and store the Promise resulting
    return this.saveDocker(image, this.formulateDocker(image));
  });

  // For each element in the object



  // Get the object of images needed
  // imagesNeeded.then(data => {
  //   // For each element in the object
  //   for (let image in data) {
  //     //  Formulate a Docker, save it, and store the Promise resulting
  //     imagesMade.push(this.saveDocker(image, this.formulateDocker(image)));
  //   }
  // });

  // return Promise.all(imagesMade);
}

makeDockerFiles.makeDockers(whatImages).then(p => console.log('q!', p));
