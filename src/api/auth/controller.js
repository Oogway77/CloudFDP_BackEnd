const isEmpty = require('lodash/isEmpty');
const Web3 = require('web3');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

const User = require('../../database/models/user.model');
const DataPointModel = require('../../database/models/datapoint.model');
const Log = require('../../database/models/log.model');
const OrganizationModel  = require('../../database/models/organization.model');

const APISuccess = require('../../utils/successResponses');
const APIError = require('../../utils/apiError');
const logger = require('../../utils/logger');

const adapter = require('./adapter')
const setSessionCookie = require('../../utils/sessionCookie');
const web3 = new Web3();
const {
    BCRYPT_SALTROUNDS,
} = require('../../config/config');

const createAdmin = async(req, res) => {
    const {
        Email, Password, Firstname, Lastname, Organization, StreetAddress, Postcode, City, Country
    } = req.body;
    const Role = "Admin";

    const existingUser = await User.getUserByEmail(Email);
    if (existingUser) {
        // throw APIError.userFoundError();
        res.status(200).send({
            code: 0,
            msg: "Failed, existing user"
        });
        return;
    }

    let existingOrg = await OrganizationModel.findByName(Organization);
    if (!existingOrg || existingOrg.length == 0){
        const data = {
            Organization: Organization,
            StreetAddress: StreetAddress,
            Postcode: Postcode,
            City: City,
            Country: Country,
            Status: "Active"
        }
        existingOrg = await OrganizationModel.createOrganization(data);
    }
    const token = adapter.generateToken();

    const expirationTime = adapter.calcExpiration();
    const body = {
        firstname: Firstname,
        lastname: Lastname,
        expirationTime: expirationTime,
        organizationId: existingOrg._id,
        password: bcrypt.hashSync(web3.sha3(Password), BCRYPT_SALTROUNDS),
        email: Email,
        token: token,
        role: Role,
        status: "Active",
    };

    const savedUser = await User.createUser(body);
    // await adapter.applyInvitations(savedUser);
    const user = await adapter.fitUser(savedUser);
    await Log.createLog({
        UserId: user._id,
        AffectedId: user._id,
        Activity: "Account Creation",
        Content: "Success",
    })
    res.status(200).send({ 
        code: 1,
        data:{
            // user: user,
        },
        message: "User Creation Success"
    });
}

const superAdminDashboard = async(req, res) => {
    const { engineUser } = req;
    if(engineUser.role != "SuperAdmin") {
        res.status(200).send({
            code: 0,
            msg: "Failed, permission denied"
        })
        return;
    }
    let data = [];
    const orgs = await OrganizationModel.find({});
    for(let i = 0 ; i < orgs.length ; i ++){
        if(orgs[i].Organization == "SuperAdmin") continue;
        let tmp = {};
        tmp.OrganizationName = orgs[i].Organization;
        const users = await User.find({organizationId: ObjectId(orgs[i]._id)}); // status: "Active"
        tmp.Users = users.length;
        const datapoints = await DataPointModel.find({OrganizationId: ObjectId(orgs[i]._id), Status: "Active"});
        tmp.FAIRDataPoints = datapoints.length;
        tmp.AccountType = "Gold"; // ???
        tmp.Status = orgs[i].Status;
        tmp.Id = orgs[i]._id;
        data.push(tmp);
    }
    res.status(200).send({
        code: 1,
        msg: "Success",
        data: {
            list: data
        }
    })
}

const userDashboard = async(req, res) => {
    const { engineUser } = req;
    const { organizationId } = engineUser;

    let data = {};
    data.Users = [];
    const users = await User.find({organizationId: ObjectId(organizationId)}); // status: "Active"
    for(let i = 0; i < users.length ; i ++){
        if(users[i].role == "SuperAdmin") continue;
        data.Users.push(users[i])
    }
    const datapoints = await DataPointModel.find({OrganizationId: ObjectId(organizationId)});
    const orgs = await OrganizationModel.find({_id: ObjectId(organizationId)})
    data.FAIRDataPoints = datapoints;
    data.AccountType = "Gold"; // ???
    data.Organization = orgs[0].Organization;
    res.status(200).send({
        code: 1,
        msg: "Success",
        data: data
    })
}

