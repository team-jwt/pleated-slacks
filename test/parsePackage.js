'use strict';

const expect = require('expect');
const fs = require('fs');
const Promise = require('bluebird');

// File we're testing
const parser = require('./../build/lib/parsePackage.js');

// Load fixtures
const targetDeps = [ 'mongoose',
  'redis',
  'express',
  'q',
  'sequelize',
  'ghost',
  'cradle',
  'node-solr-smart-client',
  'expect',
  'mocha',
  'consul'];
const targetKeywords = ['object relational mapper',
  'nodejs',
  'orm',
  'mssql',
  'postgres',
  'postgresql',
  'sqlite',
  'mysql'];
const targetDocker = {
  nginx: 'Official build of Nginx.',
  busybox: 'Busybox base image.',
  ubuntu: 'Ubuntu is a Debian-based Linux operating system based on free software.',
};
const targetFinal = [ 'redis',
  'node',
  'postgres',
  'mysql',
  'ghost',
  'couchdb',
  'solr',
  'consul' ];

const sampleNPM = fs.readFileSync('./test/fixtures/npm-test.html', 'utf8');
const sampleDocker = fs.readFileSync('./test/fixtures/docker-test.json', 'utf8');
const pjDeps = parser.dependencies('./test/fixtures/package-test.json');

// Now do the tests
describe('package.json parser', () => {
  // Check that we read all of the packages from package.json (#5)
  it('should grab a list of all packages', () => {
    expect(pjDeps).toBeAn(Array);
    expect(pjDeps.length).toEqual(targetDeps.length);
    expect(pjDeps).toEqual(targetDeps);
  });
  it('should generate package URLs', () => {
  // Do we get proper urls? (#5)
    for (let dep of targetDeps) {
      expect(parser.depURL(dep)).toEqual(`https://www.npmjs.com/package/${dep}`);
    }
  });
});
describe('npmjs.com fetcher', () => {
  it('should parse a sample npmjs.com page', () => {
    // Can we parse a page on NPM? (#6)
    // Hey! This one is synchronous!
    expect(parser.parseDependencies(sampleNPM)).toEqual(targetKeywords);
  });
  it('should fetch and parse an acutal npmjs.com page', function () {
  // Do we load a page on npm? (#6)
  // Use the function () format so that we can pass this
  this.timeout(6000);
  return parser.fetchNPM('https://www.npmjs.com/package/sequelize')
    .then(result => {
      expect(result).toEqual(targetKeywords);
    });
  });
});

describe('docker fetcher', () => {
  it('should parse sample JSON from the Docker endpoint', () => {
    // Do we convert the official repos list we get into something useful? (#1)
    expect(parser.parseDockers(sampleDocker)).toEqual(targetDocker);
  });
  it('should fetch and parse actual JSON from the Docker endpoint', function () {
    // Do we pull in official repos? (#1)
    // Use the function () format so that we can pass this
    this.timeout(6000);
    return parser.fetchDockers('https://hub.docker.com/v2/repositories/library/?page_size=3')
      .then(result => {
        expect(result).toEqual(targetDocker);
      });
  });
});

describe('npm/docker matcher', function () {
  it('should match package items to Docker modules -- final integration test', function () {
    // currently, this is slower than ideal
    this.timeout(12000);
    return parser.matchDependencies('./test/fixtures/package-test.json')
      .then(result => {
        expect(result).toEqual(targetFinal);
      });
  });
});
