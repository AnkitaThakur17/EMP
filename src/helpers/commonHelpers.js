import Hashids from "hashids";
import responseCodeConstant from "~/constants/responseCodeConstant";
import JwtAuthSecurity from "~/libraries/JwtAuthSecurity";
import commonConstants from '~/constants/commonConstants';
// import ProjectNotesSchema from '~/schemas/projectNotesSchema';
// import ProjectSchema from '~/schemas/projectSchema';
import { StatusCodes } from "http-status-codes";
import BaseModel from "../models/baseModel";
const baseModelObj = new BaseModel();
import DateTime from "~/libraries/DateTime";
const dateTimeLibObj = new DateTime();
import tableConstants from "~/constants/tableConstants";
import moment from "moment";
const CryptoJS = require('crypto-js');
const mongoose = require('mongoose');
const generator = require('generate-password'),
    { v4: uuidv4 } = require('uuid');

// JwtAuthSecurity object
const JwtAuthSecurityObj = new JwtAuthSecurity();

// CommonHelpers class
class commonHelpers {
    constructor() {
        // Creating Hashids object with hash length of 6
        this.hashidObj = new Hashids(commonConstants.HASH_ID_SALT, 6);
    }

    // Get an encrypted string.
    encrypt(text) {
        return this.hashidObj.encode(text);
    }

    // Get a decrypted string.
    decrypt(text) {
        const output = this.hashidObj.decode(text);
        return output.length === 0 ? 0 : output[0];
    }

    // Get random number between 1000 to 9999
    getOtp() {
        // Set minimum and maximum range
        const range = { min: 1000, max: 9999 };
        const delta = range.max - range.min;

        // Get random number using math function
        return Math.floor(range.min + Math.random() * (delta + 1));
    }

    /**
     * Generate login response with JWT token
     * @param {*} userData 
     * @param {*} userType 
     * @returns login response
     */
    async getLoginResponse(userData, userType = "") {
        // userData = userData.toObject(); 
        const user_role = userType === commonConstants.USER_TYPE.ADMIN ? commonConstants.USER_TYPE.ADMIN : userType;

        const BASE_URL = process.env.ASSETS_URL_BASE;
        if (userData.profileIcon && userData.profileIcon.trim() !== "") {
            userData.profileIcon = `${BASE_URL}/${commonConstants.UPLOAD_PATH}${commonConstants.PROFILE_UPLOAD_PATH}/${userData.profileIcon}`;
        } else {
          userData.profileIcon = `${BASE_URL}${commonConstants.DEFAULT_USER_IMAGE}`;
        }
   
        userData.token = await JwtAuthSecurityObj.generateJwtToken({
            user_id: userData._id,
            device_id: userData.deviceId,
            user_role: userData.role, //role from schema
            user_fullname: userData.fullname, //name from schema
            user_subrole: userData.subrole,
            admin_id: userType === commonConstants.USER_TYPE.ADMIN ? userData._id : userData.adminId
        });

        delete userData.deviceId;
        delete userData.password;
        delete userData.devices;
        delete userData.pass_code;

        return userData;
    }

    // Generate a unique ID
    generateUniqueID() {
        return uuidv4();
    }

    // Get response code
    getResponseCode(key) {
        return responseCodeConstant[key];
    }

    // To send a response
    async prepareResponse(statusCode, messageCode, response = {}) {
        return {
            'status_code': statusCode,
            'code': this.getResponseCode(messageCode),
            'response': response
        };
    }

    // Get a random string of specified length
    getRandomString(strLength = 5, charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
        const result = [];

        while (strLength--) {
            result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
        }

        return result.join('');
    }
    // Get an encrypted string using CryptoJS.
    encryptWithCrypto(text) {
        if (!process.env.CRYPTO_SECRET_KEY) {
            throw new Error('CRYPTO_SECRET_KEY is not defined in the env file');
        }
        return CryptoJS.AES.encrypt(text, process.env.CRYPTO_SECRET_KEY).toString();
    }

    // Get a decrypted string using CryptoJS.
    decryptWithCrypto(encryptedText) {
        if (!process.env.CRYPTO_SECRET_KEY) {
            throw new Error('CRYPTO_SECRET_KEY is not defined in the env file');
        }
        return CryptoJS.AES.decrypt(encryptedText, process.env.CRYPTO_SECRET_KEY).toString(CryptoJS.enc.Utf8);
    }

    // Generate random password.
    getRandomPassword() {
        return generator.generate({
            length: 8,
            numbers: true,
            uppercase: true,
            lowercase: true,
            strict: true,
        });
    }

    // Check if a string is valid JSON
    async isValidJson(jsonData) {
        try {
            JSON.parse(jsonData);
            return true;
        } catch (e) {
            return false;
        }
    }

    async getJwtToken(tokenData) {
        const token = await JwtAuthSecurityObj.generateJwtToken(tokenData);
        return token;
    }

    async isValidID(id) {
        try {
            const isValid = mongoose.Types.ObjectId.isValid(id.trim());
            if (isValid) {
                return true; // Valid ObjectId
            } else {
                return false; // Invalid ObjectId
            }
        } catch (error) {
            console.error('Error validating ObjectId:', error.message);
            return error; // Return false in case of an unexpected error
        }
    }

    async generate5DigitSerialNumber(previousNumber = '00000') {
        const nextNumber = parseInt(previousNumber, 10) + 1;
        return String(nextNumber).padStart(5, '0'); // Ensure the number is 5 digits long
    }

    async toObjectId(id) {
        return new mongoose.Types.ObjectId(String(id));
    }

    /**
     * Validate task data for add/update operations.
     * @param {Object} params - All dependencies and data needed for validation.
     * @param {String} params.adminId - The admin ID.
     * @param {String} params.creatorId - The user/member creating the task.
     * @param {String} params.createdByType - The type of user creating the task (admin/member).
     * @param {String} params.clientId - The client ID.
     * @param {String} params.projectId - The project ID.
     * @param {Array} params.assignees - Array of member IDs assigned to the task.
     * @param {String} params.approvalTypeId - The approval type ID.
     * @param {Object} params.ClientSchema - Mongoose Client schema.
     * @param {Object} params.ProjectSchema - Mongoose Project schema.
     * @param {Object} params.MemberSchema - Mongoose Member schema.
     * @param {Object} params.SettingsSchema - Mongoose Settings schema.
     * @returns {Object|null} - Returns a response object on validation failure, or null on success.
     */
    async validateTaskData({
        adminId,
        creatorId,
        createdByType,
        clientId,
        projectId,
        assignees,
        approvalTypeId,
        ClientSchema,
        ProjectSchema,
        MemberSchema,
        SettingsSchema,
        taskId
    }) {
        const adminObjectId = await this.toObjectId(adminId),
            clientObjectId = await this.toObjectId(clientId),
            projectObjectId = await this.toObjectId(projectId);
        // Validate projectId
        const project = await baseModelObj.fetchSingleObj(
            { adminId: adminObjectId, _id: projectObjectId, isDeleted: commonConstants.FALSE },
            ProjectSchema,
            'teamMembers addTasks clientId isActive'
        );
        if (!project) {
            return this.prepareResponse(StatusCodes.BAD_REQUEST, 'INVALID_PROJECT_ID');
        }

        if (!project.isActive) {
            return this.prepareResponse(StatusCodes.BAD_REQUEST, 'PROJECT_INACTIVE');
        }

        if (clientId != project.clientId.toString()) {
            return this.prepareResponse(StatusCodes.BAD_REQUEST, 'MISSMATCH_CLIENT_ID');
        }

        const projectMembers = project.teamMembers.map(String);
        
        // If createdByType is member, check permission (member must be in teamMembers)
        if (createdByType === commonConstants.USER_TYPE.MEMBER) {
            // Check if the user has permission to add tasks
            if (!project.addTasks) {
                return this.prepareResponse(StatusCodes.BAD_REQUEST, 'MEMBER_NOT_ALLOWED_TO_ADD_TASK');
            }
            // Check if the creatorId is part of the project team members
            if (!project.teamMembers || project.teamMembers.length == 0 || !projectMembers.includes(creatorId)) {
                return this.prepareResponse(StatusCodes.BAD_REQUEST, 'INVALID_MEMBER_TO_ADD_TASK');
            }
        }

        // Validate clientId
        const client = await baseModelObj.fetchSingleObj(
            { adminId: adminObjectId, _id: clientObjectId, isDeleted: commonConstants.FALSE },
            ClientSchema,
            '_id isActive isDeleted'
        );
        if (!client) {
            return this.prepareResponse(StatusCodes.BAD_REQUEST, 'INVALID_CLIENT_ID');
        }

        // if (!client.isActive) {
        //     return this.prepareResponse(StatusCodes.BAD_REQUEST, 'CLIENT_INACTIVE');
        // }

        // if (!client.isDeleted) {
        //     return this.prepareResponse(StatusCodes.BAD_REQUEST, 'CLIENT_DELETED');
        // }
        
        // Validate assignees
        if (!Array.isArray(assignees) || assignees.length == 0) {
            return this.prepareResponse(StatusCodes.BAD_REQUEST, 'INVALID_MEMBER_ID');
        }
        const query = {
           adminId: adminObjectId,
           _id: { $in: assignees },
         };
         if (!taskId) {
           query.isDeleted = commonConstants.FALSE;
           query.isActive = commonConstants.TRUE;
         }
        const checkAssignees = await baseModelObj.fetchObj(
            query,
            MemberSchema,
            '_id'
        );
        const validAssignees = checkAssignees.map(member => String(member._id));
        // Validate all members is active
        if (validAssignees.length !== assignees.length) {
            return this.prepareResponse(StatusCodes.BAD_REQUEST, 'INVALID_MEMBER_ID');
        }
        
        // Validate all members has assigned to the project
        if(!validAssignees.every((taskMember) => projectMembers.includes(taskMember))) {
            return this.prepareResponse(StatusCodes.BAD_REQUEST, 'INVALID_MEMBER_ID');
        }

        // Validate approvalTypeId
        const settings = await baseModelObj.fetchSingleObj(
            { adminId: adminObjectId },
            SettingsSchema,
            'approvalTypes'
        );
        
        const approvalTypeIds = settings && Array.isArray(settings.approvalTypes) ? settings.approvalTypes.map(type => type._id.toString()) : [];
        
        if (!approvalTypeIds.includes(approvalTypeId)) {
            return this.prepareResponse(StatusCodes.BAD_REQUEST, 'INVALID_APPROVAL_TYPE_ID');
        }
        
        // All validations passed
        return null;
    }