const createUser = async (req, res) => {
    logger.info('Create User');

    const { email, password } = req.body;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const role = req.body.role || 'User';

    const existingUser = await User.getUserByEmail(email);
    if (existingUser) {
        res.status(200).send({
            code: 0,
            msg: "Failed, user already exists"
        })
    }

    const token = adapter.generateToken();

    const expirationTime = adapter.calcExpiration();

    const body = {
        firstname,
        lastname,
        expirationTime,
        password: bcrypt.hashSync(web3.sha3(password), BCRYPT_SALTROUNDS),
        email,
        token,
        role,
    };

    const savedUser = await User.createUser(body);
    // await adapter.applyInvitations(savedUser);
    const user = await adapter.fitUser(savedUser);
    await Log.createLog({
        UserId: user._id,
        AffectedId: user._id,
        Activity: "Account Creation",
        Content: "Success",
    })
    res.status(200).send({ 
        code: 1,
        data:{
            user: user,
        },
        message: "User Creation Success"
    });
};

const createUserInvited = async (req, res) => {
    logger.info('Create Invited User');

    const { email, password } = req.body;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const role = req.body.role || 'User';

    let existingUser = await User.getUserByEmail(email);
    if (existingUser && existingUser.status == "Invited") {
        existingUser.firstname = firstname;
        existingUser.lastname = lastname;
        existingUser.role = role;
        existingUser.status = "Inactive"
        existingUser.password = bcrypt.hashSync(web3.sha3(password), BCRYPT_SALTROUNDS);
        existingUser.token = adapter.generateToken();
        existingUser.expirationTime = adapter.calcExpiration();
        existingUser = await User.save1(existingUser);
    }else{
        res.status(200).send({
            code: 0,
            msg: "Failed, invited user not found"
        })
        return;
    }

    const user = await adapter.fitUser(existingUser);
    await Log.createLog({
        UserId: user._id,
        AffectedId: user._id,
        Activity: "Account Creation",
        Content: "Success",
    })
    res.status(200).send({ 
        code: 1,
        data:{
            user: user,
        },
        message: "User Creation Success"
    });
};

const updateUserStatus = async(req, res) => {
    const {engineUser} = req;
    const { Id, Status } = req.body;
    if(engineUser.role == "User"){
        await Log.createLog({
            UserId: engineUser._id,
            AffectedId: Id,
            Activity: `Updated ${engineUser.firstname + ' ' + engineUser.lastname}'s status ${Status}`,
            Content: "Failed, permission denied",
        })
        res.status(200).send({
            code: 0,
            msg: "Failed, permission denied"
        })
        return;
    }
    if(engineUser.role == "Admin" || engineUser.role == "SuperAdmin"){
        if(engineUser._id == Id){
            res.status(200).send({
                code: 0,
                msg: "Failed, permission denied.\nYou couldn't update your account."
            })
            return;    
        }
    }
    let userData = await User.find({_id: ObjectId(Id)})
    if(userData.length == 0){
        res.status(200).send({
            code: 0,
            msg: "Failed, user not found",
        })
        return;
    }
    let data = { status: Status }
    let user = userData[0];
    if(user.status == "Invited") {
        res.status(200).send({
            code: 0,
            msg: "Failed, this user is not registered yet"
        })
        return;
    }
    await User.updateUserData(user, data);
    await Log.createLog({
        UserId: engineUser._id,
        AffectedId: user._id,
        Activity: `Account status updated ${Status}`,
        Content: "Success",
    })
    res.status(200).send({
        code: 1,
        msg: "Success",
    })
}
const UpdateRole = async (req, res) => {
    const {engineUser} = req;
    if(engineUser.role == "User"){
        res.status(200).send({
            code: 0,
            msg: "Failed, permission denied"
        })
        return;
    }
    const { Id, Role } = req.body;
    let user = { _id: ObjectId(Id) }
    let data = { role: Role }
    await User.updateUserData(user, data);
    await Log.createLog({
        UserId: engineUser._id,
        AffectedId: user._id,
        Activity: `Account Role updated to ${Role}`,
        Content: "Success",
    })
    res.status(200).send({
        code: 1,
        msg: "Success",
    })
}
const getEmailForSignup = async (req, res) => {
    let token = req.body.token;
    // console.log(token);
    const user = await User.findUserByToken(token);
    // console.log(user);
    const currentTime = new Date();
    if (!user || user.expirationTime < currentTime) {
        // res.status(401).send(APIError.tokenInvalidError());
        res.status(200).send({
            code: 0,
            msg: "Your token is expired"
        })
        return res.end(); // eslint-disable-next-line consistent-return
    }
    res.status(200).send({
        code: 1,
        data:{
            email: user.email,
            role: user.role,
        },
        msg: "Success"
    })
}

