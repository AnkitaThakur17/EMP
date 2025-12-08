import validateSchema from '~/utils/validate';

const schema = {
    type: "object",
    properties: {
        id: {
            type: "string",
            minLength: 24,
            maxLength: 24,
            errorMessage: {
                type: "ID must be a string.",
                minLength: "ID must be 24 characters.",
                maxLength: "ID must be 24 characters."
            }
        }
    },
    required: ["id"], /** Set required parameter */
    additionalProperties: true, /** Make addition parameter allow in request body by making additionalProperties =true */
}

// Client id validation 
export const objectIdValidator = function (req, res, next) {
    const isValid = validateSchema(req.params, schema);
    //check if isvalid status false return validation response
    if (isValid.status == false) {
        // return response 
        return res.status(isValid.status_code).json(isValid.error);
    }
    next();
}