import { asClass, asValue } from "awilix";

const userContainer = {
    // user auth module related classes
    authController: asClass(require('../modules/users/auth/controllers/authController')).singleton(),
    authService: asClass(require('../modules/users/auth/services/authService')).singleton(),
}

module.exports = {
    ...userContainer,
}
