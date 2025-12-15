class AttendanceController {
     constructor({ attendanceService, responseHandler }) {
    (this.attendanceService = attendanceService),
      (this.responseHandler = responseHandler);
  }

  //Handles punchIn
  async punchIn(req, res, next){
    const returnData = await this.attendanceService.punchIn(req.user, req.headers);
    await this.responseHandler.handleServiceResponse(req, res, returnData);
  }

  //Handles punchOut
  async punchOut(req, res, next){
    const returnData = await this.attendanceService.punchOut(req.user, req.headers);
    await this.responseHandler.handleServiceResponse(req, res, returnData);
  }

  //Handles getMyAttendance
  async myAttendance(req, res, next){
    const returnData = await this.attendanceService.myAttendance(req.user, req.headers);
    await this.responseHandler.handleServiceResponse(req, res, returnData)
  }

  //Handles allAttendance
  async allAttendance(req, res, next){
    const returnData = await this.attendanceService.allAttendance(req.user, req.query, req.headers);
    await this.responseHandler.handleServiceResponse(req, res, returnData)
  }
}

module.exports = AttendanceController;