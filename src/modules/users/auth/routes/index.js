import { Router } from "express";
import { loginValidator } from "~/validators/loginValidator";
import jwtVerifyToken from "../../../../middlewares/jwtVerifyToken"
// import { forgotPasswordValidator } from "~/validators/forgotPasswordValidator";
// import { resetPasswordValidator } from "~/validators/resetPasswordValidator";

// Create a Router instance for user authentication routes
const userAuth = new Router();

// Import the dependency container
const container = require('~/dependency');

// Resolve dependencies from the container
const authController = container.resolve("authController");
const checkApiHeaders = container.resolve("checkApiHeaders");

/**
 * Route for user login
 */
userAuth.post('/login', checkApiHeaders, loginValidator, (req, res, next) => {
    authController.login(req, res, next);
});

/**
 * Route for user logout
 */
userAuth.post('/logout', checkApiHeaders, jwtVerifyToken,(req, res, next)=>{
    authController.logout(req, res, next);
})



// /**
//  * Route for forgot password
//  */
// adminAuth.post('/forgotPassword', checkApiHeaders, forgotPasswordValidator, (req, res, next) => {
//     authController.forgotPassword(req, res, next);
// });

// /**
//  * Route for reset password
//  */
// adminAuth.put('/resetPassword', checkApiHeaders, resetPasswordValidator, (req, res, next) => {
//     authController.resetPassword(req, res, next);
// });

export { userAuth };