require('dotenv').config();
const { createContainer, asClass, asValue, asFunction } = require('awilix');
const container = createContainer();

//user all dependency
const userModule = require("./dependency/usersDependency");
const UsersSchema = require('./schemas/usersSchema');
container.register(userModule);

//admin all dependency
const adminModule = require("./dependency/adminDependency");
container.register(adminModule);

//attendance all dependency
const attendanceModule = require("./dependency/attendanceDependency");
container.register(attendanceModule);

// Global files
container.register({
  logger: asValue(require("~/utils/logger").default),
  DateTimeUtil: asClass(require('~/utils/DateTimeUtil')).singleton(),
  passwordHash: asValue(require("~/utils/passwordHash").default),
  checkApiHeaders: asValue(require("~/middlewares/checkApiHeaders")),
  jwtVerifyToken: asValue(require("~/middlewares/jwtVerifyToken")),
  JwtAuthSecurity: asClass(require('~/libraries/JwtAuthSecurity')).singleton(),
  // roleAccess: asValue(require("./middlewares/roleAccess")),
  commonHelpers: asClass(require("~/helpers/commonHelpers")).singleton(),
  FirebaseLib: asClass(require('~/libraries/FirebaseLib')).singleton(),
  BaseModel: asClass(require('~/models/baseModel').default),
  AttendanceModel: asClass(require("./models/attendanceModel")),
  Email: asClass(require('~/libraries/Email')).singleton(),
  FileUpload: asClass(require('~/libraries/FileUpload')).singleton(),
  StripeLib: asClass(require('~/libraries/StripeLib')).singleton(),
  NotificationHelper: asClass(require("~/helpers/notificationHelper")).singleton(),
  verifyAccess: asValue(require("~/middlewares/verifyAccess")),
  commonConstants: asValue(require('./constants/commonConstants')),
  folderConstants: asValue(require('./constants/folderConstants').default),
  roleConstants: asValue(require('./constants/roleConstants').default),
  rolePermissions: asValue(require('./constants/rolePermissions').default),
  TwilioObj: asClass(require('~/libraries/Twilio')).singleton(),
});

// Schema file
container.register({
  UsersSchema: asValue(require('./schemas/usersSchema')),
  AttendanceSchema: asValue(require('./schemas/attendanceSchema')),
  // ClientSchema: asValue(require('./schemas/clientSchema')),
  // MemberSchema: asValue(require('./schemas/memberSchema')),
  // ProjectSchema: asValue(require('./schemas/projectSchema')),
  // SettingsSchema: asValue(require('./schemas/settingsSchema')),
  // TaskSchema: asValue(require('./schemas/taskSchema')),
  // ProjectNotesSchema: asValue(require('./schemas/projectNotesSchema'))
});

// Response handler file
container.register({
  responseHandler: asClass(require('~/middlewares/responseHandler')).singleton()
});

// Make the container available for other parts of your application
module.exports = container;