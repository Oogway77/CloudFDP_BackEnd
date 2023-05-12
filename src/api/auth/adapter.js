const azureStorage = require('azure-storage');
const Web3 = require('web3');
const bcrypt = require('bcrypt');
const fs = require('fs');
const mailProvider = require('../../utils/mail/mail.provider');

const User = require('../../database/models/user.model');

const APIError = require('../../utils/apiError');
const APISuccess = require('../../utils/successResponses');

const logger = require('../../utils/logger');

const {
    MAIL_OPTIONS,
    BCRYPT_SALTROUNDS,
    SESSION_EXPIRATION_TIME,
    INVITE_MAIL_TEMPLATE,
    CREATE_ACCOUNT_LINK,
    RESET_PASSWORD_LINK,
    INVITE_EMAIL_TITLE,
    CREATE_TERMS,
} = require('../../config/config');

const web3 = new Web3();

const generateToken = () => {
    const str = new Date().getTime().toString();
    const nonce = Math.random() * 1000;
    const draft = `${nonce}#${str}`;
    const hash = web3.sha3(draft);
    const token = bcrypt.hashSync(hash, BCRYPT_SALTROUNDS);
    const result = Buffer.from(token).toString('base64');
    logger.debug(`generateToken ${result}`);
    return result;
};

const calcExpiration = () => {
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + SESSION_EXPIRATION_TIME);
    return expirationTime;
};

const calcExpiration1 = (t) => {
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + t);
    return expirationTime;
};

const fitUser = async (user) => {
    const fittedUser = JSON.parse(JSON.stringify(user));

    delete fittedUser.password;
    // delete fittedUser.seed;
    // delete fittedUser.seed_password;
    // delete fittedUser.azure_id;
    // delete fittedUser.address;
    delete fittedUser.token;
    delete fittedUser.expirationTime;
    // fittedUser.unreadNotificationsCount = fittedUser.notifications
    //     .filter(n => !n.accepted)
    //     .length;
    // if (!fittedUser.unreadNotificationsCount) delete fittedUser.unreadNotificationsCount;
    // delete fittedUser.notifications;
    // fittedUser.companiesCount = (await CompanyInfo.getUserCompanies(fittedUser._id)).length;

    return fittedUser;
};

async function sendInviteEmail(sender, email, role, token, street, country){
    MAIL_OPTIONS.to = email;
    let mailBody = `<!DOCTYPE html>
    <html>
        <head>
            <link rel="preconnect" href="https://fonts.gstatic.com">
            <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;500;700;900&display=swap" rel="stylesheet">
                <style>
                p {
                margin-top: 32px;
                font-family: 'Source Sans Pro', sans-serif;
                font-size: 16px;
                font-weight: normal;
                line-height: 24px;
                color: #141414;
                }
                p strong {
                    font-weight: 900;
                }
                a {
                    color: #3898EC;
                    cursor: pointer;
                    text-decoration: underline;
                }
                .button {
                    margin-top: 32px;
                    box-sizing: border-box;
                    padding: 12px 197px;
                    width: 100%;
                    height: auto;
                    background-color: #3898EC;
                    box-shadow: 0px 8px 16px rgba(56, 152, 236, 0.16);
                    border-radius: 8px;
                    font-family: 'Source Sans Pro', sans-serif;
                    font-size: 16px;
                    font-weight: bold;
                    line-height: 24px;
                    color: #FFFFFF;
                    border: 0;
                    outline: none;
                    cursor: pointer;
                    text-decoration: none;
                }
                label {
                    font-family: Source Sans Pro;
                    font-style: normal;
                    font-weight: normal;
                    font-size: 16px;
                    line-height: 24px;
                    color: #808080;
                }
                span {
                    margin-top: 8px;
                    font-family: Source Sans Pro;
                    font-style: normal;
                    font-weight: normal;
                    font-size: 12px;
                    line-height: 20px;
                    text-align: center;
                    color: #808080;
                }
                span strong {
                    margin-top: 32px;
                    font-weight: 900;
                }

            </style>
        </head>
        <body>
            <div align="center">
                <div style="padding: 20px; width:640px; height: 745px; background-color: #F9F9F9;">
                    <div style="padding-top:12px; padding-bottom:32px">
                        <img src="https://i.ibb.co/B6VgXZ1/logo-email.png">
                    </div>
                    <div style="padding: 32px 30px; width: 100%; height: auto; box-sizing: border-box; background-color: #FFFFFF;" align="left">
                        <p> Hello, </p>
                        <p> You have been invited by <strong> #sender </strong> to join <strong> Fair Data Solution. </strong> Click the button below to create your account. </p>
                        <a class="button" href="#link"> Join Fair Data Solutions </a>
                        <p> This invitation expires in 7 days. </p>
                        <p> If you don't recognize the organization above, find this abusive or need help, please contact us at <a>info@fairdatrasolutionlcom</a> </p>
                        <label>
                            Fair Data Solutions team <br />
                            Automated message. Please do not reply.
                        </label>
                    </div>
                    <span> <strong>Fair Data Solutions</strong> </span> <br />
                    <span> #street <br /> #country </span><br />
                    <span> <a href="#terms"> Term &amp; conditions </a> </span><br />
                </div>
            </div>
        </body>
    </html>		
    `;
    mailBody = mailBody.replace('#sender', sender);
    // mailBody = mailBody.replace('#company', "");
    mailBody = mailBody.replace('#role', role);
    mailBody = mailBody.replace('#link', CREATE_ACCOUNT_LINK+"?token="+token);
    mailBody = mailBody.replace('#terms', CREATE_TERMS);
    mailBody = mailBody.replace('#street', street);
    mailBody = mailBody.replace('#country', country);
    MAIL_OPTIONS.html = mailBody;
    MAIL_OPTIONS.subject = INVITE_EMAIL_TITLE;
    return await mailProvider.send(MAIL_OPTIONS)
        .then((res) => {
            logger.info(`Invite to mail is sent to ${email}`, res);
            APISuccess.emailSent();
        })
        .catch((err) => {
            logger.warn('Can\'t send mail', err);
            throw APIError.cantSendEmail();
        });
}

