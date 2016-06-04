'use strict';

const vorpal = require('vorpal');
const Promise = require('bluebird');
const fs = require('fs');

const cli = {};
/**
* The CLI is called with $ slacks
* There are 3 options
* -c --create -p --pleat (default) Creates a new Docker setup
* -f --force --press Overwrites an existing Docker setup in the format Pleated Slacks uses
* -u --up -w --wear Launches the Docker setup using the script we created
* -d --down -l --launder Turns off the Docker setup using the script we created
* -h --help Provides info on what the command does
**/

const helpText = `-c --create -p --pleat (default) Creates a new Docker setup
-f --force --press Overwrites an existing Docker setup in the format Pleated Slacks uses
-u --up -w --wear Launches the Docker setup using the script we created
-d --down -l --launder Turns off the Docker setup using the script we created
-h --help Provides info on what the command does`

cli.registerCommands = function registerCommands() {
  /**
  * Registers all of the Vorpal command structures for the script
  * Call this method first.
  * @param {none}
  * @returns {boolean} true/exit with error if fails
  * @private
  **/
  vorpal.command('slacks')
    .option('-c, --create', 'Create your Docker setup')
    .option('-p, --pleat', 'Create your Docker setup')
    .option('-f, --force', 'Overwrite existing Docker setup')
    .option('-u, --up', 'Launch your Docker setup')
    .option('-w, --wear', 'Launch your Docker setup')
    .option('-d, --down', 'Turn off your Docker setup')
    .option('-l, --launder', 'Turn off your Docker setup')
    .help(function() {
      this.log(helpText);
    })
    .action(function(args, cb){
      this.log(args);
    });
}


cli.createDocker = function createDocker() {
  /**
  * Kicks off the build of a new Docker setup
  * Checks if we've already made one and refuses to create another
  * Unless you -f force it.
  * @param {none}
  * @return {array} the result of packageParser.matchDependences
  * an Array of required Docker modules, e.g. [node, mongo, redis]
  **/
  console.log('createDocker');
}

cli.upDocker = function upDocker() {
  /**
  * Launches our Docker setup.
  * @param {none}
  * @return {none}, but the script should write something to the console.
  **/
  console.log('upDocker');
}

cli.downDocker = function downDocker() {
  /**
  * Turns off our Docker setup.
  * @param {none}
  * @return {none}, but the script should write something to the console.
  **/
  console.log('downDocker');
}

cli.registerCommands();
