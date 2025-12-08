import commonConstants from "~/constants/commonConstants";

/**
 * Helper function for validating files.
 *
 * @param  {Object}   fileObject
 * @param  {Object}   fileSchema
 */
export const fileValidator = function(reqFiles) {
    const responseObj = {status: true };
    if (Array.isArray(reqFiles) && reqFiles.length > 0) {
        for (let i = 0; i < reqFiles.length; i++) {
            
            if (reqFiles[i].size > commonConstants.MAX_SIZE) {
                // set validation error response
                responseObj.message = `File ${reqFiles[i].name} exceeds 10 MB limit`;
                responseObj.status = false ; 
                
            }
        }
    } else if (reqFiles && reqFiles.size > commonConstants.MAX_SIZE) {
        // Single file case (not in an array)
        responseObj.message = `File ${reqFiles.name} exceeds 10 MB limit`;
        responseObj.status = false ; 

        return responseObj;
       
    }
    return responseObj;
};

