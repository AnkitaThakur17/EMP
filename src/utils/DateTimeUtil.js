import moment from "moment-timezone";

/**
 * Static DateTimeUtil class.
 */
class DateTimeUtil {
    /**
     * Helper method to convert current timestamp to postgres timstamp.
     *
     * @returns {Object} The resultant snake_case object.
     */
    getCurrentTimeObjForDB() {
        const currentTime = new Date(),
            format = "YYYY-MM-DD HH:mm:ss";

        return moment(currentTime, format)
            .utc()
            .format(format);
    }

    /**
     * Helper method to add minutes in current timestamp.
     *
     * @param {Object} minutesData
     * @returns {Object} The resultant snake_case object.
     */
    getCurrentWithAddMinutes(minutesData) {
        const currentTime = new Date(),
            format = "YYYY-MM-DD HH:mm:ss";

        return moment(currentTime, format)
            .add(minutesData, "minutes")
            .utc()
            .format(format);
    }

    /**
     * Helper method to add minuts in current timestamp.
     *
     * @param {Object} minutesData
     * @returns {Object} The resultant snake_case object.
     */
    getCurrentWithAddMonths(minutesData) {
        const currentTime = new Date(),
            format = "YYYY-MM-DD HH:mm:ss";

        return moment(currentTime, format)
            .add(minutesData, "months")
            .utc()
            .format(format);
    }

    /**
     * Helper method to return current timestamp for cron.
     *
     * @returns {Object}
     */
    getCurrentTimeObjForCron() {
        const currentTime = new Date(),
            format = "YYYY-MM-DD HH:mm:ss A";

        return moment(currentTime, format)
            .utc()
            .format(format);
    }

    /**
     * Helper method to get current year.
     *
     * @returns {Object} 
     */
    getCurrentYear() {
        const year = new Date(),
            format = "YYYY";

        return moment(year, format)
            .utc()
            .format(format);
    }

    /**
     * Helper method to get current date.
     *
     * @returns {Object} 
     */
    getCurrentDate() {
        const date = new Date(),
            format = "YYYY-MM-DD";


        return moment(date, format)
            .utc()
            .format(format);
    }

    /**
     * Helper method to get current date.
     *
     * @returns {Object} 
     */
    getCurrentTime() {
        const date = new Date(),
            format = "HH:mm:ss";


        return moment(date, format)
            .utc()
            .format(format);
    }

    /**
    * Helper method to get the current local time.
    *
    * @returns {string} 
    */
    getLocalCurrentTime() {
        const date = new Date();
        const format = "HH:mm:ss";
        return moment(date).format(format);
    }


    /**
     * Get a formatted date.
     *
     * @param  {String}  inputDate
     * @param  {String}  format
     * @returns {String}
     */
    changeFormat(inputDate, format) {
        return moment(inputDate).format(format);
    }

    /**
     * Helper method to get next year.
     *
     * @returns {Object} 
     */
    getNextYear() {
        const nextYear = new Date(),
            format = "YYYY";

        return moment(nextYear, format)
            .add(1, "y")
            .utc()
            .format(format);
    }

    /**
    * Get differnce between time
    *
    * @returns {Object} 
    */
    getTimeDiffernce(times, dates) {

        // Current date and time
        const currentTime = moment();

        // date and time
        const date = moment(dates);
        const time = moment(times, 'HH:mm:ss');

        // Combine the date and time
        const dateTime = moment({
            year: date.year(),
            month: date.month(),
            day: date.date(),
            hour: time.hours(),
            minute: time.minutes(),
            second: time.seconds()
        });

        // Calculate the difference in milliseconds
        const differenceInMilliseconds = dateTime.diff(currentTime);

        // Convert milliseconds to minutes
        const differenceInMinutes = moment.duration(differenceInMilliseconds).asMinutes();

        return Math.round(differenceInMinutes);
    }

    getTimeRangeAfterOneHour() {
        const format = "HH:mm:ss"; // Include seconds in the format

        // Current time
        const currentTime = moment().utc();

        // Time after 1 hour, setting seconds to 00
        const startTime = currentTime.clone().add(1, 'hours').startOf('minute').format(format);

        // Time after 2 hours, setting seconds to 59
        const endTime = currentTime.clone().add(2, 'hours').startOf('minute').subtract(1, 'second').format(format);

        return { startTime, endTime };
    }
}

/**
 * @module
 * @type {DateTimeUtil}
 */
module.exports = DateTimeUtil;
