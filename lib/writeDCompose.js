'use strict';

const fs = require('fs');
const writeDockerfile = require('./writeDockerfile.js');

function writeDCompose(dockerfiles) {
  /**
   * writes new docker-compose.yml file to be used on command line
   * @param {object} output of writeDockerfile
   * @return
   */

  let version, services; // Need service definitions from output of Dockerfile

  let compose = `version: ${version}
services:
  web:
    build: . #builds from current Dockerfile in directory
    ports:
    - "${process.env.PORT}:${process.env.PORT}"
    depends_on:
    ${services}`;


  fs.writeFileSync('docker-compose.yml', compose, 'utf8', (err) => {
    if (err) return console.error(err);
  })
}

writeDCompose();

module.exports = writeDCompose;

// version: '2'
// services:
//   web:
//     build: .
//     ports:
//      - "5000:5000"
//     volumes:
//      - .:/code
//     depends_on:
//      - redis
//   redis:
//     image: redis
