import { Router } from "express";
import { authCheck } from "../../../middlewares/index.js";
import authController from "../../../controllers/shared/auth.controller.js";

const router = Router();

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post("/google", authController.continueWithGoogle);
router.get("/me", authCheck, authController.getMyDetails);
router.post("/refresh", authCheck, authController.refreshToken);

export default router;
