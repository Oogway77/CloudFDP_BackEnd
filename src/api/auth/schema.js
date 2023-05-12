const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const { DEFAULT_ROLES, USER_STATUS } = require('../../config/config');

const createUserSchema = {
    body: {
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
        role: Joi.string().valid(...DEFAULT_ROLES),
    },
};

const createAdminSchema = {
    body: {
        Email: Joi.string().email().required(),
        Password: Joi.string().required(),
        Firstname: Joi.string().required(),
        Lastname: Joi.string().required(),
        // Role: Joi.string().valid(...DEFAULT_ROLES),
        Organization: Joi.string().required(),
        StreetAddress: Joi.string().required(),
        Postcode: Joi.string().required(),
        City: Joi.string().required(),
        Country: Joi.string().required(),
    },
}

const updateUserStatus = {
    body: {
        Id: Joi.objectId().required(),
        Status: Joi.string().valid(...USER_STATUS),
    }
}
const updateRole = {
    body:{
        Id: Joi.objectId().required(),
        Role: Joi.string().valid(...DEFAULT_ROLES),
    }
}
const signinSchema = {
    body: {
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    },
};
const getEmailByToken = {
    body: {
        token: Joi.string().required(),
    }
}
const inviteUserSchema = {
    body: {
        email: Joi.string().email().required(),
        role: Joi.string().valid(...DEFAULT_ROLES),
    }
}

const userIdSchema = {
    params: {
        Id: Joi.objectId(),
    },
};

const IdSchema = {
    body: {
        Id: Joi.objectId().required(),
    },
};

const OrganizationIdSchema = {
    body:{
        OrganizationId: Joi.objectId().required(),
    }
}

const getRecentActivities = {
    body: {
        Id: Joi.objectId().required(),
        PageNo: Joi.number().integer().required(),
        PageSize: Joi.number().integer().required(),
    },
};

const setAvatarSchema = {
    file: { buffer: Joi.binary().required() },
};

const setProfileSchema = {
    body: {
        profile: Joi.object(),
        username: Joi.string().required(),
        firstname: Joi.string(),
        lastname: Joi.string(),
        location: Joi.object().keys({
            longitude: Joi.number().min(-180).max(180),
            latitude: Joi.number().min(-90).max(90),
        }),
    },
};


module.exports = {
    createAdminSchema:createAdminSchema,
    signup: createUserSchema,
    signin: signinSchema,
    getEmailByToken: getEmailByToken,
    inviteUser: inviteUserSchema,
    updateUserStatus:updateUserStatus,
    userIdSchema: userIdSchema,
    IdSchema: IdSchema,
    getRecentActivities: getRecentActivities,
    updateRole: updateRole,
    OrganizationIdSchema: OrganizationIdSchema,
    // getAvatar: userIdSchema,
    // setProfile: setProfileSchema,
    // setAvatar: setAvatarSchema,
    // setActiveCompany: setActiveCompanySchema,
    // getUserDetails: userIdSchema,
};
