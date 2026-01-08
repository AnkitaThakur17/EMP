import { commonServices } from "~/services/commonServices";
const commonServceObj = new commonServices();

class AdminController {
  constructor({ adminService, responseHandler }) {
    (this.adminService = adminService),
      (this.responseHandler = responseHandler);
  }

  //Handles Create Employee
  async createEmployee(req, res, next) {
    const returnData = await this.adminService.createEmployee(req.body, req.user);
    await this.responseHandler.handleServiceResponse(req, res, returnData);
  }

  //Handles Get Employees
  async getEmployees(req, res, next){
    const returnData = await this.adminService.getEmployees(req.query, req.user);
    await this.responseHandler.handleServiceResponse(req, res, returnData);
  }


  //Handles Get Employee
  async getEmployee(req, res, next){
  const returnData = await this.adminService.getEmployee(req.params, req.user);
  await this.responseHandler.handleServiceResponse(req, res, returnData)
}

//Handles update Employee
async updateEmployee(req, res, next){
  const returnData = await commonServceObj.updateEmployee(req.user, req.body, req.params)
  await this.responseHandler.handleServiceResponse(req, res, returnData)
}

}

module.exports = AdminController;
