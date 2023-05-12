const { startCase } = require('lodash');
const BaseError = require('./error');
const Locale = require('./errorMessageLocale');
const logger = require('./logger');

class APIError extends BaseError {
    constructor(httpStatusCode) {
        super();
        this.httpStatusCode = httpStatusCode;
        logger.error(`Error with httpCode: ${httpStatusCode}`);
        return this;
    }

    setFields(param, type) {
        this.fields = [];
        this.fields.push({
            param,
            type,
            message: type ? `${param} is ${type.toLowerCase()}` : `${param} is invalid`,
        });
        logger.error(`Error with fields: ${JSON.stringify(this.fields)}`);
        return this;
    }

    // Bad request
    static invalidArgumentsError(params) {
        return new APIError(400)
            .setCode('E_INVALID_ARGUMENTS')
            .setMessage(
                Locale.appLocalize.translate('Argument $[1] is not valid', params)
            )
            .setFields(params, 'INVALID');
    }

    static invalidCredentialsError(err) {
        return new APIError(400)
            .setCode('E_INVALID_CREDENTIALS')
            .setMessage('Please provide correct credentials')
            .setParams(err.toString());
    }

    static constantNeeded(params) {
        return new APIError(400)
            .setCode('E_NO_CONSTANT')
            .setMessage(`Constants with name ${params} not specified`)
            .setFields(params, 'REQUIRED');
    }

    // Not authorized and forbidden
    static tokenInvalidError() {
        return new APIError(401)
            .setCode('E_TOKEN_INVALID')
            .setMessage('Your session has been expired');
    }

    static networkTokenInvalidError() {
        return new APIError(401)
            .setCode('E_NETWORK_TOKEN_INVALID')
            .setMessage('Network token is invalid');
    }

    static nodeTokenInvalidError() {
        return new APIError(401)
            .setCode('E_NODE_TOKEN_INVALID')
            .setMessage('Node token is invalid');
    }

    static apiPermissionInvalidError() {
        return new APIError(403)
            .setCode('E_PERMISSION_ERROR')
            .setMessage("You don't have permission to access this API");
    }

    static userIsNotOwnerOfCompany() {
        return new APIError(403)
            .setCode('E_USER_IS_NOT_OWNER_OF_COMPANY')
            .setMessage('User is not owner of the company');
    }


    // Not found
    static userNotFoundError(params) {
        return new APIError(404)
            .setCode('E_USER_NOT_FOUND')
            .setMessage("User wasn't found")
            .setParams(params);
    }

    static objectNotFoundError(params) {
        const object = startCase(params) || 'Object';
        return new APIError(404)
            .setCode('E_OBJECT_NOT_FOUND')
            .setMessage(`${object} not found`)
            .setParams(params);
    }

    // Conflicts
    static userFoundError(params) {
        return new APIError(409)
            .setCode('E_USER_FOUND')
            .setMessage('User already exists')
            .setParams(params);
    }

    static invalidNetworkName(params) {
        return new APIError(409)
            .setCode('E_NETWORK_ALREADY_EXISTS')
            .setMessage('Network with provided name already exists')
            .setParams(params);
    }

    static constantsNotNeeded(params) {
        return new APIError(409)
            .setCode('E_NO_CONSTANTS')
            .setMessage(`Contract ${params} need not setting constants`)
            .setParams(params);
    }

    static noAvailableNodes(params) {
        return new APIError(409)
            .setCode('E_NO_NODES')
            .setMessage('This network has no available nodes. Create new node or try later')
            .setParams(params);
    }

    static contractNameIsOccupied(params) {
        return new APIError(409)
            .setCode('E_CONTRACT_NAME_IS_OCCUPIED')
            .setMessage('This network already has contract with this name')
            .setParams(params);
    }

    static needCompile(params) {
        return new APIError(409)
            .setCode('E_NEED_COMPILE')
            .setMessage('This contract not compiled yet')
            .setParams(params);
    }

    static needUpdate(params) {
        return new APIError(409)
            .setCode('E_NEED_UPDATE')
            .setMessage('This network has unsupported version of the blockchain. You need to update the network to add more nodes.')
            .setParams(params);
    }

