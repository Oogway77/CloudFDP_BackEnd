const mongoose = require('mongoose');
const isNil = require('lodash/isNil');
const APIError = require('../../utils/apiError');

const { Schema } = mongoose;

const UserSchema = new Schema(
    {
        firstname: String,
        lastname: String,
        email: String,
        password: String,
        organizationId: mongoose.Types.ObjectId,
        role: String,
        status: String,
        avatar: String,
        token: String,
        expirationTime: Number,
        profile: String,
    },
    { 
        timestamps: true ,
        collection: 'user' 
    }
)

UserSchema.statics = {
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

    async update(filter, data) {
        return this.findOneAndUpdate(filter, data, { new: true }).exec();
    },
    async findUserByToken(token) {
        try {
            if (!token) return;
            return this.findOne({ token }).exec();
        } catch (err) {
            throw APIError.databaseError(err);
        }
    },
    async findUserByEmailAndPassword(user) {
        try {
            return this.findOne(user).exec();
        } catch (err) {
            throw APIError.databaseError(err);
        }
    },
    async createUser(user) {
        try {
            const newUser = new this(user);
            newUser.save();
            return newUser;
        } catch (err) {
            throw APIError.databaseError(err);
        }
    },
    async getUserByEmail(email) {
        try {
            return this.findOne({
                email: {
                    $regex: new RegExp(email, 'i'),
                },
            });
        } catch (err) {
            throw APIError.databaseError(err);
        }
    },
    async findUserByEmail(email) {
        try {
            return this.findOne({ email });
        } catch (err) {
            throw APIError.databaseError(err);
        }
    },
    async findOneAndUpdateUser(filter, data) {
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

    async save1(user) {
        return this.findOneAndUpdateUser({ _id: user._id }, user);
    },
    async updateUserData(user, data) {
        try {
            const { _id } = user;
            return this.update({ _id }, { $set: data });
        } catch (err) {
            throw APIError.databaseError(err);
        }
    },
    async deleteUser(_id) {
        try {
            return this.remove({ _id });
        } catch (err) {
            throw APIError.databaseError(err);
        }
    },
}

const model = mongoose.model('user', UserSchema);

module.exports = model;
