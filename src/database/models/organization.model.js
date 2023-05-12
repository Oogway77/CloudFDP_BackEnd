const mongoose = require('mongoose');
const isNil = require('lodash/isNil');
const APIError = require('../../utils/apiError');

const { Schema } = mongoose;

const OrganizationSchema = new Schema(
    {
        Organization: String,
        StreetAddress: String,
        Postcode: String,
        City: String,
        Country: String,
        PaymentMethod: String,
        CardHolderName: String,
        CardNumber: String,
        CVC: String,
        ValidThrough: String,
        Status: String,
        AccountType: String,
    },
    { 
        timestamps: true,
        collection: 'organization' 
    }
)

OrganizationSchema.statics = {
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

    async findByName(name) {
        return await this.find({
            Organization: name
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
    async createOrganization(org) {
        try {
            // console.log(org);
            const neworg = new this(org);
            neworg.save();
            return neworg;
        } catch (err) {
            throw APIError.databaseError(err);
        }
    },
    async update(filter, data) {
        return this.findOneAndUpdate(filter, data, { new: true }).exec();
    },

    async findOneAndUpdateOrg(filter, data) {
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

    async save1(org) {
        return this.findOneAndUpdateOrg({ _id: org._id }, org);
    },
    async updateOrgData(org, data) {
        try {
            const { _id } = org;
            return this.update({ _id }, { $set: data });
        } catch (err) {
            throw APIError.databaseError(err);
        }
    },
    async deleteOrg(_id) {
        try {
            return this.remove({ _id });
        } catch (err) {
            throw APIError.databaseError(err);
        }
    }
}

const model = mongoose.model('organization', OrganizationSchema);

module.exports = model;