const createUserWithoutAzure = async (req, res) => {
    logger.info('Create User for tests');

    const { email, password } = req.body;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const role = req.body.role || 'Client';

    const existingUser = await User.getUserByEmail(email);
    
    if (existingUser) throw APIError.userFoundError();

    const token = adapter.generateToken();

    const expirationTime = adapter.calcExpiration();

    const body = {
        firstname,
        lastname,
        expirationTime,
        password: bcrypt.hashSync(web3.sha3(password), BCRYPT_SALTROUNDS),
        email,
        token,
        role,
    };

    const savedUser = await User.createUser(body);
    // await adapter.applyInvitations(savedUser);
    const user = await adapter.fitUser(savedUser);
    res.status(200).send({ 
        code: 1,
        data:{
            user: user,
        },
        message: "User Creation Success"
    });
};
const signIn = async (req, res) => {
    logger.info('signIn');

    const { email, password } = req.body;
    const existingUser = await User.findUserByEmail(email);
    if (!existingUser) {
        // throw APIError.userNotFoundError();
        res.status(200).send({
            code: 0, 
            msg: "User Not Found"
        });
        return;
    }
    const match = bcrypt.compareSync(web3.sha3(password), existingUser.password);
    if (!match) {
        // throw APIError.userNotFoundError();
        await Log.createLog({
            UserId: existingUser._id,
            AffectedId: existingUser._id,
            Activity: `Account Login`,
            Content: "Failed, password is not match",
        })
        res.status(200).send({
            code: 0, 
            msg: "Password is not match"
        });
        return;
    }
    const orgData = await OrganizationModel.find({_id: existingUser.organizationId});
    if (existingUser.role != "SuperAdmin" && orgData.length == 0){
        res.status(200).send({
            code: 0,
            msg: "Failed, your organization not exists"
        })
        return;
    }
    if (existingUser.role != "SuperAdmin" && orgData[0].Status != "Active") {
        res.status(200).send({
            code: 0,
            msg: "Failed, your organization is not activated yet"
        })
        return;
    }
    // if (existingUser.role != "SuperAdmin" && existingUser.status != "Active"){
    //     res.status(200).send({
    //         code: 0,
    //         msg: "Failed, your account is not activated yet"
    //     })
    //     return;
    // }

    existingUser.token = adapter.generateToken();
    existingUser.expirationTime = adapter.calcExpiration();
    const result = await User.save1(existingUser);
    const user = await adapter.fitUser(result);
    await Log.createLog({
        UserId: user._id,
        AffectedId: user._id,
        Activity: `Account Login`,
        Content: "Success",
    })
    setSessionCookie(existingUser.token, res);
    res.status(200).send({
        code: 1, 
        data: {
            user: user,
            token: existingUser.token
        },
        msg: "User Login Success"
    });
};
const sendInviteEmail = async (req, res) => {
    logger.info('send invitation email');
    const {engineUser} = req;
    if(engineUser.status == "Inactive"){
        res.status(200).send({
            code: 0,
            msg: "Failed, permission denied."
        })
        return;
    }

    const { email, role } = req.body;
    let token = "";
    const existingUser = await User.getUserByEmail(email);
    let savedUser = {};
    if (existingUser) {
        let orgData = await OrganizationModel.find({_id: engineUser.organizationId});
        if(orgData.length != 0) orgData = orgData[0];
        else orgData = {};

        if(existingUser.status == "Invited"){
            existingUser.token = adapter.generateToken();
            existingUser.expirationTime = adapter.calcExpiration();
            savedUser = await User.save1(existingUser);
            await adapter.sendInviteEmail(engineUser.firstname + ' ' + engineUser.lastname, email, role, savedUser.token, orgData.StreetAddress, orgData.City + ", " + orgData.Country);
            res.status(200).send({
                code: 1,
                msg: "Successfully sent invitation email"
            })
            return;
        }

        res.status(200).send({
            code: 0,
            msg: "Failed, this user is already registered."
        })
        return;
    }else{
        token = adapter.generateToken();

        const expirationTime = adapter.calcExpiration();
    
        const body = {
            expirationTime: expirationTime,
            email: email,
            token: token,
            role: role,
            organizationId: engineUser.organizationId,
            status: "Invited",
        };

        savedUser = await User.createUser(body);    
        let orgData = await OrganizationModel.find({_id: engineUser.organizationId});
        if(orgData.length != 0) orgData = orgData[0];
        else orgData = {};
        await adapter.sendInviteEmail(engineUser.firstname + ' ' + engineUser.lastname, email, role, savedUser.token, orgData.StreetAddress, orgData.City + ", " + orgData.Country);    
    }

    await Log.createLog({
        UserId: engineUser._id,
        AffectedId: savedUser._id,
        Activity: `Invited as ${role}`,
        Content: "Success",
    })

    res.status(200).send({
        code: 1,
        msg: "Successfully sent invitation email"
    })
}

