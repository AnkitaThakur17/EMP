import moment from "moment";
import commonConstants from "~/constants/commonConstants";

/**
 * Define DateTime Library
 */
class DateTime {

    /**
     * Convert UTC time to any local time.
     *
     * @param  {String}  time  Format - YYYY-MM-DD HH:mm:ss.
     * @param  {String}  timezone
     * @param  {String}  format
     * @returns {String}
     */
    utcToAnyTimezone(time, timezone, format) {
        const convertedTime = this.changeFormat(time, commonConstants.DB_DATE_FORMAT);
        return moment.utc(convertedTime).tz(timezone).format(format);
    }

    /**
     * Convert local time to UTC time.
     *
     * @param  {String}  time Format - YYYY-MM-DD HH:mm:ss.
     * @param  {String}  timezone
     * @param  {String}  format
     * @returns {String}
     */
    localToUtc(time, timezone, format) {
        const convertedTime = this.changeFormat(time, commonConstants.DB_DATE_FORMAT);
        return moment.tz(convertedTime, format, timezone).utc().format(format);
    }

    /**
     * Get the difference between two times.
     *
     * @param  {String}  startTime Format - YYYY-MM-DD HH:mm:ss.
     * @param  {String}  endTime Format - YYYY-MM-DD HH:mm:ss.
     * @param  {String}  type Can be (hours, minutes, weeks, days).
     * @returns {Number}
     */
    getDifference(startTime, endTime, type) {
        const start = moment(this.changeFormat(startTime, commonConstants.DB_DATE_FORMAT));
        const end = moment(this.changeFormat(endTime, commonConstants.DB_DATE_FORMAT));
        return moment.duration(end.diff(start)).as(type);
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
     * Return total duration from current time.
     *
     * @param  {String}  inputDate
     * @returns {String}
     */
    getTotalDurationFromNow(inputDate) {
        return moment(inputDate).fromNow();
    }

    /**
     * Append duration to a date.
     *
     * @param  {String}  startDate
     * @param  {String}  duration
     * @param  {String}  type
     * @returns {String}
     */
    appendDaysInDate(startDate, duration, type) {
        const start = moment(this.changeFormat(startDate, commonConstants.DB_DATE_FORMAT));
        return start.add(duration, type).format(commonConstants.DB_DATE_FORMAT);
    }

    /**
     * Change timestamp format from database result.
     *
     * @param  {Object} DTObject
     * @param  {String} columnName
     * @param  {String} format
     * @returns {Object}
     */
    async changeDatabaseTimestampFormat(DTObject, columnName, format) {
        return Promise.all(
            DTObject.map((row) => {
                row[columnName] = this.changeFormat(row[columnName], format);
                return row;
            })
        );
    }

    /** 
     * strtDate 'YYYY-MM-DD'
     * deadlineDate 'YYYY-MM-DD'
     * 
     */
    validateSingleProjectTime(startDate, deadlineDate, format = 'YYYY-MM-DD') {
        // const now = moment().startOf('day');
        const start = moment(startDate, format);
        const end = moment(deadlineDate, format);
        const response = {
            "status": true
        };

        // if (start.isBefore(now)) {
        //     response.status = false;
        //     response.message = 'startDate should not be less than current date.';
        // }
        if (!end.isAfter(start)) {
            response.status = false;
        }

        return response;
    }

    /**
     * 
     * @param {Array} repeatingMonths - Array of objects with year and months.
     * @param {String|null} id - Project ID, if available.
     * @returns {Object} - Validation result with status and message.
     */
    validateRepeatingProjectTime(repeatingMonths = [], id = null) {
        if (!id) {
            const currentYear = moment().year();
            const requestedYears = repeatingMonths.map(obj => obj.year);
            const requiredYears = Array.from({ length: commonConstants.REPEATING_FUTURE_YEARS }, (_, i) => currentYear + i);
            // Check required years and requested years are same
            if (requiredYears.length !== requestedYears.length || !requiredYears.every(year => requestedYears.includes(year))) {
                return { status: false };
            }
        }

        return { status: true };
    }

    /** 
     * monthYear 'YYYY-MM'
     * format 'YYYY-MM'
     * 
     */
    validateMonthYear(monthYear, format = 'YYYY-MM') {
        const parsedDate = moment(monthYear, format, true);
        const response = {
            "status": true
        };

        if (!parsedDate.isValid()) {
            response.status = false;
        }else {
            response.month = parsedDate.month() + 1;
            response.year = parsedDate.year();
            response.startOfMonth = parsedDate.startOf('month').format('YYYY-MM-DD');
            response.endOfMonth = parsedDate.endOf('month').format('YYYY-MM-DD');
        }

        return response;
    }
}

module.exports = DateTime;