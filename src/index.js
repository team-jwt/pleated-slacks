import * as parsePackage from './lib/parsePackage';
import * as writeDCompose from './lib/writeDCompose';
import * as writeDockerfile from './lib/writeDockerfile';

/**
 * need to add flow for calling all functions from above modules
 */


/* create formatted links to include in docker-compose.yml */
const links = writeDCompose.formatLinks(VARIABLE); // => get var from parsePackage

/* create formatted services to include in docker-compose.yml*/
const services = writeDCompose.formatServices(VARIABLE);

/* create docker-compose content string */
const composeStr = writeDCompose.createCompose(links, services);

/* write docker-compose.yml file containing composeStr */
writeDCompose.writeFile(composeStr);
