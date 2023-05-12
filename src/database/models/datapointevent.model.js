const mongoose = require('mongoose');
const isNil = require('lodash/isNil');
const APIError = require('../../utils/apiError');

const { Schema } = mongoose;

const DataPointEvent = new Schema(
    {
        EventType: String,
        RetrievedBy: String,
        DataPointId: {
            type: Schema.Types.ObjectId,
            ref: 'datapoint'
        },
    },
    { 
        timestamps: true,
        collection: 'datapointevent' 
    }
)

DataPointEvent.statics = {
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
    async createDataPointEvent(dpe) {
        try {
            const newdpe = new this(dpe);
            newdpe.save();
            return newdpe;
        } catch (err) {
            throw APIError.databaseError(err);
        }
    },
    async update(filter, data) {
        return this.findOneAndUpdate(filter, data, { new: true }).exec();
    },

    async findOneAndUpdateDPE(filter, data) {
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

    async save1(dpe) {
        return this.findOneAndUpdateDPE({ _id: dp._id }, dpe);
    },
    async updateDPEData(dpe, data) {
        try {
            const { _id } = dpe;
            return this.update({ _id }, { $set: data });
        } catch (err) {
            throw APIError.databaseError(err);
        }
    },
}

const model = mongoose.model('datapointevent', DataPointEvent);

module.exports = model;
