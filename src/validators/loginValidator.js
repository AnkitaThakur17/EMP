import validateSchema from '~/utils/validate'

/** Validation for normal login */
const schema = {
    type: "object",
    properties: {
        email: {
            type: "string",
            errorMessage: {
                type: "Email must be a string.",
            }
        },
        password: {
            type: "string",
            errorMessage: {
                type: 'The password field must be a string.',
            },
        },
    },
    required: ["email", "password"], /** Set required parameter */
    additionalProperties: true, /** Make addition parameter allow in request body by making additionalProperties =true */
}

// login field validation 
export const loginValidator = function (req, res, next) {

    const isValid = validateSchema(req.body, schema);
    //check if isvalid status false return validation response
    if (isValid.status == false) {
        // return response 
        return res.status(isValid.status_code).json(isValid.error);
    }
    next();
}