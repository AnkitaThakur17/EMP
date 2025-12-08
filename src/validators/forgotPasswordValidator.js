import validateSchema from '~/utils/validate'

/** Create schema for request otp api */
const schema = {
    type: "object",
    properties: {
        userType: {
            type: "string",
            enum: ["customer", "driver", "store"],
            errorMessage: {
                enum: "User type must be equal to 'customer', 'driver' or 'store",
            },
        },
        email: {
            type: "string",
            errorMessage: {
                type: "Email must be a string.",
            }
        }
    },
    required: ["userType", "email"], /** Set required parameter */
    additionalProperties: true, /** Make addition parameter allow in request body by making additionalProperties =true */
}

/** Forgot password field validation */
export const forgotPasswordValidator = function (req, res, next) {

    const isValid = validateSchema(req.body, schema);

    /** Check if isvalid status false return validation response */

    if (!isValid.status) {
        /** Return response  */
        return res.status(isValid.status_code).json(isValid.error);
    }
    next();
}