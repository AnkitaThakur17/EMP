/**
 * Common Constants
 *
 * @package                
 * @subpackage             Common Constants
 * @category               Constants
 * @ShortDescription       This is responsible for common constants
 */

const commonConstants = {
    STORAGE_PATH: "./uploads/",
    UPLOAD_PATH: "uploads/",
    PROFILE_UPLOAD_PATH: "profile",
    ADMIN_UPLOAD_PATH: "admin",
    DEFAULT_USER_IMAGE: '/images/default_user.png',
    DB_DATE_FORMAT: "YYYY-MM-DD HH:mm:ss", // Used in dateTime library
    EMAIL_TEMPLATE_URL: process.env.EMAIL_TEMPLATES || "./src/emails/", // Dynamic email templates path
    PASSWORD_SALT_ROUNDS: 10, // Ensure secure handling
    HASH_ID_SALT: "jkhgdklhjhgsdkljjhkldjjhf766tyuhgu",
    LIST_LIMIT: 10,
    SIGNUP_TYPE: {
        NORMAL: 'normal',
        SOCIAL: 'social',
    },
    USER_TYPE: {
        ADMIN: 'admin',
        CLIENT: 'client',
        MEMBER: 'member',
    },
    STATUS: {
        FALSE: false,
        TRUE: true,
        NO: 0,
        YES: 1,
        NOT_DELETED: 0,
        DELETED: 1,
        LOGGED_IN: 1,
        UNBLOCK: 0,
        BLOCKED: 1,
        ACTIVE: 1,
        INACTIVE: 0,
        NOTIFICATION_ENABLE: 1,
        NOT_DELETED_BOOLEAN: false,
        DELETED_BOOLEAN: true
    },
    DEVICE_TYPE: {
        ANDROID: 'android',
        IOS: 'ios',
        WEBSITE: 'web',
    }
};

module.exports = commonConstants;