    static wrongTypeOfNode(params) {
        return new APIError(409)
            .setCode('E_WRONG_NODE_TYPE')
            .setMessage('This node has different node type')
            .setParams(params);
    }

    static invalidType(params) {
        return new APIError(409)
            .setCode('E_INVALID_TYPE')
            .setMessage(`Method is not applicable for this ${params}`)
            .setParams(params);
    }

    static userIsNotEmployeeOfCompany(params) {
        return new APIError(409)
            .setCode('E_USER_IS_NOT_EMPLOYEE_OF_COMPANY')
            .setMessage('User is not an employee of this company')
            .setParams(params);
    }

    static companyHasEmployeesExceptOwner(params) {
        return new APIError(409)
            .setCode('E_COMPANY_HAS_EPMLOYEES_EXCEPT_OWNER')
            .setMessage('Company could not be removed cause it has employees (except owner)')
            .setParams(params);
    }

    static currentUserIsOwnerOfCompany(params) {
        return new APIError(409)
            .setCode('E_USER_IS_OWNER_OF_COMPANY')
            .setMessage('Current user is owner of the company')
            .setParams(params);
    }

    static userIsEmployeeOfTheCompanyAlready(role) {
        return new APIError(409)
            .setCode('E_USER_IS_EMPLOYEE_OF_COMPANY_ALREADY')
            .setMessage(`User is an ${role} of the company already`);
    }

    static ownerCouldNotBeRemoved() {
        return new APIError(409)
            .setCode('E_OWNER_COULD_NOT_BE_REMOVED_FROM_COMPANY')
            .setMessage('User is owner of the company. Owner of the company could not be remove from company');
    }

    static userCanNotInviteHimself() {
        return new APIError(409)
            .setCode('E_USER_CAN_NOT_INVITE_HIMSELF')
            .setMessage('User can not invite himself');
    }

    static notificationIsAlreadyAccepted() {
        return new APIError(409)
            .setCode('E_NOTIFICATION_IS_ALREADY_ACCEPTED')
            .setMessage('Notification is already accepted');
    }

    static invalidConstants(message) {
        return new APIError(409)
            .setCode('E_INVALID_CONSTANT')
            .setMessage(message);
    }

    static incorrectFormat(fieldName) {
        const field = fieldName || 'Field';
        return new APIError(409)
            .setCode('E_INCORRECT_FORMAT')
            .setMessage(
                Locale.appLocalize.translate('$[1] has incorrect format', field)
            );
    }

    static nodeCheckError(message) {
        return new APIError(409)
            .setCode('E_NODE_CHECK_ERROR')
            .setMessage(message);
    }

    static networkHasNodes() {
        return new APIError(409)
            .setCode('E_NETWORK_HAS_NODES')
            .setMessage('Network has nodes');
    }

    static networkCouldNotBeManaged() {
        return new APIError(409)
            .setCode('E_NETWORK_COULD_NOT_BE_MANAGED')
            .setMessage('Network is updating now');
    }

    static networkVersionCouldNotBeChanged(message) {
        return new APIError(409)
            .setCode('E_NETWORK_VERSION_COULD_NOT_BE_CHANGED')
            .setMessage(message);
    }

    static impossibleToRemoveNetworkOwner() {
        return new APIError(409)
            .setCode('E_IMPOSSIBLE_TO_REMOVE_NETWORK_OWNER')
            .setMessage('Impossible to remove owner of network');
    }

    static objectWasChanged(params) {
        return new APIError(409)
            .setCode('E_OBJECT_CHANGED')
            .setMessage(`${params} have been changed. Please reload it.`)
            .setParams(params);
    }

    static parityUnreachable() {
        return new APIError(409)
            .setCode('E_PARITY_UNREACHABLE')
            .setMessage('Can\'t access entered IP and RPC port');
    }

    static genesisesAreDifferent() {
        return new APIError(409)
            .setCode('E_OTHER_NETWORK')
            .setMessage('Node belongs to other network. Genesises differ');
    }

    static ipIsInUse() {
        return new APIError(409)
            .setCode('E_INVALID_IP')
            .setMessage('Node with provided IP is already added to this network');
    }

    static userIsAlreadyWatcher() {
        return new APIError(409)
            .setCode('E_USER_IS_WATCHER_ALREADY')
            .setMessage('User is the watcher of the network already');
    }

