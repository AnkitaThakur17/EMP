import { Router } from 'express';
import jwtVerifyToken from "../../../../middlewares/jwtVerifyToken"

const attendance = new Router()

//Import dependency container
const container = require('~/dependency');

// Resolve dependencies from container
const attendanceController = container.resolve("attendanceController");
const checkApiHeaders = container.resolve("checkApiHeaders");


/**
 * Route for punchIn
 */
attendance.post("/punchIn",checkApiHeaders, jwtVerifyToken,(req, res, next) =>{
    attendanceController.punchIn(req, res, next)
})

/**
 * Route for punchOut
 */
attendance.post("/punchOut",checkApiHeaders, jwtVerifyToken,(req, res, next) =>{
    attendanceController.punchOut(req, res, next)
})

export { attendance };