// import commonConstants from '~/constants/commonConstants';
// import responseCodeConstant from '~/constants/responseCodeConstant';
// import commonHelpers from '~/helpers/commonHelpers';
// // import AdminSchema from "~/schemas/adminSchema";
// // import MemberSchema from "~/schemas/memberSchema";
// // import ClientSchema from "~/schemas/clientSchema";

// const commonHelpersObj = new commonHelpers();

// export class commonServices {

//     /**
//      * Check valid user login after JWT token validation, then check user with device ID
//      */
//     async checkValidUserLogin(req) {
//         try {
//             const { user_id: userId, device_id: deviceId, user_role: userType } = req.user;
//             // let deviceExists = {type: 1, status:false};
//             const whereUser = { _id: userId, "devices.deviceId": deviceId };
//             let userData = null;

//             // Set condition for valid login based on user type
//             if (userType === commonConstants.USER_TYPE.ADMIN) {
//                 // For admin, find the admin and check if the device exists in the `devices` array
//                 userData = await AdminSchema.findOne(whereUser);

//             } else if (userType === commonConstants.USER_TYPE.MEMBER) {
//                 // For members, find the member and check if the device exists in the `devices` array
//                 whereUser.isDeleted = commonConstants.FALSE;
//                 userData = await MemberSchema.findOne(whereUser);

//                 if(userData && userData.isActive === commonConstants.FALSE ){
//                     return { valid: false, code: responseCodeConstant.INACTIVE_USER };
//                 }

//             } else {
//                 // For clients, find the client and check if the device exists in the `devices` array
//                 whereUser.isDeleted = commonConstants.FALSE;
//                 userData = await ClientSchema.findOne(whereUser);

//                 if(userData && userData.isActive === commonConstants.FALSE ){
//                     return { valid: false, code: responseCodeConstant.INACTIVE_USER };
//                 }

//             }

//             const deviceExists = userData && userData.devices.some(device => device.deviceId === deviceId);
//             if(!deviceExists){
//                 return { valid: false, code: commonHelpersObj.getResponseCode('INVALID_TOKEN') };
//             }
//             // Return true if the user with the device is found; otherwise, return false
//             return {valid: true};

//         } catch (error) {
//             // Log error and return false in case of an exception
//             this.logger.error('Error in checkValidUserLogin', error);
//             return false;
//         }
//     }

// }

import commonConstants from "~/constants/commonConstants";
import responseCodeConstant from "~/constants/responseCodeConstant";
import commonHelpers from "~/helpers/commonHelpers";
import UsersSchema from "~/schemas/usersSchema";
import mongoose from "mongoose";

const commonHelpersObj = new commonHelpers();

export class commonServices {
  /**
   * Check valid user login after JWT token validation, then check user with device ID
   */
//   async checkValidUserLogin(req) {
//     try {
//       req.user.device_id = req.headers["device-id"];
//       req.user.device_type = req.headers["device-type"];
//       req.user.device_token = req.headers["device-token"];
//       req.user.app_type = req.headers["app-type"];
//       const { user_id: userId, device_id: deviceId } = req.user;
//       console.log("JWT userId:", userId);
//       console.log("Device ID from headers:", deviceId);

//       // Ensure token has required info
//       if (!userId) {
//         return {
//           valid: false,
//           code: commonHelpersObj.getResponseCode("INVALID_TOKEN"),
//         };
//       }

//       // Query user by _id and device (if device_id provided)
//       const whereUser = { _id: userId, isDeleted: commonConstants.FALSE };
//       if (deviceId) whereUser["devices.deviceId"] = deviceId;

//       const userData = await UsersSchema.findOne(whereUser);

//       if (!userData) {
//         return {
//           valid: false,
//           code: commonHelpersObj.getResponseCode("INVALID_TOKEN"),
//         };
//       }

//       // Check if user is active
//       if (userData.isActive === commonConstants.FALSE) {
//         return { valid: false, code: responseCodeConstant.INACTIVE_USER };
//       }

//       // Optionally, you can access user role from schema if needed
//       // console.log("User role:", userData.role);

//       return { valid: true, role: userData.role };
//     } catch (error) {
//       console.error("Error in checkValidUserLogin:", error);
//       return { valid: false, code: "INTERNAL_ERROR" };
//     }
//   }

async checkValidUserLogin(req) {
  try {
   const { user_id: userId } = req.user;
    if (!userId) {
      return { valid: false, code: commonHelpersObj.getResponseCode("INVALID_TOKEN") };
    }

    // const whereUser = { _id: userId, isDeleted: commonConstants.STATUS.FALSE };
    const whereUser = { _id: userId, isDeleted: { $ne: true } };

    const userData = await UsersSchema.findOne(whereUser);

    if (!userData) {
      return { valid: false, code: commonHelpersObj.getResponseCode("INVALID_TOKEN") };
    }

    if (!userData.isActive) {
      return { valid: false, code: responseCodeConstant.INACTIVE_USER };
    }

    return { valid: true, role: userData.role };

  } catch (error) {
    console.error("Error in checkValidUserLogin:", error);
    return { valid: false, code: "INTERNAL_ERROR" };
  }
}

}
