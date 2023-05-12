const Organization = require('../../database/models/organization.model');
const Log = require('../../database/models/log.model');

const { ObjectId } = require('mongodb');

const logger = require('../../utils/logger');

const createOrganization = async (req, res) => {
    logger.info("Create Organization");
    // const {Organization, StreetAddress, PostCode, City, Country, PaymentMethod, CardHolderName, CardNumber, CVC, ValidThrough} = req.body;
    const org = req.body;
    const savedOrg = await Organization.createOrganization(org);
    res.status(200).send({
        code: 1,
        msg: "Create Organization Success",
        data: {
            "organization": savedOrg
        }
    })
}

const updateOrganization = async (req, res) => {
    logger.info("Update Organization");
    // const { id, Organization, StreetAddress, PostCode, City, Country, PaymentMethod, CardHolderName, CardNumber, CVC, ValidThrough } = req.body;
    const org = req.body;
    const { engineUser } = req;
    if(engineUser.role == "User" || org._id.toString() != engineUser.organizationId.toString()) {
        res.status(200).send({
            code: 0,
            msg: "Failed, permission denied"
        })
        return;
    }
    await Log.createLog({
        UserId: engineUser._id,
        Activity: "Organization Updated",
        Content: "Success",
    })
    const savedOrg = await Organization.save1(org);
    res.status(200).send({
        code: 1,
        msg: "Update Organization Success",
        data: {
            "organization": savedOrg
        }
    })
}

const updateOrganizationStatus = async (req, res) => {
    logger.info("Activate/Deactivate Organization");
    const { engineUser } = req;
    if(engineUser.role != "SuperAdmin") {
        res.status(200).send({
            code: 0,
            msg: "Failed, permission denied"
        })
        return;
    }

    const { OrganizationId, Status } = req.body;
    let dp = { _id: ObjectId(OrganizationId) }
    let data = { Status: Status } // Active, Inactive
    // console.log(Id, Status);
    await Organization.updateOrgData(dp, data);
    res.status(200).send({
        code: 1,
        msg: "Success"
    })
}

const getAllOrganization = async (req, res) => {
    console.log("Organization List");
    const { engineUser } = req;
    if(engineUser.role != "SuperAdmin") {
        res.status(200).send({
            code: 0,
            msg: "Failed, permission denied"
        })
        return;
    }
    let result = await Organization.find({});
    let data = [];
    for(let i = 0 ; i < result.length ; i++){
        if(result[i].Organization != "SuperAdmin"){
            data.push(result[i])
            // console.log(result[i].Organization)
        }
    }
    
    res.status(200).send({
        code: 1,
        msg: "Success",
        data: {
            list: data
        }
    })
}

const selectOrganization = async (req, res) => {
    console.log("Organization List");
    const { engineUser } = req;
    if(engineUser.role != "SuperAdmin") {
        res.status(200).send({
            code: 0,
            msg: "Failed, permission denied"
        })
        return;
    }
    const { OrganizationId } = req.body;
    // console.log(Id);
    let result = await Organization.find({ _id: ObjectId(OrganizationId) });
    if(result.length == 0){
        res.status(200).send({
            code: 0,
            msg: "Organization not exist",
        })
    }else{
        res.status(200).send({
            code: 1,
            msg: "Success",
            data: result[0],
        })
    }
}

const getOrganization = async (req, res) => {
    console.log("Organization List");
    const { engineUser } = req;
    if(engineUser.role == "User") {
        res.status(200).send({
            code: 0,
            msg: "Failed, permission denied"
        })
        return;
    }
    // console.log(Id);
    let result = await Organization.find({ _id: ObjectId(engineUser.organizationId) });
    if(result.length == 0){
        res.status(200).send({
            code: 0,
            msg: "Organization not exist",
        })
    }else{
        res.status(200).send({
            code: 1,
            msg: "Success",
            data: result[0],
        })
    }
}

const deleteOrganization = async (req, res) => {
    logger.info("Delete Organization");
    const { OrganizationId } = req.body;
    const { engineUser } = req;
    if(engineUser.role != "SuperAdmin") {
        res.status(200).send({
            code: 0,
            msg: "Failed, permission denied"
        })
        return;
    }
    const orgData = Organization.find({_id: OrganizationId});
    if(orgData.length == 0){
        res.status(200).send({
            code: 0,
            msg: "Organization was removed."
        })
        return;
    }
    if(orgData.Organization == "SuperAdmin"){
        res.status(200).send({
            code: 0,
            msg: "Failed, permission deinied."
        })
    }
    await Organization.deleteOrg( ObjectId(OrganizationId) );
    res.status(200).send({
        code: 1,
        msg: "Delete Organization Success",
    })
}

module.exports = {
    createOrganization,
    updateOrganization,
    getAllOrganization,
    deleteOrganization,
    selectOrganization,
    getOrganization,
    updateOrganizationStatus,
}
