import commonConstants from '~/constants/commonConstants';
import commonHelpers from '~/helpers/commonHelpers';
import url from 'url';
let commonHelpersObj = new commonHelpers()

/**
 * Verify user access.
 *
 * @param  {Object} req Request.
 * @param  {Object} res Response.
 * @param  {Object} next Next request.
 */
const verifyAccess = async (req, res, next) => {

    const userType = req.user.user_role,
        endPoint = req.baseUrl,
        parsedUrl = url.parse(endPoint),
        pathName = parsedUrl.pathname,
        pathSegments = pathName.split('/'); // Split path into segments
    let allowedEndPoints, checkUserType;

    // Get the HTTP method
    const httpMethod = req.method;

    let apiEndPoint = pathSegments[1].toLowerCase(); // Get the last segment

    if (httpMethod == 'DELETE') {
        apiEndPoint = pathSegments[1].toLowerCase();
    }

    if (httpMethod == 'POST' && pathSegments.length == 4) {
        apiEndPoint = pathSegments[1].toLowerCase();
    }

    // Concatenate the HTTP method with the endpoint
    const fullEndPoint = `${httpMethod}-${apiEndPoint}`;

    if (userType == commonConstants.USER_TYPE.CLIENT) {
        allowedEndPoints = ['POST-client', 'GET-client', 'DELETE-client', 'PATCH-client', 'PUT-client'];
        checkUserType = commonConstants.USER_TYPE.CLIENT

    } else if (userType == commonConstants.USER_TYPE.MEMBER) {
        allowedEndPoints = ['POST-member', 'GET-member', 'DELETE-member', 'PATCH-member', 'PUT-member'];
        checkUserType = commonConstants.USER_TYPE.MEMBER
    }
    else if (userType == commonConstants.USER_TYPE.ADMIN) {
        allowedEndPoints = ['POST-admin', 'GET-admin', 'DELETE-admin', 'PATCH-admin', 'PUT-admin'];
        checkUserType = commonConstants.USER_TYPE.ADMIN
    };

    if (!allowedEndPoints.includes(fullEndPoint) && userType == checkUserType) {
        const responseObj = { "code": commonHelpersObj.getResponseCode('ACCESS_DENIED_FOR_THIS_USER') };
        return res.status(400).json(responseObj);
    }

    next();
};

module.exports = verifyAccess;