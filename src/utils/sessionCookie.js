const {
    SESSION_TOKEN_NAME,
    SESSION_EXPIRATION_PERIOD,
    USE_SECURE_COOKIES,
} = require('../config/config');

module.exports = function setSessionCookie(token, response) {
    const options = {
        maxAge: SESSION_EXPIRATION_PERIOD,
        httpOnly: true,
        sameSite: 'none',
        // secure: false,
    };
    // if (USE_SECURE_COOKIES === 'true') {
    //     options.secure = true;
    // }
    // console.log(options)
    response.cookie(
        SESSION_TOKEN_NAME,
        token,
        options
    );
};
