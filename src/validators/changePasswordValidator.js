import validateSchema from '~/utils/validate'

/** Create schema for Change password api */
const schema = {
    type: "object",
    properties: {
        oldPassword: {
            type: "string",
            minLength: 1,
            errorMessage: {
                type: 'The password field must be a string.',
                minLength: 'The old password field must be a required',
            },
        },
        newPassword: {
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
        cnfPassword: {
            const: {
                "$data": "1/newPassword"
            },
            type: "string",
            minLength: 8,
            maxLength: 20,
            errorMessage: {
                const: 'The password does not match with the confirmed password.',
                type: 'The confirm password field must be a string.',
                minLength: 'Password should have minimum 8 characters.',
                maxLength: 'Confirm password  should be a maximum of 20 characters.',
            },
        }
    },
    required: ["oldPassword", "newPassword", "cnfPassword"], /** Set required parameter */
    additionalProperties: true, /** Make addition parameter allow in request body by making additionalProperties =true */
}

// Change password field validation 
export const changePasswordValidator = function (req, res, next) {

    const isValid = validateSchema(req.body, schema);
    /** Check if isvalid status false return validation response */

    if (!isValid.status) {
        /**  Return response */
        return res.status(isValid.status_code).json(isValid.error);
    }

    next();
}