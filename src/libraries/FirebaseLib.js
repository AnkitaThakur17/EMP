import admin from 'firebase-admin';

let serviceAccount;
if (process.env.ENABLE_NOTIFICATION === 'true') {
    serviceAccount = require('*/firebase_service_account.json');

    // Initialize Firebase Admin SDK
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

class FirebaseLib {

    /**
     * Send notification using Firebase Admin SDK.
     *
     * @param {string} deviceToken - The device token to which the notification should be sent.
     * @param {Object} notificationPayload - The payload of the notification.
     * @returns {Promise<Object>} - A promise that resolves with the response or error.
    */
    sendNotification(deviceToken, notificationPayload) {
        try {
            return new Promise(async (resolve, reject) => {
                // Validate notificationPayload fields for notification
                const validNotificationPayload = {};
                if (notificationPayload.title) validNotificationPayload.title = notificationPayload.title;
                if (notificationPayload.body) validNotificationPayload.body = notificationPayload.body;

                // Construct the message object
                const message = {
                    notification: validNotificationPayload,
                    data: {
                        title: notificationPayload.title,
                        description: notificationPayload.description ? notificationPayload.description.toString() : notificationPayload.description,
                        action: notificationPayload.action ? notificationPayload.action.toString() : notificationPayload.action,
                        typeId: notificationPayload.typeId ? notificationPayload.typeId.toString() : '',
                        type: notificationPayload.type ? notificationPayload.type.toString() : notificationPayload.type,
                        notificationId: notificationPayload.notificationId ?? ''
                    },
                    token: deviceToken
                };
                
                try {
                    const response = await admin.messaging().send(message);
                    console.log('Successfully sent message:', response);
                    resolve(response);
                } catch (error) {
                    console.error('Error sending message:', error);
                    reject(error);
                }

            });
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async sendMultiNotification(tokens, payloadData) {
        try {
            // Validate input
            if (!Array.isArray(tokens) || tokens.length === 0) {
                throw new Error("Tokens array is empty or invalid.");
            }
            if (!payloadData || !payloadData.title || !payloadData.body) {
                throw new Error("Invalid payload data.");
            }

            // Declare variables
            const title = payloadData.title,
                body = payloadData.body,
                message = {
                    notification: { title, body },
                    data: payloadData,
                };

            const size = 500; // Firebase batch size limit
            const batches = [];

            // Split tokens into chunks
            for (let i = 0; i < tokens.length; i += size) {
                batches.push(tokens.slice(i, i + size));
            }

            let successCount = 0, failureCount = 0;

            try {
                // Send notifications in batches
                await Promise.all(
                    batches.map(async (batch) => {
                        const chunkMessage = { ...message, tokens: batch };
                        try {
                            const chunkResponse = await admin.messaging().sendEachForMulticast(chunkMessage);
                            successCount += chunkResponse.successCount;
                            failureCount += chunkResponse.failureCount;
                        } catch (error) {
                            console.error("Error sending batch:", error.message);
                            failureCount += batch.length;
                        }
                    })
                );
                // Return results
                return { success: true, successCount, failureCount };
            } catch (error) {
                console.error("Error sending notifications:", error.message);
                return { success: false, error: error.message };
            }

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

}

module.exports = FirebaseLib;