const sendResetPasswordMail = async (req, res) => {
    logger.info('send reset password email');
    // const {engineUser} = req;
    const { email } = req.body;
    let token = "";
    const existingUser = await User.getUserByEmail(email);
    if (existingUser) {
        token = adapter.generateToken();
        const expirationTime = adapter.calcExpiration1(2);
        existingUser.token = token;
        existingUser.expirationTime = expirationTime;
        await User.save1(existingUser);
        if(existingUser.status != "Active"){
            res.status(200).send({
                code: 0,
                msg: "User is not active yet!"
            })
            return;
        }
    }else{
        res.status(200).send({
            code: 0,
            msg: "User Not Found"
        })
        return;
    }

    let orgData = await OrganizationModel.find({_id: existingUser.organizationId});
    if(orgData.length != 0) orgData = orgData[0];
    else orgData = {};

    await adapter.sendResetPWEmail("Wouter Franke", email, token, orgData.StreetAddress, orgData.City + ", " + orgData.Country);

    await Log.createLog({
        UserId: existingUser._id,
        AffectedId: existingUser._id,
        Activity: `Sent an email to reset password`,
        Content: "Success",
    })

    res.status(200).send({
        code: 1,
        msg: "Success to send reset password email"
    })
}
 
const setAccountProfile = async (req, res) => {
    logger.debug('setAccountProfile');

    const {
        profile, username, firstname, lastname, location,
    } = req.body;

    const currentUser = req.engineUser;

    if (profile) {
        if (!currentUser.profile) currentUser.profile = {};
        const { avatar, avatarType } = currentUser.profile;
        currentUser.profile = profile;
        currentUser.profile.avatar = avatar || undefined;
        currentUser.profile.avatarType = avatarType || undefined;
    }
    if (username) currentUser.username = username;
    if (firstname) currentUser.firstname = firstname;
    if (lastname) currentUser.lastname = lastname;
    if (location) {
        if (location.latitude) {
            location.latitude = parseFloat(location.latitude);
        }
        if (location.longitude) {
            location.longitude = parseFloat(location.longitude);
        }
        currentUser.location = location;
    }

    await User.findOneAndUpdate({
        _id: currentUser._id,
    },
    currentUser
    );

    res.status(200).send({ result: await enterAdapter.fitUser(currentUser) });
};
const getAccountProfile = async (req, res) => {
    logger.debug('getAccountProfile');
    const {engineUser} = req;
    const orgData = await OrganizationModel.find({_id: engineUser.organizationId});

    if(orgData.length == 0){
        res.status(200).send({
            code: 0,
            msg: "Failed, your organization is deleted."
        })
        return;
    }
    if(orgData[0].Status == "Inactive"){
        res.status(200).send({
            code: 0,
            msg: "Failed, your organization is not activated yet."
        })
    }
    res.status(200).send({
        // result: await adapter.fitUser(req.engineUser),
        code: 1,
        msg: "Sucess",
        data:{
            user: await adapter.fitUser(req.engineUser),
        }
    });
};
const logoutUser = async (req, res, next) => {
    logger.info('logout User');
    const {engineUser} = req;

    await User.updateUserData(req.engineUser, {
        token: '',
    });
    await Log.createLog({
        UserId: engineUser._id,
        AffectedId: engineUser._id,
        Activity: `Logout`,
        Content: "Success",
    })
    setSessionCookie('', res);
    res.status(200).send({
        code: 1,
        msg: "Logout Success"
    });

    return next();
};
const getUsers = async (req, res) => {
    console.log("User's List");
    const {engineUser} = req;
    // role check.
    if(engineUser.role == "User") {
        res.status(200).send({
            code: 1,
            msg: "Failed, you don't have permission",
        })
        return;
    }
    let result = await User.find({ });
    res.status(200).send({
        code: 1,
        msg: "Success",
        data: {
            list: result
        }
    })
}

