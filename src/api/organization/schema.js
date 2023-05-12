const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const { ORG_STATUS } = require('../../config/config');

const createOrganizationSchema = {
    body: {
        Organization: Joi.string().required(),
        StreetAddress: Joi.string().required(),
        PostCode: Joi.string().required(),
        City: Joi.string().required(),
        Country: Joi.string().required(),
        PaymentMethod: Joi.string().required(),
        CardHolderName: Joi.string().required(),
        CardNumber: Joi.string().required(),
        CVC: Joi.string().required(),
        ValidThrough: Joi.string().required(),
        Status: Joi.string().valid(...ORG_STATUS),
    },
};

const updateOrganizationSchema = {
    body: {
        Organization: Joi.string().required(),
        StreetAddress: Joi.string().required(),
        PostCode: Joi.string().required(),
        City: Joi.string().required(),
        Country: Joi.string().required(),
        PaymentMethod: Joi.string().required(),
        CardHolderName: Joi.string().required(),
        CardNumber: Joi.string().required(),
        CVC: Joi.string().required(),
        ValidThrough: Joi.string().required(),
        Status: Joi.string().valid(...ORG_STATUS),
    },
};

const updateOrganizationStatusSchema = {
    body: {
        OrganizationId: Joi.objectId().required(),
        Status: Joi.string().valid(...ORG_STATUS),
    },
};

const selectOrganizationSchema = {
    body:{
        OrganizationId: Joi.objectId().required(),
    }
}

const selectListOrganizationsSchema = {
    body:{

    }
}
module.exports = {
    createOrganizationSchema,
    updateOrganizationSchema,
    updateOrganizationStatusSchema, 
    selectOrganizationSchema,
    selectListOrganizationsSchema
}