const { StatusCodes } = require("http-status-codes");
const { mongoose } = require("mongoose");

class attendanceService {
  constructor({
    logger,
    DateTimeUtil,
    passwordHash,
    Email,
    commonHelpers,
    commonConstants,
    BaseModel,
    AttendanceSchema,
    UsersSchema,
  }) {
    (this.logger = logger),
      (this.DateTimeUtil = DateTimeUtil),
      (this.passwordHash = passwordHash),
      (this.Email = Email),
      (this.commonHelpers = commonHelpers),
      (this.commonConstants = commonConstants),
      (this.BaseModel = BaseModel),
      (this.AttendanceSchema = AttendanceSchema);
    this.UsersSchema = UsersSchema;
  }

  /**
   * Punch In Service
   * @param {*} requestData
   * @param {*} requestHeader
   * @returns
   */

  async punchIn(requestUser, requestHeader) {
    try {
      // get today's date
      const today = await this.DateTimeUtil.getCurrentDate();

      // check if punched-in already
      const existing = await this.AttendanceSchema.findOne({
        userId: requestUser.user_id,
        punchDate: today,
      });

      if (existing) {
        return this.commonHelpers.prepareResponse(
          StatusCodes.BAD_REQUEST,
          "ALREADY_PUNCHED_IN_TODAY"
        );
      }

      //calculate status
      const currentTime = this.DateTimeUtil.getLocalCurrentTime();
      const cutoff = "10:30:00";

      const punctualStatus = currentTime > cutoff ? "Late" : "On-Time";

      const punchData = {
        userId: requestUser.user_id,
        punchDate: today,
        punchInTime: this.DateTimeUtil.getLocalCurrentTime(),
        punchType: "WEB",
        punctualStatus,
      };

      const newPunch = await this.AttendanceSchema.create(punchData);
      return this.commonHelpers.prepareResponse(
        StatusCodes.OK,
        "SUCCESS",
        newPunch
      );
    } catch (error) {
      this.logger.error("Error in punchIn: ", error);
      return await this.commonHelpers.prepareResponse(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "ERROR",
        error.message
      );
    }
  }
  /**
   * Punch Out Service
   * @param {*} requestData
   * @param {*} requestHeader
   * @returns
   */
  async punchOut(requestUser, requestHeader) {
    try {
      //check if punchedIn
      const today = await this.DateTimeUtil.getCurrentDate();

      const punchRecord = await this.AttendanceSchema.findOne({
        userId: requestUser.user_id,
        punchDate: today,
      });

      if (!punchRecord) {
        return this.commonHelpers.prepareResponse(
          StatusCodes.BAD_REQUEST,
          "PUNCH_IN_REQUIRED"
        );
      }

      if (punchRecord.punchOutTime) {
        return this.commonHelpers.prepareResponse(
          StatusCodes.BAD_REQUEST,
          "ALREADY_PUNCHED_OUT"
        );
      }

      const punchOutTime = this.DateTimeUtil.getLocalCurrentTime();
      punchRecord.punchOutTime = punchOutTime;

      const { hours, minutes } = this.commonHelpers.calculateWorkingHours(
        punchRecord.punchInTime,
        punchOutTime
      );
      punchRecord.workingHours = `${hours}h ${minutes}m`;

      await punchRecord.save();

      const responseData = punchRecord.toObject();
      responseData.leavingTime = punchOutTime;

      return this.commonHelpers.prepareResponse(
        StatusCodes.OK,
        "SUCCESS",
        responseData
      );
    } catch (error) {
      this.logger.error("Error in punchIn: ", error);
      return await this.commonHelpers.prepareResponse(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "ERROR",
        error.message
      );
    }
  }
  /**
   * Get attendance records service
   * @param {*} requestUser
   * @param {*} requestHeader
   * @returns
   */
  async myAttendance(requestUser, requestHeader) {
    try {
      const employeeId = requestUser.user_id;

      const query = { userId: employeeId };

      const selectFields =
        "userId punchDate punchInTime leavingTime workingHours punctualStatus punchType";

      const record = await this.BaseModel.fetchSingleObj(
        query,
        this.AttendanceSchema,
        selectFields
      );

      return this.commonHelpers.prepareResponse(
        StatusCodes.OK,
        "SUCCESS",
        record
      );
    } catch (error) {
      this.logger.error("Error in getAttendance: ", error);
      return this.commonHelpers.prepareResponse(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "ERROR",
        error.message
      );
    }
  }
}

module.exports = attendanceService;
