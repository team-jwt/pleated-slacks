var _this = this;

const fs = require('fs');

/**
* writeDCompose is the parent for our internal docker-compose construction
* processes.
* @private
**/

const formatHelper = (formatted, service) => {
  return formatted.concat(`- ${ service }\n`);
};

export const formatLinks = serviceArr => {
  /**
   * formats the services array into string to be used under links config in compose file
   * @param {array} output of writeDockerfile
   * @return {string} formatted service links
   */
  return serviceArr.reduce(_this.formatHelper, '');
};

const formatServicesHelper = (formatted, service) => {
  return formatted.concat(`${ service }:
  image: ${ service }\n`);
};

export const formatServices = serviceArr => {
  /**
   * formats the services array into string to be used to add services in compose file
   * @param {array}
   * @return {string}
   */
  return serviceArr.reduce(_this.formatServicesHelper, '');
};

export const createCompose = (links, services) => {
  /**
   * writes new docker-compose.yml file to be used on command line
   * note: using docker-compose version 2 file format
   * @param {object} output of writeDockerfile
   * @return
   */
  return `version: '2'
services:
  web:
    build:
      context:
    ports:
    - "${ process.env.PORT }:${ process.env.PORT }"
    links:
    ${ links }
  ${ services }
  `;
};

const writeFile = compose => {
  /**
   * creates new file from compose string
   * @param  {string}
   */
  fs.writeFileSync('docker-compose.yml', compose, 'utf8', err => {
    if (err) return console.error(err);
  });
};