const getUsersOfOrganization = async(req, res) => {
    const { OrganizationId } = req.body;
    //role check
    const {engineUser} = req;
    let pass = false;
    if(engineUser.role == "SuperAdmin"){
        pass = true;
    }else if(engineUser.role == "Admin" && engineUser.organizationId == OrganizationId ){
        pass = true;
    }else{
        pass = false;
    }
    if(!pass){
        res.status(200).send({
            code: 0,
            msg: "Failed, permission denied",
        });
        return;
    }
    const users = await User.find({organizationId: ObjectId(OrganizationId)});

    // console.log(users);
    let data = [];
    for(let i = 0 ; i < users.length ; i ++){
        data.push({
            Name: users[i].firstname + " " + users[i].lastname,
            EmailAddress: users[i].email,
            UserRole: users[i].role,
            Status: users[i].status,
            CreatedOn: users[i].createdAt
        })
    }
    res.status(200).send({
        code: 1,
        msg: "Success",
        data: {
            list: data
        }
    })
}

const getUser = async (req, res) => {
    console.log("User Content");
    const {engineUser} = req;
    const { Id } = req.body;
    // role check.
    let result = await User.find({ _id: ObjectId(Id) });
    if(result.length == 0){
        res.status(200).send({
            code: 0,
            msg: "Failed, User not found"
        })
        return;
    }
    let expireDate = new Date(engineUser.expirationTime);
    expireDate.setDate(expireDate.getDate()-7);
    let userData = {};
    userData._id = result[0]._id;
    userData.firstname = result[0].firstname;
    userData.lastname = result[0].lastname;
    userData.role = result[0].role;
    userData.lastLogin = expireDate;
    userData.email = result[0].email;
    userData.createdAt = result[0].createdAt;
    userData.status = result[0].status;
    res.status(200).send({
        code: 1,
        msg: "Success",
        data: userData
    })
}

