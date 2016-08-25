const fs = require('fs');

const formatHelper = (formatted, service) => {
  return formatted.concat(`    - ${service}\n`);
};

export const formatLinks = (serviceArr) => {
  /**
   * formats the services array into string to be used under links config in compose file
   * @param {array} output of parsePackage
   * @return {string} formatted service links
   */
  return serviceArr.reduce(formatHelper, '');
}

const formatServicesHelper = (formatted, service) => {
  return formatted.concat(`  ${service}:
    image: ${service}\n\n`);
};

export const formatServices = (serviceArr) => {
  /**
   * formats the services array into string to be used to add services in compose file
   * @param {array} output of parsePackage
   * @return {string} needed services
   */
   return serviceArr.reduce(formatServicesHelper, '');
};

export const createCompose = (links, services) => {
  /**
   * writes new docker-compose.yml file to be used on command line
   * note: using docker-compose version 2 file format
   * @param {object} output of parsePackage
   * @return {string} a string containing the contents of the Compose file
   */
  return `version: '2'
services:
  web:
    build:
      context:
    ports:
    - "${process.env.PORT || 3000}:${process.env.PORT || 3000}"
    links:
${links}
${services}
  `;
};

export const writeFile = (compose) => {
  /**
   * saves new file from compose string built in createCompose
   * @param  {string}
   * @return {Boolean} true if successful; false if fails
   */
  fs.writeFileSync('docker-compose.yml', compose, 'utf8', (err) => {
    if (err) {
      console.error(err);
      return false;
    } else {
      return true;
    }
  });
};