async function sendResetPWEmail(sender, email, token, street, country){
    MAIL_OPTIONS.to = email;
    let mailBody = `<!DOCTYPE html>
    <html>
        <head>
            <link rel="preconnect" href="https://fonts.gstatic.com">
            <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;500;700;900&display=swap" rel="stylesheet">
                <style>
                p {
                margin-top: 32px;
                font-family: 'Source Sans Pro', sans-serif;
                font-size: 16px;
                font-weight: normal;
                line-height: 24px;
                color: #141414;
                }
                p strong {
                    font-weight: 900;
                }
                a {
                    color: #3898EC;
                    cursor: pointer;
                    text-decoration: underline;
                }
                .button {
                    margin-top: 32px;
                    box-sizing: border-box;
                    padding: 12px 215px;
                    width: 100%;
                    height: auto;
                    background-color: #3898EC;
                    box-shadow: 0px 8px 16px rgba(56, 152, 236, 0.16);
                    border-radius: 8px;
                    font-family: 'Source Sans Pro', sans-serif;
                    font-size: 16px;
                    font-weight: bold;
                    line-height: 24px;
                    color: #FFFFFF;
                    border: 0;
                    outline: none;
                    cursor: pointer;
                    text-decoration: none;
                }
                label {
                    font-family: Source Sans Pro;
                    font-style: normal;
                    font-weight: normal;
                    font-size: 16px;
                    line-height: 24px;
                    color: #808080;
                }
                span {
                    margin-top: 8px;
                    font-family: Source Sans Pro;
                    font-style: normal;
                    font-weight: normal;
                    font-size: 12px;
                    line-height: 20px;
                    text-align: center;
                    color: #808080;
                }
                span strong {
                    margin-top: 32px;
                    font-weight: 900;
                }

            </style>
        </head>
        <body>
            <div align="center">
                <div style="padding: 20px; width:640px; height: 745px; background-color: #F9F9F9;">
                    <div style="padding-top:12px; padding-bottom:32px">
                        <img src="https://i.ibb.co/B6VgXZ1/logo-email.png">
                    </div>
                    <div style="padding: 32px 30px; width: 100%; height: auto; box-sizing: border-box; background-color: #FFFFFF;" align="left">
                        <p> Hello, </p>
                        <p> We received a request to reset the password of your account associated with <strong> #sender. </strong> Click the button below to set a new password. </p>
                        <a class="button" href="#link"> Reset my password </a>
                        <p> This link expires in 2 hours. </p>
                        <p> If you didn't request to reset your password, please contact us at <a>info@fairdatrasolutionlcom</a>. No changes were made to your account yet. </p>
                        <label>
                            Fair Data Solutions team <br />
                            Automated message. Please do not reply.
                        </label>
                    </div>
                    <span> <strong>Fair Data Solutions</strong> </span> <br />
                    <span> Streetname 123 <br /> 1234 AB Amsterdam, The Netherlands </span><br />
                    <span> <a href="#terms"> Term &amp; conditions </a> </span><br />
                </div>
            </div>
        </body>
    </html>		
    `;
    mailBody = mailBody.replace('#sender', sender);
    // mailBody = mailBody.replace('#company', "");
    mailBody = mailBody.replace('#link', RESET_PASSWORD_LINK+"?token="+token);
    mailBody = mailBody.replace('#terms', CREATE_TERMS);
    mailBody = mailBody.replace('#street', street);
    mailBody = mailBody.replace('#country', country);

    MAIL_OPTIONS.html = mailBody;
    MAIL_OPTIONS.subject = INVITE_EMAIL_TITLE;
    return await mailProvider.send(MAIL_OPTIONS)
        .then((res) => {
            logger.info(`Invite to mail is sent to ${email}`, res);
            APISuccess.emailSent();
        })
        .catch((err) => {
            logger.warn('Can\'t send mail', err);
            throw APIError.cantSendEmail();
        });
}

module.exports = {
    generateToken,
    calcExpiration,
    calcExpiration1,
    fitUser,
    sendInviteEmail,
    sendResetPWEmail,
};