    /** Validate log time data for adding or updating task logs.
     * 
     * @param {String} id - The admin ID / Member ID.
     * @param {Object} creatorId - The ID of the user creating or updating the log.
     * @param {String} createdByType - The type of user creating the log (admin/member).
     * @param {String} TaskSchema - Mongoose Task schema.
     * @param {String} ProjectSchema - Mongoose Task schema.
     * @param {String} taskId - The task ID.
     * @param {String} projectId - The project ID.
     * @param {String} date - The date of the log.   
     * @param {Number} actualHours - The actual hours logged.
     * @param {Number} billableHours - The billable hours logged.
     * @param {String} note - The note for the log.
     * @param {String} logId - The log ID (optional, for updates).
     * @returns {Object|null} - Returns a response object on validation failure, or null on success.
     */
    async saveTaskLogTime(id, creatorId, createdByType, ProjectSchema, TaskSchema, taskId, projectId, date, actualHours, billableHours, note, logId = null) {
        let memberId, adminId;
        if (createdByType == commonConstants.USER_TYPE.ADMIN) {
            memberId = id;
            adminId = creatorId;
        } else {
            memberId = creatorId;
            adminId = id;
        }
        
        const where = { adminId, _id: projectId, isDeleted: commonConstants.FALSE };
        // Validate projectId
        const project = await baseModelObj.fetchSingleObj(
            where,
            ProjectSchema,
            'addTasks isActive'
        );
        if (!project) {
            return this.prepareResponse(StatusCodes.BAD_REQUEST, 'INVALID_PROJECT_ID');
        }
        if (!project.isActive) {
            return this.prepareResponse(StatusCodes.BAD_REQUEST, 'PROJECT_INACTIVE');
        }
        
        if (createdByType === commonConstants.USER_TYPE.MEMBER && !project.addTasks) {
            return this.prepareResponse(StatusCodes.BAD_REQUEST, 'MEMBER_NOT_ALLOWED_TO_ADD_LOG');
        }
        
        // Validate task
        const task = await baseModelObj.fetchSingleObj(
            { _id: taskId, projectId: projectId, isDeleted: commonConstants.FALSE },
            TaskSchema,
            'billableHours assignees timeLogs taskStatus creatorId'
        );
        
        if (!task) {
            return this.prepareResponse(StatusCodes.BAD_REQUEST, 'INVALID_TASK_ID');
        }

        if(task.taskStatus === commonConstants.TASK_STATUS.CLOSED){
            return this.prepareResponse(StatusCodes.BAD_REQUEST, 'UNABLE_ADD_TASK_CLOSED');
        }
        // Check if member is assigned to the task
        if (createdByType === commonConstants.USER_TYPE.MEMBER && (!task.assignees.map(String).includes(String(creatorId)) && String(creatorId) != task.creatorId)) {
            return this.prepareResponse(StatusCodes.BAD_REQUEST, 'INVALID_MEMBER_ID');
        }
        
        const actualHoursInMinutes = await this.timeStringToMinutes(actualHours);

        if (logId) {
            // Update by logId

            await TaskSchema.updateOne(
                { _id: taskId, 'timeLogs._id': logId },
                { $set: {
                    'timeLogs.$.actualHours': actualHoursInMinutes,
                    'timeLogs.$.billableHours': billableHours,
                    'timeLogs.$.note': note,
                    'timeLogs.$.date': date,
                    'timeLogs.$.loggedBy': createdByType,
                    'timeLogs.$.creatorId': memberId
                }}
            );
        } else {
            let totalBillableHours = 0;
            if (Array.isArray(task.timeLogs) && task.timeLogs.length > 0) {
                totalBillableHours = task.timeLogs.reduce(
                (sum, log) => sum + (log.billableHours || 0),
                0
            );
            } 
            if ((Number(billableHours) + totalBillableHours) > task.billableHours) {
                return this.prepareResponse(StatusCodes.BAD_REQUEST, 'BILLABLE_HOURS_EXCEEDS_TASK_LIMIT');
            } 
            
            // Insert new log
            const log = {
                date,
                actualHours: actualHoursInMinutes,
                billableHours,
                note,
                loggedBy: createdByType,
                creatorId: memberId
            };
            await TaskSchema.updateOne(
                { _id: taskId, projectId: projectId },
                { $push: { timeLogs: log }, taskStatus: commonConstants.TASK_STATUS.IN_PROGRESS }
            );
        }

        return null; // No error, validations has passed
    }

    // async fetchHeaderData(ProjectSchema, memberId, monthYear) {
    //     // const parsedDate = await dateTimeLibObj.validateMonthYear(monthYear, commonConstants.MONTH_YEAR_FORMAT);
    //     // if (!parsedDate.status) {
    //     //     return 'INVALID_MONTH_YEAR_FORMAT';
    //     // }

    //     // const { month, year, startOfMonth, endOfMonth } = parsedDate;
    //     // const objectAdminId = new mongoose.Types.ObjectId(String(adminId));

    //     const whereCondition = {
    //         // adminId: objectAdminId,
    //         teamMembers: new mongoose.Types.ObjectId(String(memberId)),
    //         isDeleted: commonConstants.STATUS.NOT_DELETED_BOOLEAN
    //         // $or: [
    //         //     {
    //         //         projectType: commonConstants.PROJECT_TYPE.SINGLE,
    //         //         startDate: { $lte: endOfMonth },
    //         //         deadlineDate: { $gte: startOfMonth }
    //         //     },
    //         //     {
    //         //         projectType: commonConstants.PROJECT_TYPE.REPEATING,
    //         //         repeatingMonths: {
    //         //             $elemMatch: {
    //         //                 year: year,
    //         //                 months: { $in: [month + 1] } // months are 1-indexed in your schema
    //         //             }
    //         //         }
    //         //     }
    //         // ]
    //     };

    //     // if (memberId) {
    //     //     whereCondition.teamMembers = new mongoose.Types.ObjectId(String(memberId));
    //     // }

    //     const result = await ProjectSchema.aggregate([
    //         {
    //             $match: whereCondition
    //         },
    //         {
    //             $lookup: {
    //                 from: tableConstants.MEMBERS,
    //                 localField: 'teamMembers',
    //                 foreignField: '_id',
    //                 as: 'members'
    //             }
    //         },
    //         {
    //             $lookup: {
    //                 from: tableConstants.TASKS,
    //                 localField: '_id',
    //                 foreignField: 'projectId',
    //                 as: 'tasks'
    //             }
    //         },
    //         {
    //             $addFields: {
    //                 tasks: {
    //                     $filter: {
    //                         input: '$tasks',
    //                         as: 'task',
    //                         cond: { $eq: ['$$task.isDeleted', commonConstants.STATUS.NOT_DELETED_BOOLEAN] }
    //                     }
    //                 }
    //             }
    //         },
    //         {
    //             $unwind: {
    //                 path: '$tasks',
    //                 preserveNullAndEmptyArrays: commonConstants.TRUE
    //             }
    //         },
    //         // {
    //         //     $addFields: {
    //         //         filteredLogs: {
    //         //             $filter: {
    //         //                 input: '$tasks.timeLogs',
    //         //                 as: 'log',
    //         //                 cond: {
    //         //                     $and: [
    //         //                         { $gte: ['$$log.date', startOfMonth] },
    //         //                         { $lte: ['$$log.date', endOfMonth] }
    //         //                     ]
    //         //                 }
    //         //             }
    //         //         }
    //         //     }
    //         // },
    //         {
    //             $group: {
    //                 _id: null,
    //                 totalTargetHours: { $sum: '$members.targetHours' },
    //                 // totalLoggedHours: { $sum: '$filteredLogs.actualHours' },
    //                 // totalMemberBillableHours: { $sum: '$filteredLogs.billableHours' },
    //                 totalLoggedHours: { $sum: '$tasks.actualHours' },
    //                 totalMemberBillableHours: { $sum: '$tasks.billableHours' },
    //                 projects: { $addToSet: '$_id' },
    //                 tasksCount: { $addToSet: '$tasks._id' },
    //                 totalTaskBillableHours: { $sum: '$tasks.billableHours' }
    //             }
    //         },
    //         {
    //             $project: {
    //                 _id: 0,
    //                 totalTargetHours: 1,
    //                 totalLoggedHours: 1,
    //                 totalMemberBillableHours: 1,
    //                 projectsCount: { $size: '$projects' },
    //                 tasksCount: { $size: '$tasksCount' },
    //                 totalTaskBillableHours: 1
    //             }
    //         }
    //     ]);

    //     const headerObj = result[0] || {
    //         totalTargetHours: 0,
    //         totalLoggedHours: 0,
    //         totalMemberBillableHours: 0,
    //         projectsCount: 0,
    //         tasksCount: 0,
    //         totalTaskBillableHours: 0
    //     };

    //     headerObj.underOver = Number(headerObj.totalTargetHours) - Number(headerObj.totalMemberBillableHours);
    //     headerObj.billableHoursPercentage = ((Number(headerObj.totalMemberBillableHours) / Number(headerObj.totalTargetHours)) * 100) || 0;
    //     headerObj.loggedHoursPercentage = ((Number(headerObj.totalLoggedHours) / Number(headerObj.totalMemberBillableHours)) * 100) || 0;
    //     return headerObj;
    // }

    // async fetchHeaderData(ProjectSchema, memberId, monthYear) {
    //     const whereCondition = {
    //         teamMembers: new mongoose.Types.ObjectId(String(memberId)),
    //         isDeleted: commonConstants.STATUS.NOT_DELETED_BOOLEAN
    //     };

