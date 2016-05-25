'use strict';

const expect = require('expect');
const fs = require('fs');

// File we're testing
const parser = require('../lib/package-parser.js')
let pjDeps = parser.dependencies('./test/fixtures/package-test.json')

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

describe('package.json parser', () => {
  // Check that we read all of the packages from package.json (#5)
  it('should grab a list of all packages', () => {
    expect(pjDeps).toBeAn(Array);
    expect(pjDeps.length).toEqual(targetDeps.length);
    expect(pjDeps).toEqual(targetDeps);
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
