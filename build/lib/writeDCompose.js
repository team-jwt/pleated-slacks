'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var fs = require('fs');

/**
* writeDCompose is the parent for our internal docker-compose construction
* processes.
* @private
**/

var formatHelper = function formatHelper(formatted, service) {
  return formatted.concat('- ' + service + '\n');
};

var formatLinks = exports.formatLinks = function formatLinks(serviceArr) {
  /**
   * formats the services array into string to be used under links config in compose file
   * @param {array} output of writeDockerfile
   * @return {string} formatted service links
   */
  return serviceArr.reduce(undefined.formatHelper, '');
};

var formatServicesHelper = function formatServicesHelper(formatted, service) {
  return formatted.concat(service + ':\n  image: ' + service + '\n');
};

var formatServices = exports.formatServices = function formatServices(serviceArr) {
  /**
   * formats the services array into string to be used to add services in compose file
   * @param {array}
   * @return {string}
   */
  return serviceArr.reduce(undefined.formatServicesHelper, '');
};

var createCompose = exports.createCompose = function createCompose(links, services) {
  /**
   * writes new docker-compose.yml file to be used on command line
   * note: using docker-compose version 2 file format
   * @param {object} output of writeDockerfile
   * @return
   */
  return 'version: \'2\'\nservices:\n  web:\n    build:\n      context:\n    ports:\n    - "' + process.env.PORT + ':' + process.env.PORT + '"\n    links:\n    ' + links + '\n  ' + services + '\n  ';
};

var writeFile = function writeFile(compose) {
  /**
   * creates new file from compose string
   * @param  {string}
   */
  fs.writeFileSync('docker-compose.yml', compose, 'utf8', function (err) {
    if (err) return console.error(err);
  });
};