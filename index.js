'use strict';

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
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

// Enable CORS requests from insytelabs.com
server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', isProd ? 'insytelabs.com' : '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

server.get('/', (req, res, next) => res.json({ message: 'Insyte Labs API Server' }));
server.get('/healthcheck', (req, res, next) => res.json({ message: 'OK' }));

server.post('/forms/contact', (req, res, next) => {
    const { firstName, lastName, email, message } = req.body;

    if(!(firstName && lastName && email && message)){
        return res.status(400).json({
            message: 'firstName, lastName, email, and message fields required'
        });
    }
    if(!/.*?@.+\..{2,}/.test(email)){
        return res.status(400).json({
            message: 'email must match pattern /.*?@.+\..{2,}/'
        });
    }

    return res.json({
        message: 'Accepted',
        data: {
            firstName, lastName, email, message
        }
    });
});

server.listen(8888, () => console.log('Express server listening on 8888'));
