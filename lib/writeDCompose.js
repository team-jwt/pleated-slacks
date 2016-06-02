'use strict';

const fs = require('fs');
const writeDockerfile = require('./writeDockerfile.js');

const writeDCompose = {};
/**
* writeDCompose is the parent for our internal docker-compose construction
* processes. Pretty much everything is private to the function itself.
* To call it, use something like:
*
* @private
**/

/**
 *  TODO: need variables from dockerfile output: service definitions, links to images, etc
 *  TODO: omit compose section if no services are required?
 */

// TODO: figure out how to get ports 

writeDCompose.getServices = function (services) {
  /**
   * formats the services array (if it is that) into compose format
   * @param {array}
   * @return {string} services segment
   */
  let serviceStr = '';
  services.forEach((service) => {
    serviceStr += `- ${service}\n`;
  })
  return serviceStr;
}

console.log(writeDCompose.getServices(['mongoose', 'redis']))

writeDCompose.createCompose = function (dockerfiles, serviceStr) {
  /**
   * writes new docker-compose.yml file to be used on command line
   * @param {object} output of writeDockerfile
   * @return
   */

  let services;

  /* using docker-compose version 2 file format */
  let compose = `version: '2'
services:
  web:
    build:
      context: . # builds from current Dockerfile in directory
    ports:
    - "${process.env.PORT}:${process.env.PORT}"
    depends_on:
    ${services}`;


  fs.writeFileSync('docker-compose.yml', compose, 'utf8', (err) => {
    if (err) return console.error(err);
  })
}

module.exports = writeDCompose;
