import { StatusCodes } from "http-status-codes";

class authService {
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
    this.DateTimeUtil = DateTimeUtil;
    this.logger = logger;
    this.passwordHash = passwordHash;
    this.Email = Email;
    this.commonHelpers = commonHelpers;
    this.commonConstants = commonConstants;
    this.BaseModel = BaseModel;
    this.UsersSchema = UsersSchema;
  }

  /**
   * User Login Service
   * @param {*} requestData
   * @returns
   */
  async login(requestData, requestHeader) {
    try {
      // Fetch user by email
      const userData = await this.BaseModel.fetchSingleObj(
        { email: requestData.email, isActive: true },
        this.UsersSchema,
        "email password role fullname subrole"
      );

      // If no user found
      if (!userData) {
        return await this.commonHelpers.prepareResponse(
          StatusCodes.BAD_REQUEST,
          "USER_NOT_FOUND"
        );
      }

      // Compare password
      const isMatch = this.passwordHash.compareSync(
        requestData.password,
        userData.password
      );

      if (!isMatch) {
        return await this.commonHelpers.prepareResponse(
          StatusCodes.BAD_REQUEST,
            "INVALID_LOGIN_CREDENTIALS"
        );
      }

      // Prepare login response (JWT, user info, etc.)
      const responseData = await this.commonHelpers.getLoginResponse(
        userData,
        userData.role,
        userData.fullname,
        userData.subrole,
      );

      // Return success response
      return await this.commonHelpers.prepareResponse(
        StatusCodes.OK,
      "SUCCESS",
        responseData
      );
       // return this.commonHelpers.prepareResponse(StatusCodes.BAD_REQUEST,"USER_NOT_FOUND");
    } catch (error) {
      this.logger.error("Error in login:", error);

      return await this.commonHelpers.prepareResponse(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "INTERNAL_SERVER_ERROR"
      );
    }
  }


  /**
   * User Logout Service
   * @param {*} requestData
   * @param {*} requestUser
   * @returns
   */

  async logout (requestData, requestUser){
    try {
    const userId = requestUser.user_id;
    const user = await this.BaseModel.fetchSingleObj(
      { _id: userId },
      this.UsersSchema
    );

    if(!user){
          return await this.commonHelpers.prepareResponse(
          StatusCodes.BAD_REQUEST,
          "USER_NOT_FOUND"
        );
    }
        // invalidating token 
      await this.UsersSchema.updateOne(
      { _id: userId },
      { $unset: { refreshToken: "" } }
    );

      return this.commonHelpers.prepareResponse(
      StatusCodes.OK,
      "LOGOUT_SUCCESS"
    );

    } catch (error) {
    this.logger.error("Error in logout", error);
    return this.commonHelpers.prepareResponse(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "ERROR",
      error.message
    )
    }
  }


  /**
   * Admin forgot password Service
   * @param {*} requestData
   * @returns
   */
  // async forgotPassword(requestData) {
  //     try {
  //         const email = requestData.email;
  //         const code = await this.commonHelpers.getOtp();

  //         // Find admin by email and check if they are active
  //         let checkEmail = await this.BaseModel.fetchSingleObj({ email: email, isActive: true }, this.AdminSchema);

  //         // Check if email does not exist
  //         if (!checkEmail) {
  //             return await this.commonHelpers.prepareResponse(StatusCodes.BAD_REQUEST, 'USER_NOT_FOUND');
  //         }

  //         // Get today's date in YYYY-MM-DD format
  //         const todayDate = new Date();
  //         const formattedDate = todayDate.toISOString().split('T')[0]; // YYYY-MM-DD

  //         const otpCountEntry = await this.BaseModel.fetchSingleObj({
  //             otpType: this.commonConstants.SIGNUP_VERIFICATION_TYPE.EMAIL,
  //             email: email,
  //             date: { $gte: new Date(formattedDate), $lt: new Date(new Date(formattedDate).getTime() + 24 * 60 * 60 * 1000) } // Today's date range
  //         }, this.UserOtpCountSchema);

  //         // Set the maximum email limit
  //         const MAX_EMAIL_LIMIT = this.commonConstants.MAX_EMAIL_LIMIT;

  //         // If there is an entry, check the count
  //         if (otpCountEntry) {
  //             if (otpCountEntry.otpCount >= MAX_EMAIL_LIMIT) {
  //                 return await this.commonHelpers.prepareResponse(StatusCodes.BAD_REQUEST, 'EMAIL_LIMIT_EXCEEDED');
  //             }
  //             // Increment the count
  //             otpCountEntry.otpCount += 1;
  //             await this.BaseModel.updateObj(otpCountEntry, { _id: otpCountEntry._id }, this.UserOtpCountSchema)

  //         } else {
  //             // Create a new entry for today's date
  //             await this.BaseModel.createObj({
  //                 otpType: this.commonConstants.SIGNUP_VERIFICATION_TYPE.EMAIL,
  //                 email: email,
  //                 otpCount: 1,
  //                 date: new Date(formattedDate)
  //             }, this.UserOtpCountSchema)

  //         }

  //         // Prepare mail options for sending reset email
  //         const mailOptions = {
  //             from: process.env.SMTP_FROM_MAIL, // Sender address
  //             to: email, // Receiver email
  //             subject: 'Reset Password - ' + process.env.APP_NAME,
  //             template: 'forgotPassword', // The name of the template file i.e forgotPassword.handlebars
  //             context: {
  //                 code: code,
  //                 email: email,
  //                 admin_base_url: process.env.ASSETS_URL_BASE,
  //                 app_name: process.env.APP_NAME
  //             }
  //         };

  //         // Send email and update passCode if successful
  //         return this.Email.sendEmail(mailOptions).then(async (emailReturn) => {
  //             if (emailReturn.status) {
  //                 // Update passCode in the Admin document
  //                 await this.BaseModel.updateObj({ passCode: code }, { email: email }, this.AdminSchema)
  //                 return await this.commonHelpers.prepareResponse(StatusCodes.OK, 'SUCCESS');
  //             } else {
  //                 return await this.commonHelpers.prepareResponse(StatusCodes.BAD_REQUEST, 'EMAIL_SEND_FAIL', code);
  //             }
  //         });
  //     } catch (error) {
  //         this.logger.error('Error in admin forgot password', error);
  //         return this.commonHelpers.prepareResponse(StatusCodes.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERROR');
  //     }
  // }

  /**
   * Reset password Service
   * @param {*} requestData
   * @returns
   */
  // async resetPassword(requestData) {
  //     try {
  //         const email = requestData.email;
  //         const password = requestData.password;
  //         const code = requestData.code;
  //         const currentTime = this.DateTimeUtil.getCurrentTimeObjForDB();

  //         // Fetch the passCode for the provided email
  //         const admin = await this.BaseModel.fetchSingleObj({ email: email, isActive: true }, this.AdminSchema);

  //         // Check if admin object is null or undefined
  //         if (!admin) {
  //             return await this.commonHelpers.prepareResponse(StatusCodes.BAD_REQUEST, 'ADMIN_NOT_FOUND');
  //         }

  //         // If code is already used (i.e., null passCode)
  //         if (admin.passCode === null) {
  //             return await this.commonHelpers.prepareResponse(StatusCodes.BAD_REQUEST, 'CODE_ALREADY_USED');
  //         }

  //         // Check if the provided verification code matches the stored code
  //         if (!admin || admin.passCode != code) {
  //             return await this.commonHelpers.prepareResponse(StatusCodes.BAD_REQUEST, 'CODE_DOESNT_MATCH');
  //         }

  //         // Encrypt the new password
  //         const hashPassword = await this.passwordHash.cryptPassword(password);

  //         // Update the admin password and reset the passCode to null
  //         await this.BaseModel.updateObj({
  //             password: hashPassword,
  //             updatedAt: currentTime,
  //             passCode: null
  //         }, { email: email }, this.AdminSchema)

  //         return await this.commonHelpers.prepareResponse(StatusCodes.OK, 'SUCCESS');
  //     } catch (error) {
  //         this.logger.error('Error in admin reset password', error);
  //         return this.commonHelpers.prepareResponse(StatusCodes.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERROR');
  //     }
  // }
}

module.exports = authService;
