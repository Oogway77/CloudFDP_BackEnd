const Mailgun = require('mailgun-js');

const {
    MAIL_PROVIDER_MOCK,
    MAILGUN_APIKEY,
    MAILGUN_DOMAIN,
} = require('../../config/config');

const MailProvider = MAIL_PROVIDER_MOCK === 'true'
    ? require('./mock.mailprovider')
    : new Mailgun({
        apiKey: MAILGUN_APIKEY,
        domain: MAILGUN_DOMAIN,
    });

module.exports = MailProvider.messages();
