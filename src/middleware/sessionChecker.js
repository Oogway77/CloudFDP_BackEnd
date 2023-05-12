 const db = require('../database/models/user.model');
 const OrganizationModel = require('../database/models/organization.model');

 const APIError = require('../utils/apiError');
 const logger = require('../utils/logger');
 const setSessionCookie = require('../utils/sessionCookie');
 const { SESSION_TOKEN_NAME } = require('../config/config');

 class SessionChecker {
     static async fillUserFromCookies(req, res, next) {
         try {
            const access_token = req.headers[SESSION_TOKEN_NAME];
            // console.log(req.headers, SESSION_TOKEN_NAME);
             const user = await db.findUserByToken(access_token);
             if (user) {
                 req.engineUser = {
                     ...user._doc,
                 };
                 logger.addContext('userId', req.engineUser._id);
             }
         } catch (e) {
             // user was not found
         }
         if (next) {
             next();
         }
     }

     static async checkSession(req, res, next) {
         await SessionChecker.fillUserFromCookies(req, res);
         try {
             const { engineUser } = req;
             const currentTime = new Date();
             if (!engineUser || engineUser.expirationTime < currentTime) {
                //  res.status(401).send(APIError.tokenInvalidError());
                res.status(200).send({
                    code: -1,
                    msg: "Token invalidation error",
                })
                 return res.end(); // eslint-disable-next-line consistent-return
             }
            //  const org = await OrganizationModel.find({_id: engineUser.organizationId});
            //  if(org.length == 0){

            //  }else if(org[0].Status != "Active"){

            //  }

             setSessionCookie(engineUser.token, res);
             return next();
         } catch (exception) {
             res.status(500).send(APIError.internalServerError(exception.message));
             return res.end();
         }
     }
 }
 
 module.exports = SessionChecker;
 