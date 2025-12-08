import validateSchema from '~/utils/validate'

/** Create schema for reset password api */
const schema = {
    type: "object",
    properties: {
        email: {
            type: "string",
            minLength: 5,
            maxLength: 150,
            format: "email",
            errorMessage: {
                type: "Email must be a string.",
                format: "Invalid email format.",
                minLength: "Email should have a minimum of 5 characters.",
                maxLength: "Email may have a maximum of 150 characters."
            }
        },
        password: {
            type: "string",
            minLength: 8,
            maxLength: 20,
            pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])(?!.*\\s)",
            errorMessage: {
                type: 'The password field must be a string.',
                minLength: 'Password should have minimum 8 characters.',
                maxLength: 'Password should be a maximum of 20 characters.',
                pattern: 'Password must contain at least one uppercase, lowercase, number, and a special character.'
            },
        },
        cnf_password: {
            const: {
                "$data": "1/password"
            },
            type: "string",
            minLength: 8,
            maxLength: 20,
            pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])(?!.*\\s)",
            errorMessage: {
                const: 'The password does not match with the confirmed password.',
                type: 'The confirm password field must be a string.',
                minLength: 'Password should have minimum 8 characters.',
                maxLength: 'Confirm password  should be a maximum of 20 characters.',
                pattern: 'Password must contain at least one uppercase, lowercase, number, and a special character.'
            },
        },
        code: {
            type: "string",
            minLength: 4,
            maxLength: 4,
            pattern: "^[0-9]*$",
            errorMessage: {
                type: 'Code should be string type',
                minLength: 'Code must be exactly 4 digits',
                maxLength: 'Code must be exactly 4 digits',
                pattern: 'Code must contain only numeric characters',
            },
        }
    },
    required: ["email", "password", "cnf_password", "code"], /** Set required parameter */
    additionalProperties: true, /** Make addition parameter allow in request body by making additionalProperties =true */
}

// Reset password field validation 
export const resetPasswordValidator = function (req, res, next) {

    const isValid = validateSchema(req.body, schema);
    /** Check if isvalid status false return validation response */

    if (!isValid.status) {
        /**  Return response */
        return res.status(isValid.status_code).json(isValid.error);
    }

    next();
}