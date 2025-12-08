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
}

module.exports = AttendanceController;