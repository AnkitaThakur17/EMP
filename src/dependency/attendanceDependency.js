const { asClass } = require("awilix");

const attendanceContainer = {
    attendanceController: asClass(require("../modules/attendance/content/controllers/attendanceController")).singleton(),
    attendanceService: asClass(require("../modules/attendance/content/services/attendanceService")).singleton()

}

module.exports = {
    ...attendanceContainer,
}