    //     // Calculate start and end dates for the given monthYear
    //     // const startDate = new Date(monthYear);
    //     // const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    //     const result = await ProjectSchema.aggregate([
    //         // Step 1: Find all projects where the member is on the team.
    //         {
    //             $match: whereCondition
    //         },
    //         // Step 2: Lookup the member to get targetHours.
    //         {
    //             $lookup: {
    //                 from: tableConstants.MEMBERS,
    //                 localField: 'teamMembers',
    //                 foreignField: '_id',
    //                 as: 'members'
    //             }
    //         },
    //         // Step 3: Unwind the members array to get a separate document for each member.
    //         // This is crucial for correctly summing the target hours for each team member.
    //         {
    //             $unwind: '$members'
    //         },
    //         // Step 4: Add a stage to only keep the member specified in the query.
    //         // This ensures only the member's target hours are counted.
    //         {
    //             $match: {
    //                 'members._id': new mongoose.Types.ObjectId(String(memberId))
    //             }
    //         },
    //         // Step 5: Lookup tasks associated with the project.
    //         {
    //             $lookup: {
    //                 from: tableConstants.TASKS,
    //                 localField: '_id',
    //                 foreignField: 'projectId',
    //                 as: 'tasks'
    //             }
    //         },
    //         // Step 6: Filter out deleted tasks.
    //         {
    //             $addFields: {
    //                 tasks: {
    //                     $filter: {
    //                         input: '$tasks',
    //                         as: 'task',
    //                         cond: { $eq: ['$$task.isDeleted', commonConstants.STATUS.NOT_DELETED_BOOLEAN] }
    //                     }
    //                 }
    //             }
    //         },
    //         // Step 7: Unwind tasks to deal with each task individually.
    //         {
    //             $unwind: {
    //                 path: '$tasks',
    //                 preserveNullAndEmptyArrays: true
    //             }
    //         },
    //         // Step 8: Unwind the timeLogs array within each task.
    //         // This is essential for summing up hours from individual logs.
    //         {
    //             $unwind: {
    //                 path: '$tasks.timeLogs',
    //                 preserveNullAndEmptyArrays: true
    //             }
    //         },
    //         // Step 9: Add a match stage to filter by month/year and the specific member.
    //         // This ensures we only count hours logged by the member within the specified timeframe.
    //         {
    //             $match: {
    //                 $or: [
    //                     // If no tasks or timeLogs exist, still pass the document to group stage.
    //                     { 'tasks': null },
    //                     { 'tasks.timeLogs': null },
    //                     // Match by the member ID and date range.
    //                     {
    //                         'tasks.timeLogs.creatorId': new mongoose.Types.ObjectId(String(memberId))
    //                         // 'tasks.timeLogs.date': { $gte: startDate, $lte: endDate }
    //                     }
    //                 ]
    //             }
    //         },
    //         // Step 10: Group all results to calculate the final sums.
    //         {
    //             $group: {
    //                 _id: null,
    //                 totalTargetHours: { $sum: '$members.targetHours' },
    //                 totalLoggedHours: { $sum: '$tasks.timeLogs.actualHours' },
    //                 totalMemberBillableHours: { $sum: '$tasks.timeLogs.billableHours' },
    //                 projects: { $addToSet: '$_id' },
    //                 tasksCount: { $addToSet: '$tasks._id' },
    //                 // This is a duplicate of totalMemberBillableHours in your original query.
    //                 // It's better to calculate member billable hours and task billable hours separately.
    //                 // totalTaskBillableHours: { $sum: '$tasks.billableHours' } 
    //             }
    //         },
    //         // Step 11: Project the final result.
    //         {
    //             $project: {
    //                 _id: 0,
    //                 totalTargetHours: 1,
    //                 totalLoggedHours: 1,
    //                 totalMemberBillableHours: 1,
    //                 projectsCount: { $size: '$projects' },
    //                 tasksCount: { $size: '$tasksCount' },
    //                 // If you need total task billable hours (not just for the member), it would need a different logic.
    //                 // For now, let's keep the focus on the member.
    //                 totalTaskBillableHours: 1
    //             }
    //         }
    //     ]);

    //     // The rest of your code to process the result is fine.
    //     const headerObj = result[0] || {
    //         totalTargetHours: 0,
    //         totalLoggedHours: 0,
    //         totalMemberBillableHours: 0,
    //         projectsCount: 0,
    //         tasksCount: 0,
    //         totalTaskBillableHours: 0
    //     };

    //     headerObj.totalLoggedHours = await this.minutesToTimeString(headerObj.totalLoggedHours);
    //     headerObj.totalMemberBillableHours = await this.minutesToTimeString(headerObj.totalMemberBillableHours);
    //     headerObj.totalTaskBillableHours = await this.minutesToTimeString(headerObj.totalTaskBillableHours);

    //     headerObj.underOver = Number(headerObj.totalTargetHours) - Number(headerObj.totalMemberBillableHours);
    //     headerObj.billableHoursPercentage = ((Number(headerObj.totalMemberBillableHours) / Number(headerObj.totalTargetHours)) * 100) || 0;
    //     headerObj.loggedHoursPercentage = ((Number(headerObj.totalLoggedHours) / Number(headerObj.totalMemberBillableHours)) * 100) || 0;
    //     return headerObj;
    // }

    async fetchHeaderData(ProjectSchema, memberId, monthYear, taskStatus) {
        const parsedDate = await dateTimeLibObj.validateMonthYear(monthYear, commonConstants.MONTH_YEAR_FORMAT);
        if (!parsedDate.status) {
            return 'INVALID_MONTH_YEAR_FORMAT';
        }

        const { startOfMonth, endOfMonth } = parsedDate;
        const objectMemberId = new mongoose.Types.ObjectId(String(memberId));
        
        const whereCondition = {
            teamMembers: objectMemberId,
            isDeleted: commonConstants.STATUS.NOT_DELETED_BOOLEAN
        };

        const result = await ProjectSchema.aggregate([
            // Step 1: Match projects containing the member
            { $match: whereCondition },

            // Step 2: Lookup members
            {
                $lookup: {
                    from: tableConstants.MEMBERS,
                    localField: 'teamMembers',
                    foreignField: '_id',
                    as: 'members'
                }
            },

            // Step 3: Unwind members
            { $unwind: '$members' },

            // Step 4: Keep only the requested member
            {
                $match: {
                    'members._id': new mongoose.Types.ObjectId(String(memberId))
                }
            },

            // Step 5: Lookup tasks
            {
               $lookup: {
                 from: tableConstants.TASKS,
                 let: { projectId: '$_id' },
                 pipeline: [
                   {
                     $match: {
                       $expr: { $eq: ['$projectId', '$$projectId'] }, 
                       isDeleted: false,                              
                       ...(taskStatus ? { taskStatus } : {})          
                     }
                   }
                 ],
                 as: 'tasks'
               }
            },

            // Step 6: Filter deleted tasks
            {
                $addFields: {
                    tasks: {
                        $filter: {
                            input: '$tasks',
                            as: 'task',
                            cond: {
                                      $and: [
                                          { $eq: ['$$task.isDeleted', commonConstants.STATUS.NOT_DELETED_BOOLEAN] },
                                          { $in: [objectMemberId, '$$task.assignees'] }
                                      ]
                                  }
                        }
                    }
                }
            },

            // Step 7: Unwind tasks
            {
                $unwind: {
                    path: '$tasks',
                    preserveNullAndEmptyArrays: true
                }
            },

            // Filter timeLogs by provided month-year (startOfMonth and endOfMonth)
            {
                $addFields: {
                    'tasks.timeLogs': {
                        $filter: {
                            input: { $ifNull: ['$tasks.timeLogs', []] },
                            as: 'log',
                            cond: {
                                $and: [
                                    // { $eq: ['$$log.creatorId', objectMemberId] },
                                    { $gte: ['$$log.date', new Date(startOfMonth)] },
                                    { $lte: ['$$log.date', new Date(endOfMonth)] }
                                ]
                            }
                        }
                    }
                }
            },

            // Step 8: Unwind timeLogs
            {
                $unwind: {
                    path: '$tasks.timeLogs',
                    preserveNullAndEmptyArrays: true
                }
            },

            // Step 9: Match only logs by this member
            // {
            //     $match: {
            //         $or: [
            //             { 'tasks': null },
            //             { 'tasks.timeLogs': null },
            //             { 'tasks.timeLogs.creatorId': new mongoose.Types.ObjectId(String(memberId)) }
            //         ]
            //     }
            // },

            // ✅ Step 10: Group final result
            {
                $group: {
                    _id: null,
                    totalTargetHours: { $first: '$members.targetHours' }, // ✅ FIXED HERE
                    totalLoggedHours: { $sum: '$tasks.timeLogs.actualHours' },
                    totalMemberBillableHours: { $sum: '$tasks.timeLogs.billableHours' },
                    projects: { $addToSet: '$_id' },
                    tasksCount: { $addToSet: '$tasks._id' },
                    totalTaskBillableHours: { $sum: '$tasks.billableHours' }
                }
            },

            // Step 11: Final projection
            {
                $project: {
                    _id: 0,
                    totalTargetHours: 1,
                    totalLoggedHours: 1,
                    totalMemberBillableHours: 1,
                    projectsCount: { $size: '$projects' },
                    tasksCount: { $size: '$tasksCount' },
                    totalTaskBillableHours: 1
                }
            }
        ]);

        const headerObj = result[0] || {
            totalTargetHours: 0,
            totalLoggedHours: 0,
            totalMemberBillableHours: 0,
            projectsCount: 0,
            tasksCount: 0,
            totalTaskBillableHours: 0
        };

        headerObj.underOver = await this.calculateUnderOverTime(headerObj.totalTargetHours, headerObj.totalMemberBillableHours);
        // Derived metrics
        headerObj.billableHoursPercentage = await this.calculateBillableHoursPercentage(headerObj.totalMemberBillableHours, headerObj.totalTargetHours);
        headerObj.loggedHoursPercentage = await this.calculateLoggedHoursPercentage(headerObj.totalLoggedHours, headerObj.totalMemberBillableHours);
        headerObj.totalLoggedHours = await this.minutesToTimeString(headerObj.totalLoggedHours);
        headerObj.totalMemberBillableHours = await this.minutesToTimeString(headerObj.totalMemberBillableHours);
        headerObj.totalTaskBillableHours = await this.minutesToTimeString(headerObj.totalTaskBillableHours);
        headerObj.totalTargetHours = await this.minutesToTimeString(headerObj.totalTargetHours*60);
        return headerObj;
    }


