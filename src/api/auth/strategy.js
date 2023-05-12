const passport = require('passport');

const { BearerStrategy } = require('passport-azure-ad');
const logger = require('../../utils/logger');
const {
    AZURE_IDENTITY_METADATA,
    AZURE_CLIENTID,
} = require('../../config/config');

passport.use(
    new BearerStrategy(
        {
            identityMetadata: AZURE_IDENTITY_METADATA,
            clientID: AZURE_CLIENTID,
            validateIssuer: false,
            loggingLevel: 'trace',
            passReqToCallback: false,
        },
        async (token, done) => {
            logger.info('token ', token);
            logger.info('done ', done);

            done(null, token, token);
        }
    )
);

module.exports = passport;
