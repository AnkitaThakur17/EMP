import bcrypt from "bcryptjs";
import commonConstants from "~/constants/commonConstants";

/**
 * Crypt password.
 *
 * @param  {String}   password
 * @returns {String}
 */
function cryptPassword(password) {


    return bcrypt.genSalt(commonConstants.PASSWORD_SALT_ROUNDS).then((salt) => {


        return bcrypt.hash(password, salt).then((hash) => {
            return hash;

        }).catch((error) => {

            return error
        });

    }).catch((err) => {

        return err
    });



};

/**
 * Compare password.
 *
 * @param  {String}   password
 * @param  {String}   hash
 * @returns {String}
 */
function compareSync(password, hash) {
    return bcrypt.compareSync(password, hash);
};


const passwordHash = {
    cryptPassword,
    compareSync,
};


export default passwordHash;