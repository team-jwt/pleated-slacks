'use strict';

var _packageParser = require('./lib/package-parser');

var parsePackage = _interopRequireWildcard(_packageParser);

var _writeDCompose = require('./lib/writeDCompose');

var writeDCompose = _interopRequireWildcard(_writeDCompose);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }