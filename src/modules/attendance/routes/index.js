import { Router } from "express";
import { attendance } from "../content/routes";


const attendanceRoutes = new Router()
attendanceRoutes.use("/",attendance)

export{ attendanceRoutes }