import validateSchema from '~/utils/validate'

const schema = {
    type: "object",
    properties: {
        pageName: {
            enum: ["aboutUs", "termsCondition", "privacyPolicy"],
            errorMessage: {
                enum: "Page name must be equal to one of the allowed values (aboutUs,termsCondition,privacyPolicy)."
            }
        },
    },
    required: ["pageName"],
    additionalProperties: true, //make addition parameter allow in request body by makeing additionalProperties =true 
}

export const contentValidator = (req, resp, next) => {
    const isvalid = validateSchema(req.body, schema);
    if (!isvalid.status) {
        //return response
        return resp.status(isvalid.status_code).json(isvalid.error);
    }
    next();
}