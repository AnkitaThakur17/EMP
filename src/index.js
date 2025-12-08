import express from "express";
import bodyParser from "body-parser";
import { notFound } from "./middlewares/errorHandler";
import Path from "path";
import logger from "~/utils/logger";
import fileUpload from "express-fileupload";
import swaggerUI from "swagger-ui-express";
import { userApiRoutes } from "./modules/users/routes";
import swaggerDefination from "~/api-doc/v1/_build/main_doc.json";
import cors from "cors";
import { connectToDatabase } from './config/mongoDb';
import { attendanceRoutes } from "./modules/attendance/routes";
// import { memberApiRoutes } from "./modules/member/routes";
// import { clientApiRoutes } from "./modules/client/routes";

require('dotenv').config();

// process.on("uncaughtException", (err) => {
//     console.error("🔥 Uncaught Exception:", err);
// });

const app = express(),
    APP_PORT = process.env.PORT || process.env.APP_PORT,
    APP_HOST = process.env.APP_HOST;
app.set("port", APP_PORT);
app.set("host", APP_HOST);

app.use(fileUpload());
app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerDefination));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
//parse application/json
app.use(bodyParser.json());

// set path for public folder
app.use(express.static(Path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads/'));

//To allow multiple domain
var allowedDomains = process.env.CORS_ALLOW_DOMAIN;
allowedDomains = allowedDomains.split(',');
app.use(
    cors({
        origin: allowedDomains,
        credentials: true
    }) 
);

/**
 * router managment for different modules
 */
app.use("/user", userApiRoutes);
app.use("/user/admin", userApiRoutes);
app.use("/attendance", attendanceRoutes)


/*set error middleware*/
app.use(notFound); //return default error message not found

(async () => {
    try {
        await connectToDatabase();
        global.errorObj = { "status_code": 500, "message": "Internal server error" };

        if (process.env.NODE_ENV !== 'test') {
            app.listen(app.get("port"), () => {
                console.log(`Server listening at http://${app.get("host")}:${app.get("port")}`);
            });
        }
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message || error);
        process.exit(1); // Exit the process if the database connection fails
    }
})();

process.on('uncaughtException', ex => {
    logger.error("uncaughtException: ", ex.message)
    process.exit(1);
});

process.on('unhandledRejection', reason => {
    logger.error("unhandledRejection: " + reason)
    process.exit(1);
});

export default app;