#!/usr/bin/env node

'use strict';

/**
* The CLI is called with $ slacks
* It:
*   1. Runs parsePackage
*   2. Confirms what techs you use
*   3. Saves the Docker Compose file
*   4. Offers you the opportunity to run the shell file to start it all
**/

import inquirer from 'inquirer';
import { packageParser } from './parsePackage.js';
import { formatLinks, formatServices, createCompose, writeFile } from './writeDCompose.js';

// Error messages here
const ERR_NO_CWD = 'Unable to find the root directory of your Node app. Exiting.';
const ERR_NO_PKG = 'Unable to find your Node app\'s package.json. Exiting.';
const ERR_DIDNT_WRITE = 'Couldn\'t write docker-compose.yml. Exiting.';


async function getServers(pkg_path) {
  /**
  * Given a path to the package, get the docker modules we may
  * want to include in the Docker Compose file.
  * @param pkg_path {string} The relative path to the package file
  * @returns {Array} An array containing the names of the Docker modules to use
  * @private
  **/
  let dependencies;
  try {
    dependencies = await packageParser.matchDependencies(pkg_path);
  } catch (err) {
    console.error('error', err);
    throw new Error(`${ERR_NO_PKG} - ${err}`);
  };
  return dependencies;
}

function makeChoices(dockerModules) {
  /**
  * Create an array of objects, as is needed to populate the checkboxes
  * where the user confirms which modules to put in the Docker Compose file
  * Output example:
  * [
  *   {name: redis, checked: true},
  *   {name: mongo, checked: true},
  * ]
  * @param dockerModules {Array} The modules we think the user wants
  * @returns {Array} An array of objects to pass to Inquirer's checkboxes method
  * @private
  **/
  return dockerModules.map(module => {
    return ({
      name: module,
      checked: true,
    });
  });
}

function writeDockerCompose(choices) {
  /**
  * Given a set of modules we want, write the needed Docker Compose file
  * @param choices {Array} The modules the user wants to use
  * @returns {boolean} True, if successful; false, otherwise.
  * @private
  **/
  try {
    writeFile(createCompose(formatLinks(choices), formatServices(choices)));
  } catch (err) {
    console.error(ERR_DIDNT_WRITE, err);
    return false
  }

  return true;
}

// Questions for Inquirer
let q_start = {
  type: 'input',
  name: 'pkgPath',
  message: 'What is the relative path to the package.json for this app?',
  default: './package.json',
};
let q_confirm = {
  type: 'checkbox',
  name: 'confirmDockers',
  message: 'We\'ve detected you may need these services. Please select the ones you want:',
};

(async function userQuery() {
  /**
  * Presents the user with a series of questions, and writes a Docker Compose
  * file based off of their input.
  * @param none
  * @returns {boolean} True if successful; false, otherwise
  * @private
  **/

  // Get the package.json path
  const answers = await inquirer.prompt(q_start);

  let deps;

  // Get the servers from the package.json
  try {
    deps = await getServers(answers.pkgPath);
  } catch (err) {
    console.error(err);
    return false;
  }

  // Confirm the servers the user wants
  q_confirm.choices = makeChoices(deps);
  const confirmations = await inquirer.prompt(q_confirm);

  // Write out the Docker Compose file
  try {
    writeDockerCompose(confirmations.confirmDockers);
  } catch (err) {
    console.error(err);
    return false;
  }

  // Success! Provide feedback.
  console.log('Your Docker Compose File has been written.');
  return true;
})();
