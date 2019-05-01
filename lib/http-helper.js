'use strict';

const httpHelper = {
    serverError(res, e, message='Server Error'){
        if(process.env.NODE_ENV === 'production'){
            return res.status(500).json({ message });
        }
        return res.status(500).json({
            error: e.message,
            stack: e.stack,
            errorObject: e
        });
    },
    clientError(res, message='Client Error'){
        return res.status(400).json({ message });
    }
}

module.exports = httpHelper;
