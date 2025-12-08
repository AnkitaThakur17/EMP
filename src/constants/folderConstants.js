require('dotenv').config();

const folderConstants = {
    PROFILE_UPLOAD_PATH: process.env.ASSETS_URL_BASE ? `${process.env.ASSETS_URL_BASE}/uploads/profile/` : null,
};

module.exports = folderConstants;
