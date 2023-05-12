const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const createDataPoint ={ 
    body:{
        DataPointName: Joi.string().required(),
        TypeOfDataPoint: Joi.string().required(),
        Region: Joi.string().required(),
        // Status: Joi.string().required(),
        // Version: Joi.string().required(),
        // CreatedBy: Joi.objectId().required()
    }
}

const updateDataPoint ={ 
    body:{
        Id: Joi.objectId().required(),
        DataPointName: Joi.string().required(),
        TypeOfDataPoint: Joi.string().required(),
        Region: Joi.string().required(),
        Status: Joi.string().required(),
        Version: Joi.string().required(),
        CreatedBy: Joi.objectId().required()
    }
}

const selectDataPoint = {
    body: {
        Id: Joi.objectId().required(),
    },
};

const selectOrgDataPoint = {
    body: {
        OrganizationId: Joi.objectId().required(),
    },
};

const deleteDataPoint = {
    body: {
        Id: Joi.objectId().required(),
    },
};

const updateStatus = {
    body:{
        Id: Joi.objectId().required(),
        Status: Joi.string().required(),
    }
}
const getRecentActivities = {
    body: {
        Id: Joi.objectId().required(),
        PageNo: Joi.number().integer().required(),
        PageSize: Joi.number().integer().required(),
    },
};

module.exports = {
    createDataPoint,
    updateDataPoint,
    selectDataPoint,
    deleteDataPoint,
    updateStatus,
    selectOrgDataPoint,
    getRecentActivities
}