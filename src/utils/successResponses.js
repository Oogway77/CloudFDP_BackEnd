class SuccessResponse {
    constructor() {
        this.httpStatusCode = 200;
        this.code = 'OK';
        this.message = null;
        return this;
    }

    setCode(code) {
        this.code = code;
        return this;
    }

    setMessage(message) {
        this.message = message;
        return this;
    }

    setStatus(status) {
        this.httpStatusCode = status;
        return this;
    }

    static ok() {
        return new SuccessResponse();
    }

    static nodeCreated(message) {
        return new SuccessResponse()
            .setCode('NODE_CREATED')
            .setMessage(message)
            .setStatus(201);
    }

    static nodeRemoved(message) {
        return new SuccessResponse()
            .setCode('NODE_REMOVED')
            .setMessage(message);
    }

    static chainSet(message) {
        return new SuccessResponse()
            .setCode('CHAIN_SET')
            .setMessage(message);
    }

    static networkCreated(message) {
        return new SuccessResponse()
            .setCode('NETWORK_CREATED')
            .setMessage(message)
            .setStatus(201);
    }

    static networkUpdated(message) {
        return new SuccessResponse()
            .setCode('NETWORK_UPDATED')
            .setMessage(message);
    }

    static networkRemoved(message) {
        return new SuccessResponse()
            .setCode('NETWORK_REMOVED')
            .setMessage(message);
    }

    static emailSent(message) {
        return new SuccessResponse()
            .setCode('EMAIL_SENT')
            .setMessage(message);
    }

    static userInvited(message) {
        return new SuccessResponse()
            .setCode('USER_INVITED')
            .setMessage(message);
    }

    static enodes(message) {
        return new SuccessResponse()
            .setMessage(message);
    }

    static deleted(objectName) {
        return new SuccessResponse()
            .setCode('DELETED')
            .setMessage(`${objectName} was successfully deleted`);
    }

    static updated(objectName) {
        return new SuccessResponse()
            .setCode('UPDATED')
            .setMessage(`${objectName} was successfully updated`);
    }

    static created(objectName) {
        return new SuccessResponse()
            .setStatus(201)
            .setCode('CREATED')
            .setMessage(`${objectName} was successfully created`);
    }

    static scriptCreated(message) {
        return new SuccessResponse()
            .setMessage(message)
            .setCode('SCRIPT_CREATED');
    }

    static notificationAccepted(message) {
        return new SuccessResponse()
            .setMessage(message)
            .setCode('NOTIFICATION_ACCEPTED');
    }
}

module.exports = SuccessResponse;
