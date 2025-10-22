import { Router } from "express";
import { authCheck } from "../../../middlewares/index.js";
import authController from "../../../controllers/shared/auth.controller.js";

const router = Router();

router.get("/me", authCheck, authController.getMyDetails);

export default router;


