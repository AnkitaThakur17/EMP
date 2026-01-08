import { StatusCodes } from "http-status-codes";
import responseCodeConstant from "~/constants/responseCodeConstant";
import commonHelpers from "~/helpers/commonHelpers";
import UsersSchema from "~/schemas/usersSchema";
import baseModel from "~/models/baseModel";
import { Logger } from "logger";
const commonHelpersObj = new commonHelpers();
const BaseModel = new baseModel();

export class commonServices {

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

/**
   * update all employees list
   * @param {*} requestData
   * @param {*} reqParams
   * @returns
   */
  async updateEmployee( requestUser, requestData, reqParams){
    try {

       const { user_role: user_role, user_subrole :sub_role } = requestUser;
       const { fullname, email, designation, employeeCode, team, dob, subrole } = requestData;
       const { userId } = reqParams;
       
      if (user_role !== "admin" ) {
        if(sub_role !== "HR") return commonHelpersObj.prepareResponse(
          StatusCodes.BAD_REQUEST,
          "ONLY_ADMIN_AND_HR_ALLOWED"
        );
      }

      const userData = await BaseModel.fetchSingleObj({ _id: userId }, UsersSchema, "email" )
    if(!userData) return await commonHelpersObj.prepareResponse(StatusCodes.BAD_REQUEST,
      "INVALID_USER_ID"
    )
     
    const isExistEmail = await BaseModel.fetchSingleObj({
      email : email
    }, UsersSchema,
       "email",
       {}
      //  {_id : userId} // fetch only where main id is not equals to userId
    )
    // fetch email and also check fetched email record's id if is equals to the userData ki Id then validate 
    if( isExistEmail && userData._id !== isExistEmail._id ) return await commonHelpersObj.prepareResponse(StatusCodes.BAD_REQUEST,
      "EMAIL_ALREADY_EXIST"
    )
    const isExistEmpCode = await BaseModel.fetchSingleObj(
      {
        employeeCode: employeeCode,
      },
      UsersSchema,
      "employeeCode",
      {},
      { _id: userId }
    )

    if(isExistEmpCode) return await commonHelpersObj.prepareResponse(StatusCodes.BAD_REQUEST, "EMP_CODE_ALREADY_EXIST")

    const updateObj = { fullname, email, designation, employeeCode, team, dob, subrole };
    await BaseModel.updateObj(updateObj, { _id: userId }, UsersSchema)

    return await commonHelpersObj.prepareResponse(StatusCodes.OK, "SUCCESS")        

    } catch (error) {
      Logger.error("Error in updateEmployee: ", error);
      return await commonHelpersObj.prepareResponse(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "ERROR",
        error.message
      );
    }
  }
}
