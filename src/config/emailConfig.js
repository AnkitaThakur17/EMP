import path from 'path';
import commonConstants from '~/constants/commonConstants';
import hbs from 'nodemailer-express-handlebars';
import nodemailer from 'nodemailer';

// initialize nodemailer for smpt 
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true, // upgrade later with STARTTLS
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    },

});

// Point to the template folder
var handlebarOptions = {
    viewEngine: {
        partialsDir: path.resolve(commonConstants.EMAIL_TEMPLATE_URL),
        defaultLayout: false,
    },
    viewPath: path.resolve(commonConstants.EMAIL_TEMPLATE_URL),
};

// Use a template file with nodemailer
transporter.use('compile', hbs(handlebarOptions))

export default transporter;