const getRecentActivities = async (req, res) => {
    const { Id, PageNo, PageSize } = req.body;
    let params = { skip: (PageNo-1)*PageSize, limit: PageSize };
    let total = await Log.find({AffectedId: ObjectId(Id)});
    let result = await Log.list({AffectedId: ObjectId(Id)}, params);
    let data = []
    for(let i = 0 ; i < result.length ; i ++){
        let tmpdata = {};
        let user = await User.find({_id: result[i].UserId});
        if(user.length > 0){
            tmpdata.Username = user[0].firstname + " " + user[0].lastname;
        }else{
            tmpdata.Username = "Deleted user";
        }
        tmpdata.Activity = result[i].Activity;
        tmpdata.Content = result[i].Content;
        tmpdata.createdAt = result[i].createdAt;
        data.push(tmpdata);
    }
    res.status(200).send({
        code: 1,
        msg: "Success",
        data: {
            list: data,
            totalRowCount: total.length
        }
    })
}
const deleteUser = async (req, res) => {
    const {engineUser} = req;
    const {Id} = req.body;
    if(engineUser.role == "User") {
        res.status(200).send({
            code: 0,
            msg: "Failed, permission denied"
        })
        return;
    }
    if(engineUser._id.toString() == Id.toString()){
        res.status(200).send({
            code: 0,
            msg: "Failed, permission denied\nYou couldn't delete your account."
        })
        return;
    }
    await User.deleteUser(ObjectId(Id));

    res.status(200).send({
        code: 1,
        msg: "Success",
    })
}

const updateUserProfile = async(req, res) => {
    const {engineUser} = req;

    const {
        ChangePassword,
        CurrentPassword,
        NewPassword,
        Firstname,
        Lastname,
        Email,
        Avatar,
        // Profile,
    } = req.body;
    if(ChangePassword){
        if(bcrypt.compareSync(web3.sha3(CurrentPassword), engineUser.password)){
            engineUser.password = bcrypt.hashSync(web3.sha3(NewPassword), BCRYPT_SALTROUNDS);
        }else{
            res.status(200).send({
                code: 0,
                msg: "Failed, password not matched"
            })
            return;
        }
    }
    engineUser.firstname = Firstname;
    engineUser.lastname = Lastname;
    engineUser.avatar = Avatar;
    engineUser.email = Email;
    // engineUser.profile = Profile;

    savedUser = await User.save1(engineUser);
    await Log.createLog({
        UserId: engineUser._id,
        AffectedId: engineUser._id,
        Activity: `Update profile`,
        Content: "Success",
    })
    res.status(200).send({
        code: 1,
        msg: "Success",
    })
}

const recentActivity = async (req, res) => {
    const {Id} = req.body;
    const result = await Log.find({AffectedId: ObjectId(Id)});
    let data = []
    for(let i = 0 ; i < result.length ; i ++){
        let tmpdata = {};
        let user = await User.find({_id: result[i].UserId});
        if(user.length > 0){
            tmpdata.Username = user[0].firstname + " " + user[0].lastname;
        }else{
            tmpdata.Username = "Deleted user";
        }
        tmpdata.Activity = result[i].Activity;
        tmpdata.Content = result[i].Content;
        tmpdata.createdAt = result[i].createdAt;
        data.push(tmpdata);
    }
    
    res.status(200).send({
        code: 1,
        msg: "Success",
        data: {
            list: data
        }
    })
}

module.exports = {
    createAdmin,
    superAdminDashboard,
    createUser,
    updateUserStatus,
    signIn,
    createUserWithoutAzure,
    sendInviteEmail,
    getEmailForSignup,
    sendResetPasswordMail,
    setAccountProfile,
    getAccountProfile,
    logoutUser,
    getUsers,
    getUser,
    deleteUser,
    getRecentActivities,
    UpdateRole,
    getUsersOfOrganization,
    userDashboard,
    recentActivity,
    createUserInvited,
    updateUserProfile,
};
