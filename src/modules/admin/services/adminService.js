import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

class adminService {
  constructor({
    logger,
    DateTimeUtil,
    passwordHash,
    Email,
    commonHelpers,
    commonConstants,
    BaseModel,
    UsersSchema,
  }) {
    (this.logger = logger),
      (this.DateTimeUtil = DateTimeUtil),
      (this.passwordHash = passwordHash),
      (this.Email = Email),
      (this.commonHelpers = commonHelpers),
      (this.commonConstants = commonConstants),
      (this.BaseModel = BaseModel),
      (this.UsersSchema = UsersSchema);
  }

  /**
   * Create employee account Service
   * @param {*} requestData
   * @param {*} requestHeader
   * @returns
   */

  async createEmployee(requestData, requestHeader) {
    try {

      if (requestHeader.user_role !== "admin") {
        return this.commonHelpers.prepareResponse(
          StatusCodes.BAD_REQUEST,
          "ONLY_ADMIN_ALLOWED"
        );
      }

      const {
        fullname,
        email,
        password,
        designation,
        employeeCode,
        team,
        dob,
        subrole,
      } = requestData;

      //check if email already exists

      // Query for checking existing email
      const whereEmail = {
        email: email,
        isDeleted: this.commonConstants.STATUS.NOT_DELETED,
      };

      // Check if email already exists
      const fetchExistingEmail = await this.UsersSchema.findOne(whereEmail, {
        _id: 1, 
        email: 1,
      });
      if (fetchExistingEmail) {
        return await this.commonHelpers.prepareResponse(
          StatusCodes.BAD_REQUEST,
          "EMAIL_ALREADY_EXIST"
        );
      }

      //create new employee
      let newEmployeeData = {
        fullname,
        email,
        password: await this.passwordHash.cryptPassword(password),
        designation,
        employeeCode,
        team,
        dob,
        subrole,
        role: "employee",
        devices: [
          {
            deviceType: requestHeader["device-type"],
            deviceId: requestHeader["device-id"],
            deviceToken: requestHeader["device-token"],
            appType: requestHeader["app-type"],
          },
        ],
      };
      const newEmployee = await this.UsersSchema.create(newEmployeeData);

      //prepare response data
      const userData = await this.UsersSchema.findById(newEmployee._id).select(
        "_id fullname email isActive designation employeeCode team dob subrole devices"
      );
      const responseData = await this.commonHelpers.getLoginResponse(
        userData.toObject(),
        this.commonConstants.USER_TYPE.USER
      );
      return await this.commonHelpers.prepareResponse(
        StatusCodes.OK,
        "SUCCESS",
        responseData
      );
    } catch (error) {
      this.logger.error("Error in createEmployee: ", error);
      return await this.commonHelpers.prepareResponse(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "ERROR",
        error.message
      );
    }
  }

  /**
   * Get employee accounts Service
   * @param {*} reqParams
   * @param {*} requestHeader
   * @returns
   */
  async getEmployees(reqParams, requestHeader) {
    
    try {
      if (requestHeader.user_role !== "admin") {
        return this.commonHelpers.prepareResponse(
          StatusCodes.BAD_REQUEST,
          "ONLY_ADMIN_ALLOWED"
        );
      }

      const filter = { role: "employee" };
      //fetch all employees
      const employees = await this.BaseModel.fetchAll(
        this.UsersSchema,
        "createdAt",
        "desc",
        null,
        0,
        filter,
        [
          "fullname",
          "email",
          "designation",
          "employeeCode",
          "team",
          "dob",
          "subrole",
        ]
      );

      //count them
      const count = await this.BaseModel.getCount(filter, this.UsersSchema);

      return await this.commonHelpers.prepareResponse(
        StatusCodes.OK,
        "SUCCESS",
        { count, employees }
      );
    } catch (error) {
      this.logger.error("Error in getEmployees: ", error);
      return await this.commonHelpers.prepareResponse(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "ERROR",
        error.message
      );
    }
  }

  /**
   * Get single employee service
   * @param {*} reqParams
   * @param {*} requestHeader
   * @returns
   */
  async getEmployee(reqParams, requestHeader) {
    try {
      if (requestHeader.user_role !== "admin") {
        return this.commonHelpers.prepareResponse(
          StatusCodes.BAD_REQUEST,
          "ONLY_ADMIN_ALLOWED"
        );
      }
      console.log("REQUEST HEADER INSIDE SERVICE ===>", requestHeader);
      const { userId } = reqParams;
      const userData = await this.BaseModel.fetchSingleObj(
        { _id: new mongoose.Types.ObjectId(userId) },
        // { userId },
        this.UsersSchema,
        "fullname email designation employeeCode team dob subrole"
      );
      if (!userData) {
        return await this.commonHelpers.prepareResponse(
          StatusCodes.BAD_REQUEST,
          "INVALID_USER_ID"
        );
      }
      return await this.commonHelpers.prepareResponse(
        StatusCodes.OK,
        "SUCCESS",
        userData
      );
    } catch (error) {
      this.logger.error("Error in getEmployee: ", error);
      return await this.commonHelpers.prepareResponse(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "ERROR",
        error.message
      );
    }
  }
}

module.exports = adminService;
