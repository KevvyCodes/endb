'use strict';

module.exports = {
  Database: require('./models/Database'),
  Error: require('./models/Error'),
  version: require('../package.json').version,
};