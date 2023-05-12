const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const getEvent = {
    body: {
        Id: Joi.ObjectId().required(),
    },
};

const getEvents = {
    body: {
        Id: Joi.ObjectId().required(),
        PageNo: Joi.number().integer().required(),
        PageSize: Joi.number().integer().required(),
    },
}

const createEvent = {
    body: {
        EventType: Joi.string().required(),
        UserId: Joi.ObjectId().required(),
    },
}

const updateEvent = {
    body: {
        Id: Joi.ObjectId().required(),
        EventType: Joi.string().required(),
        UserId: Joi.ObjectId().required(),
    },
}

module.exports = {
    createEvent,
    updateEvent,
    getEvent,
    getEvents,
}
