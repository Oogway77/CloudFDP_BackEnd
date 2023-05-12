const Event = require('../../database/models/event.model');
const logger = require('../../utils/logger');
const { ObjectId } = require('mongodb');

const createEvent = async (req, res) => {
    logger.info("Create Event");
    const dp = req.body;
    const savedDP = await Event.CreateEvent(dp);
    res.status(200).send({
        code: 1,
        msg: "Create Event Success",
        data: {
            "Event": savedDP
        }
    })
}

const updateEvent = async (req, res) => {
    logger.info("Update Event");
    const dp = req.body;
    const savedDP = await Event.save1(dp);
    res.status(200).send({
        code: 1,
        msg: "Update Event Success",
        data: {
            "Event": savedDP
        }
    })
}

const getEvents = async (req, res) => {
    console.log("Event List");
    const { PageNo, PageSize, Id } = req.body
    const param = { skip: (PageNo-1)*PageSize, limit: PageSize };
    let result = await Event.list({ UserId: ObjectId(Id)}, param );
    res.status(200).send({
        code: 1,
        msg: "Success",
        data: {
            list: result
        }
    })
}

const selectEvent = async (req, res) => {
    console.log("Event List");
    const { Id } = req.body;
    let result = await Event.find({ _id: ObjectId(Id) });
    res.status(200).send({
        code: 1,
        msg: "Success",
        data: {
            Event: result
        }
    })
}

module.exports = {
    createEvent,
    updateEvent,
    getEvents,
    selectEvent, 
}