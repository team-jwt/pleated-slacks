'use strict';

const expect = require('expect');

// Check that we read all of the packages from package.json (#5)


// Check that we grab the keywords from all of the packages in package.json (#6)


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
