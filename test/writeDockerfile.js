'use strict';

const expect = require('expect');
const fs = require('fs');
const writer = require('../build/lib/writeDockerfile.js');

describe('write a dockerfile', () => {
  // make sure it writes to a file called Dockerfile
  it('should write Dockerfile', () => {
    writer.makeNodeServer();
    expect(fs.existsSync('Dockerfile')).toExist;
    expect(fs.readFileSync('Dockerfile').toString()).toEqual(`FROM node:latest \nEXPOSE ${process.env.PORT || 3000}`)
  });
});
