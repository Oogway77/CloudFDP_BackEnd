const mongoose = require('mongoose');
const isNil = require('lodash/isNil');
const APIError = require('../../utils/apiError');

const { Schema } = mongoose;

const LogSchema = new Schema(
    {
        Activity: String,
        Content: String,
        UserId: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        AffectedId: {
            type: Schema.Types.ObjectId,
            ref: 'user' 
        }
    },
    { 
        timestamps: true,
        collection: 'log' 
    }
)

LogSchema.statics = {
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
    async createLog(logg) {
        try {
            const newlogg = new this(logg);
            newlogg.save();
            return newlogg;
        } catch (err) {
            throw APIError.databaseError(err);
        }
    },
    async update(filter, data) {
        return this.findOneAndUpdate(filter, data, { new: true }).exec();
    },

    async findOneAndUpdateLog(filter, data) {
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

    async save1(logg) {
        return this.findOneAndUpdateLog({ _id: logg._id }, logg);
    },
    async updateLogData(logg, data) {
        try {
            const { _id } = logg;
            return this.update({ _id }, { $set: data });
        } catch (err) {
            throw APIError.databaseError(err);
        }
    },
}

const model = mongoose.model('log', LogSchema);

module.exports = model;
