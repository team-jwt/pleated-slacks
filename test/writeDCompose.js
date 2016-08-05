'use strict';

const expect = require('expect');
const fs = require('fs');
const writeDCompose = require('./../build/lib/writeDCompose');

const serviceArr = ['mongo', 'redis','mySQL'];
const links = writeDCompose.formatLinks(serviceArr);
const services = writeDCompose.formatServices(serviceArr);
const composeStr = writeDCompose.createCompose(links, services);

describe('write docker-compose.yml file', () => {
  it('expect function to format links', () => {
    const formattedLinks = `    - mongo
    - redis
    - mySQL
`;
    expect(links).toEqual(formattedLinks);
  });
  it('expect function to format services', () => {
    const formattedServices = `  mongo:
    image: mongo

  redis:
    image: redis

  mySQL:
    image: mySQL  

`;
    expect(services).toEqual(formattedServices);
  });
  it('expect compose string to be created', () => {
    expect(composeStr).toBeA('string');
    expect(composeStr).toNotMatch(/undefined/); // => does not pass because of ports
  });
  it('expect docker-compose.yml file to be created', () => {
    // TODO: write test
    // writeDCompose.writeFile();
  });
});
