const mongoose = require('mongoose');
const isNil = require('lodash/isNil');
const APIError = require('../../utils/apiError');

const { Schema } = mongoose;

const EventSchema = new Schema(
    {
        EventType: String,
        UserId: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
    },
    { 
        timestamps: true,
        collection: 'event' 
    }
)

EventSchema.statics = {
    async get(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            const error = 'provided ID is not valid';
            throw new Error(error);
        }
        return this.findById(id).exec();
    },

    async findByIds(ids) {
        return await this.find({
            _id: {
                $in: ids,
            },
        });
    },

    async list(filter, { skip = 0, limit = 50 } = {}) {
        return this.find(filter)
            .skip(skip)
            .limit(limit)
            .exec();
    },

    async create(data) {
        const { _id } = data;
        const filter = { _id };
        return this.findOneAndUpdate(filter, data, {
            new: true,
            upsert: true,
            returnNewDocument: true,
        }).exec();
    },
    async createEvent(event) {
        try {
            const newevent = new this(event);
            newevent.save();
            return newevent;
        } catch (err) {
            throw APIError.databaseError(err);
        }
    },
    async update(filter, data) {
        return this.findOneAndUpdate(filter, data, { new: true }).exec();
    },

    async findOneAndUpdateEvent(filter, data) {
        try {
            return this
                .findOneAndUpdate(filter, data, {
                    new: true,
                    returnNewDocument: true,
                })
                .exec();
        } catch (err) {
            throw APIError.databaseError(err);
        }
    },

    async save1(event) {
        return this.findOneAndUpdateEvent({ _id: event._id }, event);
    },
    async updateEventData(event, data) {
        try {
            const { _id } = event;
            return this.update({ _id }, { $set: data });
        } catch (err) {
            throw APIError.databaseError(err);
        }
    },
}

const model = mongoose.model('event', EventSchema);

module.exports = model;
