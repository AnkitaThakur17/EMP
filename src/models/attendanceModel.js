class attendanceModel {
  constructor({ AttendanceSchema }) {
    this.AttendanceSchema = AttendanceSchema;
  }

  /**
   * Get Attendance List with Filters, Lookup & Pagination
   */
  async getAttendanceList(Model, where = {}, limit = 20, offset = 0) {
    try {
      const pipeline = [
        // Convert string userId to ObjectId
        {
          $addFields: {
            userObjId: { $toObjectId: "$userId" },
          },
        },

        // Lookup user
        {
          $lookup: {
            from: "users",
            localField: "userObjId", // converted ObjectId
            foreignField: "_id",
            as: "employee",
          },
        },

        // Flatten array
        {
          $addFields: {
            employee: { $arrayElemAt: ["$employee", 0] },
          },
        },

        // Project attendance + employee fields
        {
          $project: {
            _id: 1,
            punchDate: 1,
            punchInTime: 1,
            leavingTime: 1,
            workingHours: 1,
            punctualStatus: 1,
            punchType: 1,
            "employee._id": 1,
            "employee.fullname": 1,
            "employee.email": 1,
            "employee.team": 1,
            "employee.role": 1,
            "employee.subrole": 1,
          },
        },

        { $sort: { punchDate: -1 } },
        { $skip: offset },
        { $limit: limit },
      ];

      return await Model.aggregate(pipeline);
    } catch (err) {
      this.logger.error("getAttendanceList Error:", err);
      throw err;
    }
  }
}

module.exports = attendanceModel;
