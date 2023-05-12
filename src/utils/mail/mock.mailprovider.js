const logger = require('../logger');

module.exports = {
    messages: () => ({
        send: options => new Promise((resolve, reject) => {
            logger.debug('Send mails', options);
            resolve('Mail was sent');
        }),
    }),
};
