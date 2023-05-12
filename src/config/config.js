require('dotenv').config({ path: `${__dirname}/.env` });

const constants = {
    PORT: process.env.PORT || 8080,
    // MONGO_URL: process.env.MONGO_URL || 'mongodb+srv://xingji:xingji901007@cluster0.d3mdv.mongodb.net/test?retryWrites=true&w=majority',
    // MONGO_DATABASE_NAME: process.env.MONGO_DATABASE_NAME || 'test',

    MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017',
    MONGO_DATABASE_NAME: process.env.MONGO_DATABASE_NAME || 'fdp',

    BRANCH: process.env.BRANCH || 'develop',
    SHORT: process.env.SHORT || '123121123',

    BCRYPT_SALTROUNDS: 10,
    SESSION_EXPIRATION_TIME: process.env.SESSION_EXPIRATION_TIME || 7*24,
    SESSION_EXPIRATION_PERIOD: process.env.SESSION_EXPIRATION_PERIOD || 1800000,
    SESSION_TOKEN_NAME: process.env.SESSION_TOKEN_NAME || "access-token",
    DEFAULT_AZURE_CLIENTID: process.env.DEFAULT_AZURE_CLIENTID || '9c756cd1-25af-41ea-8ce0-48b197a19fe0',
    DEFAULT_AZURE_SECRET: process.env.DEFAULT_AZURE_SECRET || 't1Rm00LUJm94h3q7SEDy4VIleb~-o7Pn_~',
    DEFAULT_AZURE_DOMAIN: process.env.DEFAULT_AZURE_DOMAIN || '18d73e22-a00c-4f8b-9a0d-a059e74dbc21',
    DEFAULT_AZURE_SUBSCRIPTIONID: process.env.DEFAULT_AZURE_SUBSCRIPTIONID || '8b4db8d8-2712-4d7a-9121-611367ed0768',
    DEFAULT_AZURE_LOCATION: process.env.DEFAULT_AZURE_LOCATION || 'westeurope',

    AZURE_IDENTITY_METADATA:process.env.AZURE_IDENTITY_METADATA || 'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration',
    AZURE_CLIENTID :process.env.AZURE_CLIENTID  || '6217d980-f3d6-4a0c-add4-0589508d3493',

    USE_SECURE_COOKIES: process.env.USE_SECURE_COOKIES || false,

    DEFAULT_ROLES: [
        'User',
        'Admin',
        "SuperAdmin"
    ],
    USER_STATUS: [
        "Invited",
        "Active",
        "Inactive",
        "Deleted",
    ],
    ORG_STATUS: [
        "Active",
        "Inactive",
        "Deleted"
    ],
    DATAPOINT_STATUS: [
        "Active",
        "Inactive",
        "Deploying",
        "Deleted"
    ],
    LOCATIONS: {
        "europe": ["francecentral", "germanywestcentral", "northeurope", "switzerlandnorth", "uksouth", "westeurope"], // "norwayeast", "ukwest",
        "us": ["centralus", "eastus", "northcentralus", "southcentralus", "westcentralus", "westus", "westus2"],
        "asia": ["australiaeast", "australiasoutheast", "centralindia", "eastasia", "japaneast", "koreacentral", "southeastasia", "southindia", "uaenorth"]
    },

    MAIL_PROVIDER_MOCK: process.env.MAIL_PROVIDER_MOCK || false,
    MAILGUN_APIKEY: process.env.MAILGUN_APIKEY || 'key-c1d94a24d7b659a00f3f846ecaf611df',
    MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN || 'productone.mail.ledgerleopard.com',
    MAIL_OPTIONS: {
        from: 'postmaster@fairsolution.com'
    },
    INVITE_MAIL_TEMPLATE: process.env.INVITE_MAIL_TEMPLATE || '../../static/templates/mail/inviteUserEmail.html',
    CREATE_ACCOUNT_LINK: process.env.CREATE_ACCOUNT_LINK || 'http://40.71.92.202:8081/auth/sign_up_invite',
    RESET_PASSWORD_LINK: process.env.RESET_PASSWORD_LINK || 'http://40.71.92.202:8081/resetpw',
    CREATE_TERMS: process.env.CREATE_TERMS || 'http://40.71.92.202:8081//terms',
    INVITE_EMAIL_TITLE: 'You have got invitation',

    // Storage
    STORAGE_ACCOUNT_NAME: "fairsolutionstorage",
    STORAGE_ACCOUNT_KEY: "LK2Shm4CwfaaPJccLBEqTTnpX/QunAL8WVuQ2a6cGZgTHs4Q68f68aMa+Somt4I8MxkpVEeYO+fLW7cz7L2pxw==",
}

// if (process.env.NODE_ENV === 'debug') {
//     constants.DEFAULT_AZURE_CLIENTID = process.env.DEFAULT_AZURE_CLIENTID || '9daf9930-bb9a-4223-8613-6879bdef01a3';
//     constants.DEFAULT_AZURE_SECRET = process.env.DEFAULT_AZURE_SECRET || 'b8WkJ4Ggsj/mP6XGRp9B5FBgvxzNTGzOAtvgnILhZVg=';
//     constants.DEFAULT_AZURE_DOMAIN = process.env.DEFAULT_AZURE_DOMAIN || 'd36bd196-2729-415a-b738-3cafb9634ecb';
//     constants.DEFAULT_AZURE_SUBSCRIPTIONID = process.env.DEFAULT_AZURE_SUBSCRIPTIONID || 'c2cb3940-082c-48c3-ba45-06302a879e0f';
// }

module.exports = constants;
