class AuthController {
    constructor({ authService, responseHandler }) {
        this.authService = authService;
        this.responseHandler = responseHandler;
    }

    // Handles login
    async login(req, res, next) {
        const returnData = await this.authService.login(req.body, req.headers);
        await this.responseHandler.handleServiceResponse(req, res, returnData);

    }

    //Handles logout
    async logout(req, res, next){
        const returnData = await this.authService.logout(req.body, req.user);
        await this.responseHandler.handleServiceResponse(req, res, returnData)
    }
}

module.exports = AuthController;