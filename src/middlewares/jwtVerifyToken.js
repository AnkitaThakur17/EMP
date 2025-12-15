import Jwt from "jsonwebtoken";
import commonHelpers from "~/helpers/commonHelpers";
import { commonServices } from "~/services/commonServices";

const commonServceObj = new commonServices();
const commonHelpersObj = new commonHelpers();

const jwtVerifyToken = async (req, res, next) => {

  // Get JWT secret key from environment variables
  const secretKey = process.env.JWT_SECRET_KEY;
  if (!secretKey) {
    throw new Error("JWT secret key is not defined in the environment file");
  }

  // Get JWT token from request
  const token = req.body.token || req.query.token || req.headers["access-token"];

  // Return an error if token is missing
  if (!token) {
    return res.status(403).json({
      code: commonHelpersObj.getResponseCode("ACCESS_TOKEN_REQUIRED"),
    });
  }
  try {

    // Verify JWT token
    const decoded = Jwt.verify(token, secretKey);
    // Set user data in the request object

    // req.user = decoded;
       req.user = {
        id: decoded.user_id,            
        role: decoded.user_role,        
        fullname: decoded.user_fullname,
        user_id: decoded.user_id,       
        user_role: decoded.user_role    
    };
    // Check if the user is logged in with the current device ID
    const isValid = await commonServceObj.checkValidUserLogin(req);
    if (!isValid.valid) {
      return res.status(401).json({ code: isValid.code });
    }

  } catch (err) {
    // Return an error message if token verification fails
    return res.status(401).json({
      code: commonHelpersObj.getResponseCode("INVALID_TOKEN"),
    });
  }

  // Proceed to the next middleware or route
  return next();
};

module.exports = jwtVerifyToken;
