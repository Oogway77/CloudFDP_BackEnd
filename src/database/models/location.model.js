const mongoose = require('mongoose');
const isNil = require('lodash/isNil');
const APIError = require('../../utils/apiError');

const { Schema } = mongoose;

const LocationSchema = new Schema(
    {
        location: String,
        region: String,
        count: Number,
    },
    { 
        timestamps: true ,
        collection: 'location' 
    }
)

LocationSchema.statics = {
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
    async createLocation(dp) {
        try {
            const newdp = new this(dp);
            newdp.save();
            return newdp;
        } catch (err) {
            throw APIError.databaseError(err);
        }
    },
    async update(filter, data) {
        return this.findOneAndUpdate(filter, data, { new: true }).exec();
    },

    async findOneAndUpdateLocation(filter, data) {
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

    async save1(dp) {
        return this.findOneAndUpdateLocation({ _id: dp._id }, dp);
    },
    async updateLocationData(dp, data) {
        try {
            const { _id } = dp;
            return this.update({ _id }, { $set: data });
        } catch (err) {
            throw APIError.databaseError(err);
        }
    },
    async deleteLocation(_id) {
        try {
            return this.remove({ _id });
        } catch (err) {
            throw APIError.databaseError(err);
        }
    },
}

const model = mongoose.model('location', LocationSchema);

module.exports = model;