    static userIsNotWatcher() {
        return new APIError(409)
            .setCode('E_USER_IS_NOT_WATCHER')
            .setMessage('User is not the watcher of the network');
    }

    static contractWasChanged() {
        return new APIError(409)
            .setCode('E_CONTRACT_WAS_CHANGED')
            .setMessage('Contract was changed by another user. Please refresh page');
    }

    // Internal server errors
    static internalServerError(message = 'Internal Server Error') {
        return new APIError(500)
            .setCode('E_INTERNAL_SERVER_ERROR')
            .setMessage(message);
    }

    static blockchainUnreachable() {
        return new APIError(500)
            .setCode('E_BLOCKCHAIN_UNREACHABLE')
            .setMessage('All nodes at blockchain network are unreachable');
    }

    static databaseError(err) {
        logger.error('Database error: %s', err);

        throw new APIError(500)
            .setCode('E_DATABASE_ERROR')
            .setMessage('Internal Server Error')
            .setParams(err.toString());
    }

    static emptyNetworkFieldsError(params) {
        return new APIError(500)
            .setCode('E_NO_ACCOUNT_INFO')
            .setMessage('No account info in network')
            .setParams(params);
    }

    static cantSendEmail(params) {
        return new APIError(500)
            .setCode('E_EMAIL_ERROR')
            .setMessage(
                'Cant send email, try after some time!'
            )
            .setParams(params);
    }

    static azureError(message = 'Azure error') {
        return new APIError(500)
            .setCode('E_AZURE_ERROR')
            .setMessage(message);
    }

    static indyError(message = 'Indy error') {
        return new APIError(500)
            .setCode('E_INDY_ERROR')
            .setMessage(message);
    }

    static githubError(message) {
        return new APIError(500)
            .setCode('E_GITHUB_Error')
            .setMessage(`Github error with message: ${message}`);
    }

    static blockchainHandleError(err) {
        logger.error('blockchainHandleError: ', err);
        if (err.httpStatusCode) {
            return err;
        }

        if (err) {
            if (err.toString().indexOf('Your balance limit over') !== -1) {
                return new APIError(500)
                    .setCode('E_BALANCE_LIMIT_OVER')
                    .setMessage('Your balance limit over for balance request');
            }

            if (err.toString().indexOf('enough funds for accepting invoice') !== -1) {
                return new APIError(500)
                    .setCode('E_NOT_ENOUGH_FUNDS')
                    .setMessage("You haven't enough funds for accepting invoice");
            }

            if (err.toString().indexOf('Balance limit is not set') !== -1) {
                return new APIError(401)
                    .setCode('E_BLOCKCHAIN_ERROR')
                    .setMessage('Balance limit is not set');
            }

            if (err.toString().indexOf("You haven't right for adding logs") !== -1) {
                return new APIError(401)
                    .setCode('E_BLOCKCHAIN_ERROR')
                    .setMessage("You haven't right for adding logs");
            }

            if (err.message) {
                if (err.message.indexOf('Known transaction') !== -1) {
                    return new APIError(500)
                        .setCode('E_BLOCKCHAIN_ERROR')
                        .setMessage('Can not create two similar transactions');
                }

                if (
                    err.message.indexOf(
                        'Account does not exist or account balance too low'
                    ) !== -1
                ) {
                    return new APIError(500)
                        .setCode('E_BLOCKCHAIN_ERROR')
                        .setMessage('Account balance too low');
                }

                if (err.message.indexOf('permission') !== -1) {
                    return new APIError(401)
                        .setCode('E_BLOCKCHAIN_ERROR')
                        .setMessage('You do not have a permission');
                }
            }
        }

        return new APIError(500)
            .setCode('E_BLOCKCHAIN_ERROR')
            .setMessage('Internal Server Error');
    }

    static errorResponseHandler(error, res) {
        logger.error('errorResponseHandler: %s', error.message);
        if (error.stack) logger.error('error stack %s', error.stack);
        let result;
        if (!error.httpStatusCode) result = this.internalServerError(error.message);
        else result = error;
        res.status(result.httpStatusCode).send(result);
    }
}

module.exports = APIError;
