import { StatusCodes } from "http-status-codes";
import Ajv from "ajv";
import normalise from "ajv-error-messages";
import addFormats from "ajv-formats";
const ajv = new Ajv({ useDefaults: true, allErrors: true, coerceTypes: true, $data: true });
addFormats(ajv);

// Register custom keyword to check for non-blank (trimmed) strings
ajv.addKeyword({
  keyword: 'isNotBlank',
  type: 'string',
  validate: function isNotBlank(schema, data) {
    if (!schema) return true;
    return typeof data === 'string' && data.trim().length > 0;
  },
  errors: false
});

require("ajv-errors")(ajv, { singleError: true })
import responseCodeConstant from "~/constants/responseCodeConstant";

const validateSchema = function (reqData, schema) {
    // compile  schema
    const validate = ajv.compile(schema);
    // check validation using request 
    const valid = validate(reqData);
    // var valid;
    // if (Object.keys(req.query).length > 0) {
    //     valid = validate(req.query);
    // } else if (Object.keys(req.params).length > 0) {
    //     valid = validate(req.params);
    // } else {
    //     valid = validate(req.body);
    // }

    // check if req body fail validation then set error response
    if (!valid) {
        // get error object from validate
        var ajvErrors = validate.errors;
        // normalize error 
        var normalisedErrors = normalise(ajvErrors);
        // get fist error message 
        var errorFirstMsg = validate.errors[0].message;
        var resMsg = (errorFirstMsg.substring(0, errorFirstMsg.indexOf(';')) != '') ? (errorFirstMsg.substring(0, errorFirstMsg.indexOf(';'))) : errorFirstMsg;
        // resMsg = commonHelpers.getResponseCode(resMsg);

        // if (validate.errors[0].keyword === 'required') {
        //     resMsg = commonHelpers.getResponseCode('REQUIRED_FIELD_MSG') + " " + `'${validate.errors[0].params.missingProperty}'`;
        // } else {
        //     resMsg = commonHelpers.getResponseCode(validate.errors[0].message)
        // }


        // set validation error response
        const responseObj = { "code": responseCodeConstant.VALIDATION_ERROR, "message": resMsg, "data": normalisedErrors };

        // return 
        return { 'status': false, 'status_code': StatusCodes.BAD_REQUEST, 'error': responseObj };
    }
    // set response when validation pass
    return { 'status': true, 'error': '' };

}

export default validateSchema;