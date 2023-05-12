const mongoose = require('mongoose');

const config = require('../config/config');
const logger = require('../utils/logger');
const Web3 = require('web3');
const web3 = new Web3();
const bcrypt = require('bcrypt');

const {
    BCRYPT_SALTROUNDS,
    LOCATIONS,
} = require('../config/config');


const UserModel = require('./models/user.model');
const LocationModel = require('./models/location.model');
const OrgModel = require('./models/organization.model');

async function init() {
    // const url = config.MONGO_URL; //+'/'+config.MONGO_DATABASE_NAME;
    const url = config.MONGO_URL+'/'+config.MONGO_DATABASE_NAME;
    // console.log(url);
    const options = {
        autoIndex: false,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 500,
        poolSize: 500,
        bufferMaxEntries: 0,
        socketTimeoutMS: 0,
        keepAlive: true,
    };
    await mongoose.connect(url, options);
    logger.info('DB connection is established');

    // init database
    let existingOrg = await OrgModel.find({Organization: "SuperAdmin"});
    let superOrg;
    if(existingOrg.length == 0){
        const data = {
            Organization: "SuperAdmin",
            StreetAddress: "",
            Postcode: "",
            City: "",
            Country: "",
            Status: "Active"
        }
        superOrg = await OrgModel.createOrganization(data);    
    }else{
        superOrg = existingOrg[0];
    }
    const users = await UserModel.find({role: "SuperAdmin"});
    let superAmdin;
    if(users.length == 0){
        const data = {
            firstname: "Super",
            lastname: "Admin",
            organizationId: superOrg._id,
            password: bcrypt.hashSync(web3.sha3("password"), BCRYPT_SALTROUNDS),
            role: "SuperAdmin",
            email: "wfranke@thesis.nl",
            status: "Active",
        }
        superAdmin = await UserModel.createUser(data);
    }else{
        superAmdin = users[0];
    }

    const locations = await LocationModel.find({});
    
    if(locations.length == 0){
        for(let key in LOCATIONS){
            for(let i = 0 ; i < LOCATIONS[key].length ; i ++){
                const data = {
                    location: LOCATIONS[key][i],
                    region: key,
                    count: 0,
                }
                await LocationModel.createLocation(data);
            }
        }
    }
}

module.exports = { init };
