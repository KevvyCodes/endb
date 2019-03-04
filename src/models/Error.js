'use strict';

class EndbError extends Error {
    constructor(message, name = 'EndbError') {
        super();
        Error.captureStackTrace(this, this.constructor);
        this.name = name;
        this.message = message;
    }
}

module.exports = EndbError;