const mongoose = require('mongoose');
const isNil = require('lodash/isNil');
const APIError = require('../../utils/apiError');

const { Schema } = mongoose;

const DataPointSchema = new Schema(
    {
        DataPointName: String,
        TypeOfDataPoint: String,
        Region: String,
        Status: String,
        Country: String,
        Version: String,
        CreatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        OrganizationId: {
            type: Schema.Types.ObjectId,
            ref: 'organization'
        },
        BeCiName: String,
        FeCiName: String,
        DeployedLink: String,
        SharedFDPName: String,
        SharedMongoName: String,
        SharedBlazeName: String,    
    },
    { 
        timestamps: true ,
        collection: 'datapoint' 
    }
)

DataPointSchema.statics = {
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
    async createDataPoint(dp) {
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

    async findOneAndUpdateDP(filter, data) {
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
        return this.findOneAndUpdateDP({ _id: dp._id }, dp);
    },
    async updateDPData(dp, data) {
        try {
            const { _id } = dp;
            return this.update({ _id }, { $set: data });
        } catch (err) {
            throw APIError.databaseError(err);
        }
    },
    async deleteDP(_id) {
        try {
            return this.remove({ _id });
        } catch (err) {
            throw APIError.databaseError(err);
        }
    },
}

const model = mongoose.model('datapoint', DataPointSchema);

module.exports = model;
