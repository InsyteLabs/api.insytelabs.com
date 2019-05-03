'use strict';

const fs   = require('fs'),
      path = require('path');

const router = require('express').Router(),
      nodemailer = require('nodemailer');

const { serverError, clientError } = require('./lib/http-helper');

// Default Route
router.get('/', (req, res, next) => res.json({ message: 'Insyte Labs API Server' }));

// Healthcheck
router.get('/healthcheck', (req, res, next) => res.json({ message: 'OK' }));

router.post('/forms/contact', async (req, res, next) => {
    const { firstName, lastName, email, message } = req.body;

    if(!(firstName && lastName && email && message)){
        return clientError(res, 'First name, last name, email, and message fields required');
    }
    if(!/.*?@.+\..{2,}/.test(email)){
        return clientError(res, 'Invalid email');
    }

    let result;
    try{
        result = await sendMail(firstName, lastName, email, message);
    }
    catch(e){ return serverError(res, e) }

    try{
        result.date = new Date();
        result.data = { firstName, lastName, email, message }

        saveResult(result);
    }
    catch(e){ /* Do nothing */ }

    return res.json({
        message: 'success',
        data: {
            firstName, lastName, email, message
        }
    });
});

async function sendMail(firstName, lastName, email, body){
    const transport = nodemailer.createTransport({
        host: 'friday.mxlogin.com',
        port: 465,
        secure: true, // TLS
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    try{ await transport.verify() }
    catch(e){ throw e }

    try{
        const message = createMessage(firstName, lastName, email, body);

        return transport.sendMail(message)
    }
    catch(e){ throw e }
}

function createMessage(firstName, lastName, email, message){
    return {
        from: {
            name:    process.env.MAIL_NAME,
            address: process.env.MAIL_USER
        },
        to: {
            name:    process.env.RECIPIENT_NAME,
            address: process.env.RECIPIENT_EMAIL
        },
        cc: {
            name:    process.env.MAIL_NAME,
            address: process.env.MAIL_USER
        },
        subject: `InsyteLabs Contacted by ${ firstName } ${ lastName }`,
        text: `From: ${ firstName } ${ lastName }\nEmail: ${ email }\n\n${ message }`,
        html: `
            <table>
                <tbody>
                    <tr>
                        <th>Name</th>
                        <td>${ firstName } ${ lastName }</td>
                    </tr>
                    <tr>
                        <th>Email</th>
                        <td>${ email }</td>
                    </tr>
                    <tr>
                        <th>Message</th>
                        <td>${ message }</td>
                    </tr>
                </tbody>
            </table>
        `
    }
}

async function saveResult(result){
    const filePath = path.resolve(__dirname, 'data/submissions.json'),
          data     = await loadJSON(filePath);

    data.push(result);

    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', err => {
            if(err){
                console.error(`Error saving data to path ${ filePath }`);
                return reject(err);
            }
            resolve(true);
        });
    });
}

function loadJSON(path){
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if(err) return resolve([]);

            try{
                resolve(JSON.parse(data));
            }
            catch(e){ resolve([]) }
        });
    });
}

module.exports = router;
