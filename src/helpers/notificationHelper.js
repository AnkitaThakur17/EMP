import commonConstants from '~/constants/commonConstants';
class NotificationHelper {

    constructor({ FirebaseLib, DateTimeUtil, BaseModel, UserSchema, commonConstants }) {
        this.FirebaseLib = FirebaseLib;
        this.DateTimeUtil = DateTimeUtil;
        this.BaseModel = BaseModel;
        this.UserSchema = UserSchema;
        this.commonConstants = commonConstants;
    }

    /**
     * Create function for setting notification.
     * @param {Object} notificationData 
     * @param {boolean} [sendPushNotification=true] 
     * @param {boolean} [notificationType=false] 
     * @param {boolean} [notifyId] 
     */
    async setNotification(notificationData, sendPushNotification = true, notificationType = false, tableName) {
        try {

            let notificationIds = []; // To store notification IDs for all entries
            let notificationPayload = {
                "title": notificationData.title,
                "description": notificationData.description,
                "body": notificationData.description,
                "action": notificationData.action,
                "type": notificationData.type,
                // "notificationId": notificationIds.toString()
            };

            if (notificationType === false) {

                // Check if receiverId is an array
                if (Array.isArray(notificationData.receiverId)) {

                    // Handle multiple receiverIds by creating individual entries
                    for (const receiverId of notificationData.receiverId) {
                        const insertData = {
                            "receiverId": receiverId,
                            "senderType": notificationData.senderType,
                            "receiverType": notificationData.receiverType,
                            "type": notificationData.type,
                            "title": notificationData.title,
                            "action": notificationData.action,
                            "description": notificationData.description,
                            "createdAt": new Date()
                        };
                        const insertNotification = await this.BaseModel.createObj(insertData, this.NotificationSchema);
                        // notificationIds = insertNotification._id
                        notificationIds.push(insertNotification._id);
                    }
                } else {

                    // Single receiverId case
                    // var notificationId;
                    let insertData = {
                        "receiverId": notificationData.receiverId,
                        "senderType": notificationData.senderType,
                        "receiverType": notificationData.receiverType,
                        "type": notificationData.type,
                        "title": notificationData.title,
                        "action": notificationData.action,
                        "description": notificationData.description,
                        "createdAt": new Date()
                    };

                    if (notificationData.senderId) {
                        insertData.senderId = notificationData.senderId
                    }

                    if (notificationData.typeId) {
                        insertData.typeId = notificationData.typeId
                    }

                    const insertNotification = await this.BaseModel.createObj(insertData, this.NotificationSchema);
                    if (insertNotification.type == 'broadcast' && !insertNotification.receiverId) {
                        // Update the user's profile in MongoDB
                        await this.BaseModel.updateObj(
                            { isRead: 'true' },
                            { _id: insertNotification._id },
                            this.NotificationSchema
                        );
                    }
                    notificationPayload.notificationId = insertNotification._id.toString();
                    // notificationIds.push(insertNotification._id);
                }
            }

            // To send push notification
            if (sendPushNotification) {
                notificationData.description = notificationData.description.replace(/<\/?[^>]+(>|$)/g, "").replace(/"/g, "");

                if (Array.isArray(notificationData.receiverId) || notificationData.type === 'broadcast') {

                    // Broadcast notification case
                    let notification_enabled, device_token_arr = [];

                    if (notificationData.receiverId && notificationData.receiverId.length > 0) {
                        for (let index = 0; index < notificationData.receiverId.length; index++) {
                            const element = notificationData.receiverId[index];

                            notification_enabled = this.commonConstants.STATUS.NOTIFICATION_ENABLE

                            let receiver_info = await this.BaseModel.fetchSingleObj({ '_id': element, "notificationEnable": notification_enabled }, tableName);

                            if (!receiver_info) {
                                continue; // Skip to the next receiverId
                            }

                            const deviceToken = (receiver_info.devices && receiver_info.devices[0] && receiver_info.devices[0].deviceToken)
                                ? receiver_info.devices[0].deviceToken
                                : '';
                            notificationPayload.notificationId = notificationIds[index].toString();
                            notificationPayload.typeId = notificationData.typeId;

                            const test = await this.FirebaseLib.sendNotification(
                                deviceToken,
                                notificationPayload
                            );
                        }

                    } else {
                        // Case 2: No specific receiver IDs, fetch all users
                        const where = {
                            'isBlock': this.commonConstants.STATUS.UNBLOCK,
                            'isActive': this.commonConstants.STATUS.ACTIVE,
                            "isDeleted": this.commonConstants.STATUS.NOT_DELETED,
                            "notificationEnable": this.commonConstants.STATUS.NOTIFICATION_ENABLE
                        };
                        const userDetail = await this.BaseModel.fetchObj(where, this.UserSchema);

                        for (let index = 0; index < userDetail.length; index++) {
                            const element = userDetail[index];

                            // Extract device token
                            const device_token = (element.devices && element.devices[0] && element.devices[0].deviceToken)
                                ? element.devices[0].deviceToken
                                : '';

                            // Add to array if valid
                            if (device_token) {
                                device_token_arr.push(device_token);
                            }
                        }

                    }

                    // Check if device_token_arr is not empty and contains valid tokens
                    if (device_token_arr.length > 0) {
                        const test = await this.FirebaseLib.sendMultiNotification(device_token_arr, notificationPayload);

                    } else {
                        console.log("No valid device tokens for broadcast.");
                    }
                } else {
                    // Single notification case
                    const receiverInfo = await this.BaseModel.fetchSingleObj(
                        { _id: notificationData.receiverId },
                        tableName
                    );
                    notificationPayload.typeId = notificationData.typeId;

                    const deviceToken =
                        receiverInfo.devices?.[0]?.deviceToken || "";

                    let notificationEnabled = 1;
                    if (notificationData.receiverType === 'user') {
                        notificationEnabled = receiverInfo.notificationEnable ? 1 : 0;
                    }

                    if (deviceToken && notificationEnabled) {

                        await this.FirebaseLib.sendNotification(
                            deviceToken,
                            notificationPayload
                        );
                        console.log("Notification sent successfully");
                    }
                    else {
                        console.error(
                            "Notification disabled or no valid device token."
                        );
                    }
                }
            } else {
                return notificationIds; // Return all notification IDs
            }
        } catch (error) {
            console.log("Error in setNotification", error);
            return error;
        }
    }

}

module.exports = NotificationHelper;