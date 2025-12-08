import { Router } from "express";
import { userAuth } from "../auth/routes";
import { admin } from "../../admin/routes/index"
// import { attendance } from "../../../modules/attendance/routes/index";

const userApiRoutes = new Router();
userApiRoutes.use("/", userAuth);
userApiRoutes.use("/", admin);

export { userApiRoutes };