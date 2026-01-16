import { Router } from "express";
import { loginValidator } from "../../../validators/loginValidator";
import jwtVerifyToken from "../../../middlewares/jwtVerifyToken"

const admin = new Router()

// Import the dependency container
const container = require('~/dependency');

// Resolve dependencies from container
const adminController = container.resolve("adminController");
const checkApiHeaders = container.resolve("checkApiHeaders");


/**
 * Route for create employee
 */
admin.post("/createEmployee", checkApiHeaders, loginValidator, jwtVerifyToken,(req, res, next) =>{
    adminController.createEmployee(req, res, next)
})

/**
 * Route for get employees
 */
admin.get("/getEmployees", checkApiHeaders, jwtVerifyToken, (req, res, next)=>{
    adminController.getEmployees(req, res, next)
})

/**
 * Route for get employee
 */
admin.get("/getEmployee/:userId",checkApiHeaders, jwtVerifyToken, (req, res, next)=>{
    adminController.getEmployee(req, res, next)
})

/**
 * Route for update employee record
 */
admin.put("/updateEmployee/:userId", checkApiHeaders, jwtVerifyToken, (req, res, next)=> 
    adminController.updateEmployee(req, res, next))


export { admin } 