const Localize = require('localize');

class ErrorMessageLocale {
    static async setLocale(req, res, next) {
        try {
            const locale = req.headers['accept-language'];

            if (locale) {
                if (locale === 'nl_NL') {
                    ErrorMessageLocale.appLocalize.setLocale(locale);
                } else {
                    ErrorMessageLocale.appLocalize.setLocale('en_US');
                }
            } else {
                ErrorMessageLocale.appLocalize.setLocale('en_US');
            }

            next();
        } catch (err) {
            res.status(500).send(err);
        }
        next();
    }
}

ErrorMessageLocale.appLocalize = new Localize({
    // azure error message
    "Can't connect with Azure": {
        en_US: "Can't connect with Azure",
        nl_NL: 'Kan geen verbinding maken met Azure',
    },
    "Can't found user's azure id": {
        en_US: "Can't found user's azure id",
        nl_NL: 'Kan de azure id van de gebruiker niet vinden',
    },
    'Internal problem with Azure': {
        en_US: 'Internal problem with Azure',
        nl_NL: 'Intern probleem met MS Azure',
    },
    "Can't create user on Azure": {
        en_US: "Can't create user on Azure",
        nl_NL: 'Kan geen gebruiker maken op Azure',
    },
    "Can't update user on Azure": {
        en_US: "Can't update user on Azure",
        nl_NL: 'Kan gebruiker niet bijwerken op Azure',
    },
    "Can't Delete user on Azure": {
        en_US: "Can't Delete user on Azure",
        nl_NL: "Can't Delete user on Azure",
    },

    // not found exception messages
    "Admin wasn't found": {
        en_US: "Admin wasn't found",
        nl_NL: 'Admin is niet gevonden',
    },
    "Company wasn't found": {
        en_US: "Company wasn't found",
        nl_NL: 'Bedrijf werd niet gevonden',
    },
    "Connection wasn't found": {
        en_US: "Connection wasn't found",
        nl_NL: 'Verbinding is niet gevonden',
    },
    "Subject wasn't found": {
        en_US: "Subject wasn't found",
        nl_NL: 'Onderwerp is niet gevonden',
    },
    "User wasn't found": {
        en_US: "User wasn't found",
        nl_NL: 'Gebruiker is niet gevonden',
    },
    "Role wasn't found": {
        en_US: "Role wasn't found",
        nl_NL: "Role wasn't found",
    },
    "Permission wasn't found for this role": {
        en_US: "Permission wasn't found for this role",
        nl_NL: "Permission wasn't found for this role",
    },

    // already exist exception messages
    'Company already exists': {
        en_US: 'Company already exists',
        nl_NL: 'Bedrijf bestaat al',
    },
    'Role already exists': {
        en_US: 'Role already exists',
        nl_NL: 'Rol bestaat al',
    },
    'Subject already exists': {
        en_US: 'Subject already exists',
        nl_NL: 'Onderwerp bestaat al',
    },
    'User already exists': {
        en_US: 'User already exists',
        nl_NL: 'Gebruiker bestaat al',
    },

    // file exception messages
    'File not found': {
        en_US: 'File not found',
        nl_NL: 'Bestand niet gevonden',
    },
    'Cannot read file': {
        en_US: 'Cannot read file',
        nl_NL: 'Kan bestand niet lezen',
    },
    'File Upload Error': {
        en_US: 'File Upload Error',
        nl_NL: 'Bestand Upload Fout',
    },

    // invalid parameter or arguments exception functions
    'Invalid Amount': {
        en_US: 'Invalid Amount',
        nl_NL: 'Ongeldige hoeveelheid',
    },
    'Email is not valid': {
        en_US: 'Email is not valid',
        nl_NL: 'E-mail is niet geldig',
    },
    'You argument $[1] is not valid': {
        en_US: 'You argument $[1] is not valid',
        nl_NL: 'Argument is niet geldig : $[1]',
    },
    'Please provide correct credentials': {
        en_US: 'Please provide correct credentials',
        nl_NL: 'De juiste gegevens invoeren',
    },
    'Data is not valid': {
        en_US: 'Data is not valid',
        nl_NL: 'Data is niet geldig',
    },
    'Please provide param : $[1]': {
        en_US: 'Please provide param: $[1]',
        nl_NL: 'Juiste paarmeters invoeren: $[1]',
    },
    'Invalid Validity': {
        en_US: 'Invalid Validity',
        nl_NL: 'Ongeldige geldigheid',
    },
    'Your session has been expired': {
        en_US: 'Your session has been expired',
        nl_NL: 'Je sessie is verlopen',
    },
    'Invalid Access Token': {
        en_US: 'Invalid Access Token',
        nl_NL: 'Ongeldige toegangstoken',
    },
    'Invalid Params Permisssion': {
        en_US: 'Invalid Params Permisssion',
        nl_NL: 'Invalid Params Permisssion',
    },
    "You don't have permission to access this API": {
        en_US: "You don't have permission to access this API",
        nl_NL: "You don't have permission to access this API",
    },

    // blockchain exception messages.
    "Balance wasn't added or transfer": {
        en_US: "Balance wasn't added or transfer",
        nl_NL: 'Saldo is niet toegevoegd',
    },
    "Balance request wasn't added": {
        en_US: "Balance request wasn't added",
        nl_NL: "Balance request wasn't added",
    },
    "Can't get invoices": {
        en_US: "Can't get invoices",
        nl_NL: 'Bericht is niet verstuurd',
    },
    "Log wasn't added": {
        en_US: "Log wasn't added",
        nl_NL: 'Log is niet toegevoegd',
    },
    "Subject permission wasn't added": {
        en_US: "Subject permission wasn't added",
        nl_NL: 'Onderwerpstoestemming is niet toegevoegd',
    },
    "Subject permission request wasn't added": {
        en_US: "Subject permission request wasn't added",
        nl_NL: 'Verzoek om toestemming werd niet toegevoegd',
    },
    'Blockchain Error': {
        en_US: 'Blockchain Error',
        nl_NL: 'Blockchain Error',
    },
    'No contract for this function': {
        en_US: 'No contract for this function',
        nl_NL: 'No contract for this function',
    },
    'Your balance limit over for balance request': {
        en_US: 'Your balance limit over for balance request',
        nl_NL: 'Your balance limit over for balance request',
    },
    'Balance limit is not set': {
        en_US: 'Balance limit is not set',
        nl_NL: 'Balance limit is not set',
    },
    "You haven't enough funds for accepting invoice": {
        en_US: "You haven't enough funds for accepting invoice",
        nl_NL: 'U hebt niet genoeg geld voor het accepteren van de factuur',
    },
    "You haven't right for adding logs": {
        en_US: "You haven't right for adding logs",
        nl_NL: 'U hebt niet gelijk voor het toevoegen van logboeken',
    },
    'Can not create two similar transactions': {
        en_US: 'Can not create two similar transactions',
        nl_NL: 'Kan geen twee vergelijkbare transacties maken',
    },
    'Account balance too low': {
        en_US: 'Account balance too low',
        nl_NL: 'Accountsaldo te laag',
    },
    'You do not have a permission': {
        en_US: 'You do not have a permission',
        nl_NL: 'U hebt geen toestemming',
    },
    'Internal Server Error': {
        en_US: 'Internal Server Error',
        nl_NL: 'Interne Server Fout',
    },

    // database exception messages
    "Can't create company": {
        en_US: "Can't create company",
        nl_NL: 'Kan fout niet aanmaken',
    },
});

module.exports = ErrorMessageLocale;
