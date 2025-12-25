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
    AttendanceModel,
  }) {
    (this.logger = logger),
      (this.DateTimeUtil = DateTimeUtil),
      (this.passwordHash = passwordHash),
      (this.Email = Email),
      (this.commonHelpers = commonHelpers),
      (this.commonConstants = commonConstants),
      (this.BaseModel = BaseModel),
      (this.AttendanceSchema = AttendanceSchema);
      (this.UsersSchema = UsersSchema);
      (this.AttendanceModel = AttendanceModel)
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

      if (punchRecord.leavingTime) {
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

      // Fetch all records for this user
      const searchQuery = { userId: employeeId };

      const selectFields =
        "userId punchDate punchInTime leavingTime workingHours punctualStatus punchType";

      const records = await this.BaseModel.fetchAll(
        this.AttendanceSchema,
        "punchDate",
        "desc",
        null,
        0,
        searchQuery,
        selectFields.split(" ")
      );
      return this.commonHelpers.prepareResponse(
        StatusCodes.OK,
        "SUCCESS",
        records
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

  /**
   * Get all attendance records of employee service
   * @param {*} requestUser
   * @param {*} requestHeader
   * @param {*} reqQuery
   * @returns
   */
async allAttendance(requestUser, reqQuery, requestHeader) {
  try {
    const { role, subrole } = requestUser;

    const isAdmin = role === "admin";
    const isHR = subrole === "HR";

    if (!isAdmin && !isHR) {
      return this.commonHelpers.prepareResponse(
        StatusCodes.BAD_REQUEST,
        "ONLY_ADMIN_AND_HR_ALLOWED"
      );
    }

    // Extract only VALID fields from reqQuery
    let {
      startDate,
      endDate,
      pageNo,
      search,
      teamFilter,
      statusFilter
    } = reqQuery;

    pageNo = pageNo ? parseInt(pageNo) : 1

    let filter = { "employee.role": "employee" };
       //search in name
      if(search){
      const searchValue = search.trim()
       const searchKey = {"employee.fullname":true}
       const searchCondition = Object.keys(searchKey)
       .map((item)=>({
        [item]:{$regex : searchValue, $options: "i"}
       }));
      //  console.log(searchCondition)
      filter['$or'] = searchCondition
      //  console.log(filter)
       }

    if(teamFilter) filter["employee.team"] = teamFilter;

    if(statusFilter) filter["punctualStatus"] = statusFilter;
   
    if (startDate && endDate) {
      filter.punchDate = { $gte: startDate, $lte: endDate };
    }

    const finalLimit = 5;
    const finalOffset = (pageNo - 1) * finalLimit;

    // console.log(JSON.stringify(filter))
    // Fetch attendance
    const attendance = await this.AttendanceModel.getAttendanceList(
      this.AttendanceSchema,
      filter,
      finalLimit,
      finalOffset,
    );

    const count = await this.AttendanceModel.getAttendanceList(
      this.AttendanceSchema,
      filter,
      finalLimit,
      finalOffset,
      true
    );


    return this.commonHelpers.prepareResponse(
      StatusCodes.OK,
      "SUCCESS",
     { attendance, count:count[0].totalAttendance}
    );

  } catch (error) {
    this.logger.error("Error in allAttendance", error);
    return this.commonHelpers.prepareResponse(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "ERROR",
      error.message
    );
  }
}
}

module.exports = attendanceService;