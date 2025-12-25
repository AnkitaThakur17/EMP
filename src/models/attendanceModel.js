class attendanceModel {
  constructor({ AttendanceSchema }) {
    this.AttendanceSchema = AttendanceSchema;
  }

  /**
   * Get Attendance List with Filters, Lookup & Pagination
   */
  async getAttendanceList(Model, where = {}, limit,  offset, getCount = false) {
    try {
      const commonPipeline = [
     
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
        {$match : where},
        // Flatten array
        {
          $addFields: {
            employee: { $arrayElemAt: ["$employee", 0] },
          },
        },

        // Project attendance + employee fields
 
      ];
      const resultPipleline = [
        ...commonPipeline,
          {
          $project: {
            _id: 1,
            punchDate: 1,
            punchInTime: 1,
            leavingTime: 1,
            workingHours: 1,
            punctualStatus: 1,
            punchType: 1,
            employeeId: "$employee._id",
            fullname: "$employee.fullname",
            email: "$employee.email",
            team: "$employee.team",
            role: "$employee.role",
            subrole: "$employee.subrole"
          },
        },
        { $sort: { punchDate: -1 } },
        { $skip: offset },
        { $limit: limit },
      ];

      const countPipeline = [...commonPipeline,  { $count: "totalAttendance"} ]
      if(!getCount){
        return await Model.aggregate(resultPipleline);
      }else{
         return await Model.aggregate(countPipeline);
      }

    } catch (err) {
      this.logger.error("getAttendanceList Error:", err);
       return err;
    }
  }
}

module.exports = attendanceModel;
