'use strict';

const express    = require('express'),
      server     = express(),
      setup      = require('./setup'),
      routes     = require('./routes');

setup(server);
server.use(routes);

const { PORT } = process.env;
server.listen(PORT, () => {
    console.log(`Express server listening on ${ PORT }`)
});
