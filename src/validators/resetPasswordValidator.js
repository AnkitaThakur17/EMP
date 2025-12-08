import validateSchema from '~/utils/validate'

/** Create schema for reset password api */
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
        token: {
            type: "string",
            pattern: "^[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+$",
            errorMessage: {
                type: 'The token field must be a string.',
                pattern: 'The token must be a valid JWT format.',
                minLength: 'The token field must not be empty.',
            }
        },
        temporaryPassword: {
            type: "string",
            errorMessage: {
                type: 'The password field must be a string.',
            },
        },
        newPassword: {
            type: "string",
            minLength: 8,
            maxLength: 20,
            pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])(?!.*\\s)",
            errorMessage: {
                type: 'The password field must be a string.',
                minLength: 'New password should have minimum 8 characters.',
                maxLength: 'New password should be a maximum of 20 characters.',
                pattern: 'New password must contain at least one uppercase, lowercase, number, and a special character.'
            },
        }

    },
    required: ["userType", "token", "temporaryPassword", "newPassword"], /** Set required parameter */
    additionalProperties: true, /** Make addition parameter allow in request body by making additionalProperties =true */
}

// Reset password field validation 
export const resetPasswordValidator = function (req, res, next) {

    const isValid = validateSchema(req, schema);
    /** Check if isvalid status false return validation response */

    if (!isValid.status) {
        /**  Return response */
        return res.status(isValid.status_code).json(isValid.error);
    }

    next();
}