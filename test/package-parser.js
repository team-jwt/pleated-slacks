'use strict';

const expect = require('expect');
const fs = require('fs');
const promise = require('bluebird');

// File we're testing
const parser = require('../lib/package-parser.js')
let pjDeps = parser.dependencies('./test/fixtures/package-test.json')
// let pjKeywords = parser.keywords(targetDeps);

// Load fixtures
let targetDeps = [ 'mongoose',
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

let targetKeywords = {
  'mongoose': ['db', 'orm', 'nosql', 'query', 'datastore', 'data', 'odm', 'database', 'schema', 'model', 'document', 'mongodb'],
  'redis': ['backpressure', 'pubsub', 'nodejs', 'queue', 'performance', 'pipelining', 'transaction', 'redis', 'database'],
  'express': ['api', 'app', 'router', 'restful', 'rest', 'web', 'sinatra', 'framework', 'express'],
  'q': ['node', 'browser', 'fluent', 'flow control', 'async', 'future', 'deferred', 'promises-aplus', 'promises-a', 'promises', 'promise', 'q'],
  'sequelize': ['object relational mapper', 'nodejs', 'orm', 'mssql', 'postgres', 'postgresql', 'sqlite', 'mysql'],
  'ghost': ['cms', 'blog', 'ghost'],
  'cradle': ['couch', 'database', 'couchdb'],
  'node-solr-smart-client': ['solr cloud', 'zookeeper', 'solr'],
  'expect': ['spec', 'test', 'assert', 'expect'],
  'mocha': ['tap', 'tdd', 'bdd', 'test', 'mocha'],
  'consul': ['consul'],
}

describe('package.json parser', () => {
  // Check that we read all of the packages from package.json (#5)
  it('should grab a list of all packages', () => {
    expect(pjDeps).toBeAn(Array);
    expect(pjDeps.length).toEqual(targetDeps.length);
    expect(pjDeps).toEqual(targetDeps);
  });
  it('should be able to generate package URLs', () => {
  // Do we get proper urls? (#6)
    let npmURL;
    for (let dep of targetDeps) {
      expect(parser.depURL(dep)).toEqual(`https://www.npmjs.com/package/${dep}`);
    }
  });
  it('should be able to find the packages on npmjs.com', () => {
  // Do we load the page on npm? (#6)
  return parser.fetchNPM('https://www.npmjs.com/package/sequelize')
    .then((result) => {
      console.log(result);
      expect(result).toExist;
    });
    // for (let dep of targetDeps) {
    //
    // }
  });

});

// Check that we grab the keywords from all of the packages in package.json (#6)-

// Check that we grab all of the official repos from Docker (#1)
/*
We should match repos for:
- mongo
- redis
- express
- mySQL
- postgres
- ghost
- solr
- consul
- couchDB
*/


// Check that output is a list of all packages with official repos (#4)
/* Output format example:
  {  mongo : [mongo, mongoose],
  redis: [redis], }
*/
