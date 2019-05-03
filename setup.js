'use strict';

const bodyParser = require('body-parser');

const jsonBody = bodyParser.json(),
      urlBody  = bodyParser.urlencoded({ extended: true });

module.exports = function setup(server){

    server.set('case sensitive routing', true);

    // For Nginx reverse proxy
    server.enable('trust proxy');

    // Accept form data
    server.use(jsonBody, urlBody);

    server.use((req, res, next) => {
        res.removeHeader('X-Powered-By');

        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

        next();
    });
}
