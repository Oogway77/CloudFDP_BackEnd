const Joi = require('joi');

const getPathString = (arrayPath) => {
    const reducer = (result, current) => `${result}.["${current}"]`;
    return arrayPath.reduce(reducer);
};

module.exports = schema => (req, res, next) => {
    const result = Joi.validate(req, schema, {
        allowUnknown: true,
        abortEarly: false,
    });

    if (result.error) {
        const error = { httpStatusCode: 400, code: 'E_INVALID_ARGUMENTS' };
        error.fields = result.error.details
            .map(e => ({
                param: e.context.key,
                path: getPathString(e.path),
                message: e.message,
                type: e.type === 'any.required' || e.type === 'any.empty'
                    ? 'REQUIRED' : 'INVALID',
            }));
        // return res.status(400).json(error);
        return res.status(200).send({
            code: 0,
            msg: "Invalid arguments",
            error: error
        })
    }
    next();
};
