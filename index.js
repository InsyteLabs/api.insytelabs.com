'use strict';

require('dotenv').config();

const express    = require('express'),
      server     = express(),
      bodyParser = require('body-parser');

const isProd = process.env.NODE_ENV === 'production';

server.set('case sensitive routing', true);
// If running behind Nginx proxy
server.enable('trust proxy');

// Accept form data
const jsonBody = bodyParser.json(),
      urlBody  = bodyParser.urlencoded({ extended: true });
server.use(jsonBody, urlBody);

// Remove 'X-Powered-By' header, enable CORS
server.use((req, res, next) => {
    res.removeHeader('X-Powered-By');

    res.header('Access-Control-Allow-Origin', isProd ? 'insytelabs.com' : '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    next();
});

const routes = require('./routes');
server.use(routes);

server.listen(8888, () => console.log('Express server listening on 8888'));
