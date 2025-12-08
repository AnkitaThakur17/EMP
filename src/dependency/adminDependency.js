import { asClass } from "awilix";


const adminContainer ={
   // admin module related dependencies
   adminController: asClass(require('../modules/admin/controllers/adminController')).singleton(),
   adminService: asClass(require('../modules/admin/services/adminService')).singleton()
}
module.exports = {
   ...adminContainer,
}