    async fetchMemberTimeSheetData(ProjectSchema, memberSchema, memberId, monthYear, page = 1, taskStatus) {
        const parsedDate = await dateTimeLibObj.validateMonthYear(monthYear, commonConstants.MONTH_YEAR_FORMAT);
        if (!parsedDate.status) {
            return 'INVALID_MONTH_YEAR_FORMAT';
        }

        const { startOfMonth, endOfMonth } = parsedDate;
        
        const PAGE_LIMIT = commonConstants.LIST_LIMIT;
        const skip = (Number(page) - 1) * PAGE_LIMIT;
        // const objectAdminId = new mongoose.Types.ObjectId(String(adminId));
        const objectMemberId = new mongoose.Types.ObjectId(String(memberId));

        const where = {
            _id: objectMemberId,
            // adminId: objectAdminId,
            isDeleted: commonConstants.STATUS.NOT_DELETED_BOOLEAN
        };
        const member = await baseModelObj.fetchSingleObj(where, memberSchema, "firstName surname");
        if (!member) {
            return 'INVALID_MEMBER_ID';
        }

        const projects = await ProjectSchema.aggregate([
            {
                $match: {
                    // adminId: objectAdminId,
                    teamMembers: objectMemberId,
                    isDeleted: commonConstants.STATUS.NOT_DELETED_BOOLEAN
                }
            },
            {
                $lookup: {
                    from: tableConstants.CLIENTS,
                    localField: 'clientId',
                    foreignField: '_id',
                    as: 'client'
                }
            },
            { $unwind: '$client' },

            // ✅ Sort by clientName and projectTitle before grouping
            { $sort: { 'client.name': 1, projectTitle: 1 } },

            {
               $lookup: {
                 from: tableConstants.TASKS,
                 let: { projectId: '$_id' },
                 pipeline: [
                   {
                     $match: {
                       $expr: { $eq: ['$projectId', '$$projectId'] }, 
                       isDeleted: false,                              
                       ...(taskStatus ? { taskStatus } : {})          
                     }
                   }
                 ],
                 as: 'tasks'
               }
            },
            {
                $addFields: {
                    tasks: {
                        $filter: {
                            input: '$tasks',
                            as: 'task',
                            cond: {
                                      $and: [
                                          { $eq: ['$$task.isDeleted', commonConstants.STATUS.NOT_DELETED_BOOLEAN] },
                                          { $in: [objectMemberId, '$$task.assignees'] }
                                      ]
                                  }
                        }
                    }
                }
            },

            // ✅ Calculate taskLogged/taskBillable before unwind
            // {
            //     $addFields: {
            //         tasks: {
            //             $map: {
            //                 input: '$tasks',
            //                 as: 'task',
            //                 in: {
            //                     _id: '$$task._id',
            //                     description: '$$task.description',
            //                     estimate: '$$task.estimate',
            //                     invoice: '$$task.invoice',
            //                     taskStatus: '$$task.taskStatus',
            //                     taskNumber: '$$task.taskNumber',
            //                     timeLogs: {
            //                         $map: {
            //                             input: '$$task.timeLogs',
            //                             as: 'log',
            //                             in: {
            //                                 $mergeObjects: [
            //                                     '$$log',
            //                                     {
            //                                         variance: {
            //                                             $subtract: ['$$log.billableHours', '$$log.actualHours']
            //                                         }
            //                                     }
            //                                 ]
            //                             }
            //                         }
            //                     },
            //                     taskLogged: { $sum: '$$task.timeLogs.actualHours' },
            //                     taskBillable: { $sum: '$$task.timeLogs.billableHours' },
            //                     variance: {
            //                         $subtract: [
            //                             { $sum: '$$task.timeLogs.billableHours' },
            //                             { $sum: '$$task.timeLogs.actualHours' }
            //                         ]
            //                     }
            //                 }
            //             }
            //         }
            //     }
            // },

            // 🔹 Lookup creators for all timeLogs
            {
                $lookup: {
                    from: tableConstants.MEMBERS,
                    localField: 'tasks.timeLogs.creatorId',
                    foreignField: '_id',
                    as: 'logCreators'
                }
            },
            {
              $lookup: {
                from: tableConstants.MEMBERS,
                localField: 'tasks.creatorId',
                foreignField: '_id',
                as: 'taskCreators'
              }
            },
            // 🔹 Map tasks with enriched timeLogs
            {
                $addFields: {
                    tasks: {
                        $map: {
                            input: '$tasks',
                            as: 'task',
                            in: {
                                _id: '$$task._id',
                                description: '$$task.description',
                                estimate: '$$task.estimate',
                                invoice: '$$task.invoice',
                                taskStatus: '$$task.taskStatus',
                                taskNumber: '$$task.taskNumber',
                                creatorId: '$$task.creatorId',
                                assignees: '$$task.assignees',
                                approvalTypeId: '$$task.approvalTypeId',
                                timeSheetInitials: {
                                    $let: {
                                        vars: {
                                            creator: {
                                                $arrayElemAt: [
                                                    {
                                                        $filter: {
                                                            input: '$taskCreators',
                                                            as: 'c',
                                                            cond: { $eq: ['$$c._id', '$$task.creatorId'] }
                                                        }
                                                    },
                                                    0
                                                ]
                                            }
                                        },
                                        in: {
                                            $ifNull: ['$$creator.timeSheetInitials', "ID"] // 🔹 fallback to static "ID"
                                        }
                                    }
                                },
                                timeLogs: {
                                    $map: {
                                        input: {
                                        $filter: {
                                            input: '$$task.timeLogs',
                                            as: 'log',
                                            cond: {
                                                $and: [
                                                    // { $eq: ['$$log.creatorId', objectMemberId] },
                                                    { $gte: ['$$log.date', new Date(startOfMonth)] },
                                                    { $lte: ['$$log.date', new Date(endOfMonth)] }
                                                ]
                                            }
                                        }
                                    },
                                        as: 'log',
                                        in: {
                                            $mergeObjects: [
                                                '$$log',
                                                {
                                                    variance: {
                                                        $subtract: ['$$log.billableHours', '$$log.actualHours']
                                                    },
                                                    timeSheetInitials: {
                                                        $let: {
                                                            vars: {
                                                                creator: {
                                                                    $arrayElemAt: [
                                                                        {
                                                                            $filter: {
                                                                                input: '$logCreators',
                                                                                as: 'c',
                                                                                cond: { $eq: ['$$c._id', '$$log.creatorId'] }
                                                                            }
                                                                        },
                                                                        0
                                                                    ]
                                                                }
                                                            },
                                                            in: '$$creator.timeSheetInitials'
                                                        }
                                                    },
                                                    isMemberDeleted: {
                                                        $let: {
                                                            vars: {
                                                            creator: {
                                                                $arrayElemAt: [
                                                                {
                                                                    $filter: {
                                                                    input: "$logCreators",
                                                                    as: "c",
                                                                    cond: { $eq: ["$$c._id", "$$log.creatorId"] }
                                                                    }
                                                                },
                                                                0
                                                                ]
                                                            }
                                                            },
                                                            in: "$$creator.isDeleted"
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                },
                                taskLogged: { $sum: '$$task.timeLogs.actualHours' },
                                taskBillable: '$$task.billableHours',
                                variance: {
                                    $subtract: [
                                        { $sum: '$$task.billableHours' },
                                        { $sum: '$$task.timeLogs.actualHours' }
                                    ]
                                }
                            }
                        }
                    }
                }
            },

            // {
            //     $addFields: {
            //         tasks: {
            //         $map: {
            //             input: '$tasks',
            //             as: 'task',
            //             in: {
            //             _id: '$$task._id',
            //             description: '$$task.description',
            //             estimate: '$$task.estimate',
            //             invoice: '$$task.invoice',
            //             taskStatus: '$$task.taskStatus',
            //             taskNumber: '$$task.taskNumber',
            //             timeLogs: {
            //                 $map: {
            //                     input: '$$task.timeLogs',
            //                     as: 'log',
            //                     in: {
            //                         $mergeObjects: [
            //                         '$$log',
            //                         {
            //                             variance: {
            //                                 $subtract: ['$$log.billableHours', '$$log.actualHours']
            //                             },
            //                             // 👇 Add new field from members
            //                             timeSheetInitials: {
            //                                 $let: {
            //                                     vars: {
            //                                     member: {
            //                                         $arrayElemAt: [
            //                                         {
            //                                             $filter: {
            //                                             input: "$members",
            //                                             as: "m",
            //                                             cond: { $eq: ["$$m._id", "$$log.creatorId"] }
            //                                             }
            //                                         },
            //                                         0
            //                                         ]
            //                                     }
            //                                     },
            //                                     in: "$$member.timeSheetInitials"
            //                                 }
            //                             }
            //                         }
            //                         ]
            //                     }
            //                 }
            //             },
            //             taskLogged: { $sum: '$$task.timeLogs.actualHours' },
            //             taskBillable: { $sum: '$$task.timeLogs.billableHours' },
            //             variance: {
            //                 $subtract: [
            //                 { $sum: '$$task.timeLogs.billableHours' },
            //                 { $sum: '$$task.timeLogs.actualHours' }
            //                 ]
            //             }
            //             }
            //         }
            //         }
            //     }
            // },

            {
                $unwind: {
                    path: '$tasks',
                    preserveNullAndEmptyArrays: commonConstants.TRUE
                }
            },
            // { $addFields: {
            //     filteredLogs: '$tasks.timeLogs'
            // }},
            // { $addFields: {
            //     taskLogged: { $sum: '$filteredLogs.actualHours' },
            //     taskBillable: { $sum: '$filteredLogs.billableHours' }
            // }},

            {
                $lookup: {
                    from: tableConstants.MEMBERS,
                    let: { teamMembers: '$teamMembers' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: ['$_id', '$$teamMembers'] },
                                        { $eq: ['$isDeleted', false] }
                                    ]
                                }
                            }
                        },
                        { $project: { _id: 1, firstName: 1, surname: 1 } }
                    ],
                    as: 'teamMembersInfo'
                }
            },

            // { $lookup: {
            //     from: tableConstants.MEMBERS,
            //     let: { teamMembers: '$teamMembers' },
            //     pipeline: [
            //         { $match: { $expr: { $and: [
            //             { $in: ['$_id', '$$teamMembers'] },
            //             { $eq: ['$isDeleted', false] }
            //         ] } } },
            //         { $project: { _id: 1, firstName: 1, surname: 1 } }
            //     ],
            //     as: 'teamMembersInfo'
            // }},

            // { $project: {
            //     projectId: '$_id',
            //     projectTitle: '$projectTitle',
            //     projectNumber: '$projectNumber',
            //     projectStatus: '$projectStatus',
            //     teamMembers: {
            //         $map: {
            //             input: '$teamMembersInfo',
            //             as: 'member',
            //             in: {
            //                 memberId: '$$member._id',
            //                 name: { $concat: ['$$member.firstName', ' ', '$$member.surname'] }
            //             }
            //         }
            //     },
            //     approvalTypeId: '$approvalTypeId',
            //     estimate: '$estimate',
            //     invoice: '$invoice',
            //     taskStatus: '$tasks.taskStatus',
            //     description: '$tasks.description',
            //     taskEstimate: '$tasks.estimate',
            //     taskInvoice: '$tasks.invoice',
            //     taskLogged: 1,
            //     taskBillable: 1,
            //     taskNumber: '$tasks.taskNumber',
            //     variance: { $subtract: ['$taskBillable', '$taskLogged'] },
            //     taskId: '$tasks._id',
            //     timeLogs: '$filteredLogs',
            //     clientName: '$client.name'
            // }},
            // { $group: {
            //     _id: {
            //         clientName: '$clientName',
            //         projectId: '$projectId',
            //         projectTitle: '$projectTitle',
            //         estimate: '$estimate',
            //         invoice: '$invoice',
            //         approvalTypeId: '$approvalTypeId',
            //         projectNumber: '$projectNumber',
            //         projectStatus: '$projectStatus',
            //         teamMembers: '$teamMembers'
            //     },
            //     tasks: {
            //         $push: {
            //             taskId: '$taskId',
            //             description: '$description',
            //             estimate: '$taskEstimate',
            //             invoice: '$taskInvoice',
            //             taskStatus: '$taskStatus',
            //             taskLogged: '$taskLogged',
            //             taskBillable: '$taskBillable',
            //             timeLogs: '$timeLogs',
            //             variance: '$variance',
            //             taskNumber: '$taskNumber'
            //         }
            //     }
            // }},
            // { $group: {
            //     _id: '$_id.clientName',
            //     projects: {
            //         $push: {
            //             projectId: '$_id.projectId',
            //             projectTitle: '$_id.projectTitle',
            //             estimate: '$_id.estimate',
            //             invoice: '$_id.invoice',
            //             approvalTypeId: '$_id.approvalTypeId',
            //             projectNumber: '$_id.projectNumber',
            //             projectStatus: '$_id.projectStatus',
            //             teamMembers: '$_id.teamMembers',
            //             tasks: '$tasks'
            //         }
            //     }
            // }},
            // { $project: {
            //     clientName: '$_id',
            //     projects: 1,
            //     _id: 0
            // }},
            // { $skip: skip },
            // { $limit: PAGE_LIMIT }
            {
              $lookup: {
                from: tableConstants.SETTINGS, 
                let: { adminId: "$adminId", approvalTypeId: "$approvalTypeId" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$adminId", "$$adminId"] } } },
                  { $unwind: "$approvalTypes" },
                  { $addFields: { "approvalTypes._idStr": { $toString: "$approvalTypes._id" } } }, 
                  { $match: { $expr: { $eq: ["$approvalTypes._idStr", { $toString: "$$approvalTypeId" }] } } }, 
                  { $project: { _id: 0, approvalTypeName: "$approvalTypes.value" } }
                ],
                as: "approvalType"
              }
            },
            { $unwind: { path: "$approvalType", preserveNullAndEmptyArrays: true } },

            {
              $lookup: {
                from: tableConstants.SETTINGS,
                let: { adminId: "$adminId", taskApprovalTypeId: "$tasks.approvalTypeId" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$adminId", "$$adminId"] } } },   // settings for same admin
                  { $unwind: "$approvalTypes" },                                // break into individual approvalTypes
                  { $addFields: { "approvalTypes._idStr": { $toString: "$approvalTypes._id" } } }, // normalize type
                  { $match: { $expr: { $eq: ["$approvalTypes._idStr", { $toString: "$$taskApprovalTypeId" }] } } },
                  { $project: { _id: 0, taskApprovalTypeName: "$approvalTypes.value" } }
                ],
                as: "taskApprovalType"
              }
            },
            { $unwind: { path: "$taskApprovalType", preserveNullAndEmptyArrays: true } },

            {
                $project: {
                    projectId: '$_id',
                    projectTitle: '$projectTitle',
                    projectNumber: '$projectNumber',
                    projectStatus: '$projectStatus',
                    teamMembers: {
                        $map: {
                            input: '$teamMembersInfo',
                            as: 'member',
                            in: {
                                memberId: '$$member._id',
                                name: { $concat: ['$$member.firstName', ' ', '$$member.surname'] }
                            }
                        }
                    },
                    approvalTypeId: '$approvalTypeId',
                    approvalTypeName: '$approvalType.approvalTypeName',
                    estimate: '$estimate',
                    invoice: '$invoice',
                    taskStatus: '$tasks.taskStatus',
                    description: '$tasks.description',
                    taskEstimate: '$tasks.estimate',
                    taskInvoice: '$tasks.invoice',
                    taskLogged: '$tasks.taskLogged',
                    taskBillable: '$tasks.taskBillable',
                    taskNumber: '$tasks.taskNumber',
                    variance: '$tasks.variance',
                    taskId: '$tasks._id',
                    assignees: '$tasks.assignees',
                    timeLogs: '$tasks.timeLogs',
                    timeSheetInitials: '$tasks.timeSheetInitials',
                    taskCreatorId: '$tasks.creatorId',
                    taskApprovalTypeId: '$tasks.approvalTypeId',
                    taskApprovalTypeName: '$taskApprovalType.taskApprovalTypeName',
                    clientName: '$client.name',
                    isActive: '$isActive',
                    addTasks: '$addTasks'
                }
            },
            {
                $group: {
                    _id: {
                        clientName: '$clientName',
                        projectId: '$projectId',
                        projectTitle: '$projectTitle',
                        estimate: '$estimate',
                        invoice: '$invoice',
                        approvalTypeId: '$approvalTypeId',
                        approvalTypeName: '$approvalTypeName',
                        projectNumber: '$projectNumber',
                        projectStatus: '$projectStatus',
                        teamMembers: '$teamMembers',
                        isActive: '$isActive',
                        addTasks: '$addTasks',
                    },
                    tasks: {
                        $push: {
                            taskId: '$taskId',
                            description: '$description',
                            estimate: '$taskEstimate',
                            invoice: '$taskInvoice',
                            taskStatus: '$taskStatus',
                            taskLogged: '$taskLogged',
                            taskBillable: '$taskBillable',
                            timeLogs: '$timeLogs',
                            timeSheetInitials: '$timeSheetInitials',
                            variance: '$variance',
                            taskNumber: '$taskNumber',
                            taskApprovalTypeId: '$taskApprovalTypeId',
                            taskApprovalTypeName: '$taskApprovalTypeName',
                            taskCreatorId: '$taskCreatorId',
                            assignees: '$assignees'
                        }
                    }
                }
            },

            {
                $group: {
                    _id: '$_id.clientName',
                    projects: {
                        $push: {
                            projectId: '$_id.projectId',
                            projectTitle: '$_id.projectTitle',
                            estimate: '$_id.estimate',
                            invoice: '$_id.invoice',
                            approvalTypeId: '$_id.approvalTypeId',
                            approvalTypeName: '$_id.approvalTypeName',
                            projectNumber: '$_id.projectNumber',
                            projectStatus: '$_id.projectStatus',
                            isActive: '$_id.isActive',
                            addTasks: '$_id.addTasks',
                            teamMembers: '$_id.teamMembers',
                            tasks: '$tasks'
                        }
                    }
                }
            },

            // 🔹 NEW stage to sort projects inside each client
            {
                $addFields: {
                    projects: {
                        $sortArray: { input: "$projects", sortBy: { projectTitle: 1 } }
                    }
                }
            },

            { $project: { clientName: '$_id', projects: 1, _id: 0 } },

            // ✅ Ensure final client list is ordered too
            { $sort: { clientName: 1 } },

            { $skip: skip },
            { $limit: PAGE_LIMIT }
        ]);

        return {
            firstName: member.firstName,
            surname: member.surname,
            projectsList: projects
        };
    }

    async projectTimesheetData(projectSchema, projectId, taskStatus, isClient = false, memberId = "", monthYear = "" ) {     
        let parsedDate;
        let startOfMonth 
        let endOfMonth
        if (monthYear) {
              parsedDate = await dateTimeLibObj.validateMonthYear(monthYear, commonConstants.MONTH_YEAR_FORMAT);
         if (!parsedDate.status) {
             return 'INVALID_MONTH_YEAR_FORMAT';
         }

        startOfMonth = parsedDate.startOfMonth;     
        endOfMonth  = parsedDate.endOfMonth; 
        }
            
        const objectProjectId = new mongoose.Types.ObjectId(String(projectId));

        const where = {
            _id: objectProjectId,
            isDeleted: false
        };
        // Build the match stage dynamically for tasks
        const taskMatchStage = {
          $expr: {
            $and: [
              { $eq: ['$projectId', '$$projectId'] },
              { $eq: ['$isDeleted', false] }
            ]
          }
        };
        
        // Add memberId filter if provided
        // if (memberId) {
        //   taskMatchStage.$expr.$and.push({
        //     $in: [new mongoose.Types.ObjectId(String(memberId)), '$assignees']
        //   });
        // }
        
        // Add taskStatus filter if provided
        // if (taskStatus) {
        //   taskMatchStage.taskStatus = taskStatus;
        // }
        if (taskStatus) {
            // If invoiced, treat as closed
            taskMatchStage.taskStatus = taskStatus == "invoiced"
                ? "closed"
                : taskStatus;
        }

        const pipeline = [
            { $match: where },

            // Lookup client details
            {
                $lookup: {
                    from: 'clients',
                    localField: 'clientId',
                    foreignField: '_id',
                    as: 'client'
                }
            },
            { $unwind: '$client' },

            // Lookup tasks of this project
            {
               $lookup: {
                 from: tableConstants.TASKS,
                 let: { projectId: '$_id' },
                 pipeline: [
                   { $match: taskMatchStage }
                 ],
                 as: 'tasks'
               }
            },
            // Remove deleted tasks
            {
                $addFields: {
                    tasks: {
                        $filter: {
                            input: "$tasks",
                            as: "task",
                            cond: { $eq: ["$$task.isDeleted", false] }
                        }
                    }
                }
            },
            // Unwind tasks to work with timeLogs
            { $unwind: { path: '$tasks', preserveNullAndEmptyArrays: true } },
            // 🔹 Add here → filter logs by monthYear
            ...(monthYear
              ? [{
                  $addFields: {
                    'tasks.timeLogs': {
                      $filter: {
                        input: { $ifNull: ['$tasks.timeLogs', []] },
                        as: 'log',
                        cond: {
                          $and: [
                            { $gte: ['$$log.date', new Date(startOfMonth)] },
                            { $lte: ['$$log.date', new Date(endOfMonth)] }
                          ]
                        }
                      }
                    }
                  }
                }]
              : []),

            // 🔹 Lookup approvalType from settings
            {
                $lookup: {
                    from: 'settings',
                    let: { approvalTypeId: '$tasks.approvalTypeId' },
                    pipeline: [
                        { $unwind: '$approvalTypes' },
                        {
                            $match: {
                                $expr: { $eq: ['$approvalTypes._id', '$$approvalTypeId'] }
                            }
                        },
                        { $project: { _id: 0, approvalType: '$approvalTypes.value' } }
                    ],
                    as: 'approvalTypeInfo'
                }
            },
            {
                $addFields: {
                    'tasks.taskApprovalTypeName': {
                        $arrayElemAt: ['$approvalTypeInfo.approvalType', 0]
                    }
                }
            },
            // 🔹 Lookup project-level approvalType from settings
            {
              $lookup: {
                from: 'settings',
                let: { approvalTypeId: '$approvalTypeId' },
                pipeline: [
                  { $unwind: '$approvalTypes' },
                  {
                    $match: {
                      $expr: { $eq: ['$approvalTypes._id', '$$approvalTypeId'] }
                    }
                  },
                  { $project: { _id: 0, projectApprovalType: '$approvalTypes.value' } }
                ],
                as: 'projectApprovalTypeInfo'
              }
            },
            {
              $addFields: {
                projectApprovalType: {
                  $arrayElemAt: ['$projectApprovalTypeInfo.projectApprovalType', 0]
                }
              }
            },           

            // Lookup members for each timeLog (creatorId)
            { $unwind: { path: '$tasks.timeLogs', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'members',
                    localField: 'tasks.timeLogs.creatorId',
                    foreignField: '_id',
                    as: 'timeLogMember'
                }
            },
            { $unwind: { path: '$timeLogMember', preserveNullAndEmptyArrays: true } },

            // Add member initials to timeLog
            {
                $addFields: {
                    'tasks.timeLogs.timeSheetInitials': '$timeLogMember.timeSheetInitials',
                    'tasks.timeLogs.isMemberDeleted': '$timeLogMember.isDeleted'
                }
            },

            {
              $lookup: {
                from: 'members',
                localField: 'tasks.creatorId',
                foreignField: '_id',
                as: 'taskCreator'
              }
            },
            {
              $unwind: {
                path: '$taskCreator',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $addFields: {
                'tasks.timeSheetInitials': { $ifNull: ['$taskCreator.timeSheetInitials', 'ID'] }
              }
            },

            // 🔹 Lookup team members (array of ObjectIds → members collection)
            {
                $lookup: {
                    from: 'members',
                    localField: 'teamMembers',
                    foreignField: '_id',
                    as: 'teamMembersInfo'
                }
            },
            {
                $addFields: {
                    teamMembers: {
                        $map: {
                            input: '$teamMembersInfo',
                            as: 'm',
                            in: { 
                                memberId: '$$m._id',
                                name: { $concat: ['$$m.firstName', ' ', '$$m.surname'] },
                                timeSheetInitials: '$$m.timeSheetInitials',
                                isDeleted: '$$m.isDeleted'
                            }
                        }
                    }
                }
            },

            // Group back timeLogs per task
            {
                $group: {
                    _id: '$tasks._id',
                    rootDoc: { $first: '$$ROOT' },
                    description: { $first: '$tasks.description' },
                    estimate: { $first: '$tasks.estimate' },
                    invoice: { $first: '$tasks.invoice' },
                    assignees: { $first: '$tasks.assignees' },
                    taskStatus: { $first: '$tasks.taskStatus' },
                    taskApprovalTypeName: { $first: '$tasks.taskApprovalTypeName' },
                    timeSheetInitials: { $first: '$tasks.timeSheetInitials' },
                    timeLogs: {
                        $push: {
                          $cond: [
                            { $ifNull: ["$tasks.timeLogs._id", false] },
                            {
                            _id: '$tasks.timeLogs._id',
                            date: '$tasks.timeLogs.date',
                            actualHours: '$tasks.timeLogs.actualHours',
                            billableHours: '$tasks.timeLogs.billableHours',
                            variance: { $subtract: ['$tasks.timeLogs.billableHours', '$tasks.timeLogs.actualHours'] },
                            note: '$tasks.timeLogs.note',
                            loggedBy: '$tasks.timeLogs.loggedBy',
                            creatorId: '$tasks.timeLogs.creatorId',
                            timeSheetInitials: '$tasks.timeLogs.timeSheetInitials',
                            isMemberDeleted: '$tasks.timeLogs.isMemberDeleted'
                            },
                            "$$REMOVE"
                          ]
                        }
                    },
                    taskLogged: { $sum: '$tasks.timeLogs.actualHours' },
                    totalLogBillable: { $sum: '$tasks.timeLogs.billableHours' },
                    taskBillable: { $first: '$tasks.billableHours' }
                }
            },

            // Add variance
            {
                $addFields: {
                    variance: { $subtract: ['$taskBillable', '$taskLogged'] }
                }
            },

            // Group back tasks under project
            {
                $group: {
                    _id: '$rootDoc._id',
                    client: { $first: '$rootDoc.client' },
                    projectType: { $first: '$rootDoc.projectType' },
                    baseProjectId: { $first: '$rootDoc.baseProjectId' },
                    projectTitle: { $first: '$rootDoc.projectTitle' },
                    estimate: { $first: '$rootDoc.estimate' },
                    invoice: { $first: '$rootDoc.invoice' },
                    projectNumber: { $first: '$rootDoc.projectNumber' },
                    projectStatus: { $first: '$rootDoc.projectStatus' },
                    isActive: { $first: '$rootDoc.isActive' },
                    brief: { $first: '$rootDoc.brief' },
                    startDate: { $first: '$rootDoc.startDate' },
                    deadlineDate: { $first: '$rootDoc.deadlineDate' },
                    defaultHourlyRate: { $first: '$rootDoc.defaultHourlyRate' },
                    purchaseOrderNumber: { $first: '$rootDoc.purchaseOrderNumber' },
                    addTasks: { $first: '$rootDoc.addTasks' },
                    teamMembers: { $first: '$rootDoc.teamMembers' },
                    projectApprovalType: { $first: '$rootDoc.projectApprovalType' },
                    repeatingMonths: { $first: '$rootDoc.repeatingMonths' },
                    clientView: { $first: '$rootDoc.clientView' },
                    tasks: {
                      $push: {
                        $cond: [
                          { $ne: ['$_id', null] }, // only push if taskId is not null
                          {
                            $let: {
                              vars: {
                                base: {
                                 taskId: '$_id',
                                 description: '$description',
                                 estimate: '$estimate',
                                 invoice: '$invoice',
                                 taskStatus: '$taskStatus',
                                 assignees: '$assignees',
                                 taskApprovalTypeName: '$taskApprovalTypeName',
                                 timeSheetInitials: '$timeSheetInitials',
                                 taskLogged: '$taskLogged',
                                 taskBillable: '$taskBillable',
                                 totalLogBillable: '$totalLogBillable',
                                 variance: '$variance'
                                },
                                maybeTimeLogs: isClient
                                  ? { // if isClient true, check clientView
                                      $cond: [
                                        { $eq: ['$rootDoc.clientView', true] },
                                        { timeLogs: '$timeLogs' },
                                        {}
                                      ]
                                    }
                                  : { timeLogs: '$timeLogs' } // if isClient false → always include
                              },
                              in: { $mergeObjects: ['$$base', '$$maybeTimeLogs'] }
                            }
                          },
                          "$$REMOVE"
                        ]
                      }
                    }
                }
            },
            {
              $set: {
                tasks: {
                  $sortArray: { input: "$tasks", sortBy: { taskId: 1 } } 
                }
              }
            },

            // Final projection
            {
                $project: {
                    _id: 0,
                    clientId: '$client._id',
                    clientName: '$client.name',
                    clientLinkCode: '$client.clientLinkCode',
                    projectId: '$_id',
                    projectType: 1,
                    baseProjectId: 1,
                    projectTitle: 1,
                    estimate: 1,
                    invoice: 1,
                    projectNumber: 1,
                    projectStatus: 1,
                    isActive: 1,
                    brief: 1,
                    startDate: 1,
                    deadlineDate: 1,
                    defaultHourlyRate: 1,
                    purchaseOrderNumber: 1,
                    addTasks: 1,
                    teamMembers:1,
                    projectApprovalType:1,
                    repeatingMonths: 1,
                    clientView: 1,
                    tasks: 1
                }
            }
        ];

        const result = await projectSchema.aggregate(pipeline);        
        return this.convertProjectHoursToTimeString(result[0]);
    }

    async projectHeaderData(projectSchema, projectId, taskStatus, memberId = "", monthYear = "") {
        let parsedDate;
        let startOfMonth 
        let endOfMonth
        if (monthYear) {
              parsedDate = await dateTimeLibObj.validateMonthYear(monthYear, commonConstants.MONTH_YEAR_FORMAT);
         if (!parsedDate.status) {
             return 'INVALID_MONTH_YEAR_FORMAT';
         }

        startOfMonth = parsedDate.startOfMonth;     
        endOfMonth  = parsedDate.endOfMonth; 
        }
        const objectProjectId = new mongoose.Types.ObjectId(String(projectId));

        const whereCondition = {
            _id: objectProjectId,
            isDeleted: false
        };
        // Build the match stage dynamically for tasks
        const taskMatchStage = {
          $expr: {
            $and: [
              { $eq: ['$projectId', '$$projectId'] },
              { $eq: ['$isDeleted', false] }
            ]
          }
        };
        
        // Add memberId filter if provided
        // if (memberId) {
        //   taskMatchStage.$expr.$and.push({
        //     $in: [new mongoose.Types.ObjectId(String(memberId)), '$assignees']
        //   });
        // }
        
        // Add taskStatus filter if provided
        if (taskStatus) {
          taskMatchStage.taskStatus = taskStatus;
        }         

        const pipeline = [
            // Step 1: Match the project
            { $match: whereCondition },

            // Step 2: Lookup members
            {
                $lookup: {
                    from: "members",
                    localField: "teamMembers",
                    foreignField: "_id",
                    as: "members"
                }
            },

            // Step 3: Lookup tasks
            {
               $lookup: {
                 from: tableConstants.TASKS,
                 let: { projectId: '$_id' },
                 pipeline: [
                   { $match: taskMatchStage }
                 ],
                 as: 'tasks'
               }
            },
            // Remove deleted tasks
            {
                $addFields: {
                    tasks: {
                        $filter: {
                            input: "$tasks",
                            as: "task",
                            cond: { $eq: ["$$task.isDeleted", false] }
                        }
                    }
                }
            },

            // Step 4: Unwind tasks + timeLogs
            { $unwind: { path: "$tasks", preserveNullAndEmptyArrays: true } },
            // 🔹 Add here → filter logs by monthYear
            ...(monthYear
              ? [ {
              $addFields: {
                "tasks.timeLogs": {
                  $filter: {
                    input: "$tasks.timeLogs",
                    as: "log",
                    cond: {
                      $and: [
                        { $gte: ["$$log.date", new Date(startOfMonth)] },
                        { $lte: ["$$log.date", new Date(endOfMonth)] }
                      ]
                    }
                  }
                }
              }
            }]
              : []),
            { $unwind: { path: "$tasks.timeLogs", preserveNullAndEmptyArrays: true } },

            // Step 5: Group project-level sums
            {
                $group: {
                    _id: "$_id",
                    totalTargetHours: { $first: { $sum: "$members.targetHours" } }, // need another stage for this
                    totalLoggedHours: { $sum: "$tasks.timeLogs.actualHours" },
                    totalMemberBillableHours: { $sum: "$tasks.timeLogs.billableHours" },
                    totalTaskBillableHours: { $sum: "$tasks.billableHours" },
                    teamMembers: { $first: "$members" }
                }
            },

            // Step 6: Fix totalTargetHours (sum over members correctly)
            {
                $addFields: {
                    totalTargetHours: {
                        $reduce: {
                            input: "$teamMembers",
                            initialValue: 0,
                            in: { $add: ["$$value", "$$this.targetHours"] }
                        }
                    }
                }
            },

            // Step 7: Project final header fields
            {
                $project: {
                    _id: 0,
                    totalTargetHours: 1,
                    totalLoggedHours: 1,
                    totalMemberBillableHours: 1,
                    totalTaskBillableHours: 1,
                    teamMembersCount: { $size: "$teamMembers" }
                }
            }
        ];

        const result = await projectSchema.aggregate(pipeline);

        const headerObj = result[0] || {
            totalTargetHours: 0,
            totalLoggedHours: 0,
            totalMemberBillableHours: 0,
            totalTaskBillableHours: 0,
            teamMembersCount: 0
        };

        headerObj.underOver = await this.calculateUnderOverTime(headerObj.totalTargetHours, headerObj.totalMemberBillableHours);
        headerObj.billableHoursPercentage = await this.calculateBillableHoursPercentage(headerObj.totalMemberBillableHours, headerObj.totalTargetHours);
        headerObj.loggedHoursPercentage = await this.calculateLoggedHoursPercentage(headerObj.totalLoggedHours, headerObj.totalMemberBillableHours);

        headerObj.totalLoggedHours = await this.minutesToTimeString(headerObj.totalLoggedHours);
        headerObj.totalMemberBillableHours = await this.minutesToTimeString(headerObj.totalMemberBillableHours);
        headerObj.totalTaskBillableHours = await this.minutesToTimeString(headerObj.totalTaskBillableHours);
        headerObj.totalTargetHours = await this.minutesToTimeString(headerObj.totalTargetHours*60);

        return headerObj;
    }

    async calculateUnderOverTime(totalTargetHours, totalMemberBillableHours) {
        const targetHoursInMinutes = totalTargetHours * 60,
            underOverCalculated = Number(targetHoursInMinutes) - Number(totalMemberBillableHours);
        // convert minutes -> hours display (keeps your existing behaviour)
        const underOver = await this.minutesToTimeString(underOverCalculated);
        return underOver;
    }

    async calculateBillableHoursPercentage(totalMemberBillableHours, totalTargetHours) {
        const targetHoursInMinutes = totalTargetHours * 60,
            billableHoursPercentage = ((Number(totalMemberBillableHours) / Number(targetHoursInMinutes)) * 100) || 0;
        return Number.parseFloat(billableHoursPercentage).toFixed(2);
    }

    async calculateLoggedHoursPercentage(totalLoggedHours, totalMemberBillableHours) {
        const loggedHoursPercentage = ((Number(totalLoggedHours) / Number(totalMemberBillableHours)) * 100) || 0;
        return Number.parseFloat(loggedHoursPercentage).toFixed(2);
    }

    // Convert "HH:MM" string → total minutes (integer)
    timeStringToMinutes(timeStr) {
      const [hours, minutes = 0] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    }

    // Convert total minutes (integer) → "HH:MM" string
    minutesToTimeString(totalMinutes) {
      const isNegative = totalMinutes < 0;
      const absMinutes = Math.abs(totalMinutes);
    
      const hours = Math.floor(absMinutes / 60);
      const minutes = absMinutes % 60;
    
      const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      return isNegative ? `-${timeStr}` : timeStr;
    } 

    convertHoursToTimeString(data) {
        if (!Array.isArray(data) || data.length === 0) return data;
    
        data.forEach(projectObj => {
            if (!projectObj.projects || !Array.isArray(projectObj.projects)) return;
    
            projectObj.projects.forEach(project => {
                if (!project.tasks || !Array.isArray(project.tasks)) return;
    
                project.tasks.forEach(task => {
                    // Convert task-level hours safely
                    if (typeof task.taskLogged === 'number') {
                        task.taskLogged = this.minutesToTimeString(task.taskLogged);
                    }
                    if (typeof task.taskBillable === 'number') {
                        task.taskBillable = this.minutesToTimeString(task.taskBillable);
                    }
                    if (typeof task.variance === 'number') {
                        task.variance = this.minutesToTimeString(task.variance);
                    }
    
                    // Convert hours inside timeLogs safely
                    if (task.timeLogs && Array.isArray(task.timeLogs)) {
                        task.timeLogs.forEach(log => {
                            if (typeof log.actualHours === 'number') {
                                log.actualHours = this.minutesToTimeString(log.actualHours);
                            }
                            if (typeof log.billableHours === 'number') {
                                log.billableHours = this.minutesToTimeString(log.billableHours);
                            }
                            if (typeof log.variance === 'number') {
                                log.variance = this.minutesToTimeString(log.variance);
                            }
                        });
                    }
                });
            });
        });
    
        return data;
    }
    convertProjectHoursToTimeString(projectObj) {
        if (!projectObj || !Array.isArray(projectObj.tasks)) return projectObj;
        projectObj.tasks.forEach(task => {
            // Convert task-level hours safely
            if (typeof task.taskLogged === 'number') {
                task.taskLogged = this.minutesToTimeString(task.taskLogged);
            }
            if (typeof task.taskBillable === 'number') {
                task.taskBillable = this.minutesToTimeString(task.taskBillable);
            }
            if (typeof task.variance === 'number') {
                task.variance = this.minutesToTimeString(task.variance);
            }
            if (typeof task.totalLogBillable === 'number') {
                task.totalLogBillable = this.minutesToTimeString(task.totalLogBillable);
            }
    
            // Convert inside timeLogs
            if (Array.isArray(task.timeLogs)) {
                task.timeLogs.forEach(log => {
                    if (typeof log.actualHours === 'number') {
                        log.actualHours = this.minutesToTimeString(log.actualHours);
                    }
                    if (typeof log.billableHours === 'number') {
                        log.billableHours = this.minutesToTimeString(log.billableHours);
                    }
                    if (typeof log.variance === 'number') {
                        log.variance = this.minutesToTimeString(log.variance);
                    }
                });
            }
        });
        return projectObj;
    }



    /**
     * Fetch a member list by project id with join members.
     * @param {String} projectId
     * @returns {Promise<Object|null>}
     */
    async FetchProjectNotesList(projectId, offset, limit){     
        try {   
            const baseUrl = process.env.ASSETS_URL_BASE;

            const result = await ProjectNotesSchema.aggregate([
                {
                    $match: { projectId: projectId }
                },
                 // Lookup from admins
                {
                    $lookup: {
                    from: "admins",
                    localField: "addedBy",
                    foreignField: "_id",
                    as: "adminInfo"
                    }
                },

                // Lookup from members
                {
                    $lookup: {
                    from: "members",
                    localField: "addedBy",
                    foreignField: "_id",
                    as: "memberInfo"
                    }
                },
                {
                    $addFields: {
                        files: {
                            $map: {
                            input: "$files",
                            as: "file",
                            in: {
                                _id: "$$file._id",
                                name: { $concat: [baseUrl, '/uploads/project_notes/', "$$file.name"] }
                            }
                            }
                        },
                        addedBy: {
                            $cond: [
                                { $eq: ["$addedByType", 1] },
                                { $ifNull: [{ $arrayElemAt: ["$adminInfo.name", 0] }, ""] },
                                {
                                    $concat: [
                                        { $ifNull: [{ $arrayElemAt: ["$memberInfo.firstName", 0] }, ""] },
                                        " ",
                                        { $ifNull: [{ $arrayElemAt: ["$memberInfo.surname", 0] }, ""] }
                                    ]
                                }
                            ]
                        }    // convert object → plain string
                    }
                },
                {
                    $project: {
                        adminInfo: 0,
                        memberInfo: 0,
                        addedByType: 0,
                        __v: 0
                    }
                },
                { $sort: { createdAt: -1 } },       // order by createdAt desc
                { $skip: offset },                  // offset
                { $limit: limit } 
            ]);
            
            return result;
            
        } catch (error) {
            logger.error("fetchProjectNotesList error:", error);
            throw error;
        }
    }

    /**
     * Fetch all projects with aggregation, applying conditional field logic in the pipeline.
     * @param {Object} params - { status, search }
     * @returns {Promise<Array>}
     */
    async fetchAllProjects(status, search, adminId, offset, limit, projectType, memberId) {
        const match = {
            isDeleted: false,
            adminId: new mongoose.Types.ObjectId(String(adminId))
        };

        if (memberId) {
            match.teamMembers = { $in: [new mongoose.Types.ObjectId(String(memberId))] };
        } 

        if (status == commonConstants.STATUS.ACTIVE) {
            match.isActive = true;
        } else if (status == commonConstants.STATUS.INACTIVE) {
            match.isActive = false;
        }

        if (projectType === commonConstants.PROJECT_TYPE.SINGLE || projectType === commonConstants.PROJECT_TYPE.REPEATING) {
            match.projectType = projectType;
        } else {
            match.projectType = { $in: [commonConstants.PROJECT_TYPE.SINGLE, commonConstants.PROJECT_TYPE.REPEATING] };
        }

        const pipeline = [
            { $match: match },
            {
                $lookup: {
                    from: 'clients',
                    localField: 'clientId',
                    foreignField: '_id',
                    as: 'client'
                }
            },
            { $unwind: { path: '$client', preserveNullAndEmptyArrays: true } },
            ...(search ? [{
                $match: {
                    $or: [
                        { projectTitle: { $regex: search, $options: 'i' } },
                        { 'client.name': { $regex: search, $options: 'i' } }
                    ]
                }
            }] : []),
            {
                $addFields: {
                    projectId: '$_id',
                    startDate: {
                        $cond: [
                            { $eq: ['$projectType', 'single'] },
                            { $dateToString: { format: '%Y-%m-%d', date: '$startDate' } },
                            '$$REMOVE'
                        ]
                    },
                    deadlineDate: {
                        $cond: [
                            { $eq: ['$projectType', 'single'] },
                            { $dateToString: { format: '%Y-%m-%d', date: '$deadlineDate' } },
                            '$$REMOVE'
                        ]
                    },
                    startMonth: {
                        $cond: [
                            { $eq: ['$projectType', 'repeating'] },
                            '$startMonth',
                            '$$REMOVE'
                        ]
                    },
                    endMonth: {
                        $cond: [
                            { $eq: ['$projectType', 'repeating'] },
                            '$endMonth',
                            '$$REMOVE'
                        ]
                    },
                    lowerClientName: { $toLower: "$client.name" },
                    lowerProjectTitle: { $toLower: "$projectTitle" }
                }
            },
            {
                $facet: {
                    total: [{ $count: 'totalCounts' }],
                    data: [
                        { $sort: { lowerClientName: 1, lowerProjectTitle: 1 } },
                        {
                            $project: {
                                _id: 0,
                                projectId: 1,
                                clientId: 1,
                                projectTitle: 1,
                                projectType: 1,
                                baseProjectId: 1,
                                startDate: 1,
                                deadlineDate: 1,
                                brief: 1,
                                defaultHourlyRate: 1,
                                purchaseOrderNumber: 1,
                                approvalTypeId: 1,
                                estimate: 1,
                                invoice: 1,
                                teamMembers: 1,
                                projectNumber: 1,
                                addTasks: 1,
                                clientView: 1,
                                isActive: 1,
                                projectStatus: 1,
                                clientName: '$client.name',
                                // lowerClientName: 1,
                                // lowerProjectTitle
                            }
                        },
                        ...(typeof offset === 'number' && offset > 0 ? [{ $skip: offset }] : []),
                        ...(typeof limit === 'number' && limit > 0 ? [{ $limit: limit }] : [])
                    ]
                }
            },
            {
                $project: {
                    data: 1,
                    totalCounts: { $arrayElemAt: ['$total.totalCounts', 0] }
                }
            }
        ];

        const result = await ProjectSchema.aggregate(pipeline);
        return {
            projectList: result[0]?.data || [],
            totalCounts: result[0]?.totalCounts || 0
        };
    }

    async taskHourData(taskSchema, adminId, memberId = "", monthYear = "") {
       // Validate & parse monthYear
       const parsedDate = await dateTimeLibObj.validateMonthYear(monthYear, commonConstants.MONTH_YEAR_FORMAT);
       if (!parsedDate.status) {
           return 'INVALID_MONTH_YEAR_FORMAT';
       }
   
       const { startOfMonth, endOfMonth } = parsedDate;
   
       // Extract year & month for filling missing days
       const [year, month] = monthYear.split("-").map(Number);

       // Aggregation with $filter to safely handle timeLogs
       const results = await taskSchema.aggregate([
           // Match active tasks for the admin
           {
               $match: {
                   adminId: new mongoose.Types.ObjectId(adminId),
                   isDeleted: false
               }
           },
           // Filter timeLogs in the month
           {
               $addFields: {
                   timeLogs: {
                       $filter: {
                           input: { $ifNull: ["$timeLogs", []] },
                           as: "log",
                           cond: {
                               $and: [
                                   { $gte: ["$$log.date", new Date(startOfMonth)] },
                                   { $lte: ["$$log.date", new Date(endOfMonth)] },
                                   ...(memberId
                                     ? [
                                         {
                                           $eq: [
                                             "$$log.creatorId",
                                             new mongoose.Types.ObjectId(memberId),
                                           ],
                                         },
                                       ]
                                     : []),
                               ]
                           }
                       }
                   }
               }
           },
           // Unwind filtered logs
           { $unwind: "$timeLogs" },
           // Group by day
           {
               $group: {
                   _id: { day: { $dayOfMonth: "$timeLogs.date" } },
                   logged: { $sum: "$timeLogs.actualHours" },
                   billable: { $sum: "$timeLogs.billableHours" }
               }
           },
           // Project final fields
           {
               $project: {
                   _id: 0,
                   day: "$_id.day",
                   logged: 1,
                   billable: 1,
                   variance: { $subtract: ["$billable", "$logged"] }
               }
           },
           { $sort: { day: 1 } }
       ]);
      
       // Fill missing days
       const daysInMonth = new Date(year, month, 0).getDate();
       const dayMap = new Map(results.map(r => [r.day, r]));
   
       const filled = Array.from({ length: daysInMonth }, (_, i) => {
           const day = i + 1;
           return {
               day,
               date: new Date(year, month - 1, day),
               logged: this.minutesToTimeString(dayMap.get(day)?.logged || 0),
               billable: this.minutesToTimeString(dayMap.get(day)?.billable || 0),
               variance: this.minutesToTimeString(dayMap.get(day)?.variance || 0)
           };
       });
   

       // Calculate totals
       const totalBillable = filled.reduce((acc, d) => acc + (dayMap.get(d.day)?.billable || 0), 0);
       const totalLogged = filled.reduce((acc, d) => acc + (dayMap.get(d.day)?.logged || 0), 0);
       const totalVariance = filled.reduce((acc, d) => acc + (dayMap.get(d.day)?.variance || 0), 0);
       
       // Daily average (based on billable hours)
       const avgMinutes = filled.length ? Math.round(totalBillable / filled.length) : 0;
       const avg = this.minutesToTimeString(avgMinutes);
   
       // Final response
       return {
           dailyBillableAverage: avg,
           totalBillable: this.minutesToTimeString(totalBillable),
           totalLogged: this.minutesToTimeString(totalLogged),
           totalVariance: this.minutesToTimeString(totalVariance),
           days: filled
       };
   }

   
//calculate working hours
calculateWorkingHours(punchInTime, punchOutTime) {

// Trim hidden spaces 
  punchInTime = punchInTime.trim();
  punchOutTime = punchOutTime.trim();

  const [h1, m1, s1] = punchInTime.split(":").map(Number);
  const [h2, m2, s2] = punchOutTime.split(":").map(Number);

  const startSeconds = h1 * 3600 + m1 * 60 + s1;
  const endSeconds = h2 * 3600 + m2 * 60 + s2;

  const diff = endSeconds - startSeconds;

  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);

  return { hours, minutes };
}
}

module.exports = commonHelpers;