import { Router } from "express";
import { authCheck, checkRole } from "../../../middlewares/index.js";
import adminController from "../../../controllers/admin.controller.js";

const router = Router();

// All admin routes require authentication and admin role
router.use(authCheck);
router.use(checkRole("admin"));

// Dashboard route
router.get("/dashboard", adminController.getDashboardData);

// Student management routes
router.get("/students", adminController.getAllStudents);
router.get("/students/:studentId", adminController.getStudentById);
router.post("/students", adminController.createStudent);
router.put("/students/:studentId", adminController.updateStudent);
router.patch("/students/:studentId/status", adminController.toggleStudentStatus);
router.delete("/students/:studentId", adminController.deleteStudent);

// Supervisor management routes
router.get("/supervisors", adminController.getAllSupervisors);
router.get("/supervisors/:supervisorId", adminController.getSupervisorById);
router.post("/supervisors", adminController.createSupervisor);
router.put("/supervisors/:supervisorId", adminController.updateSupervisor);
router.patch("/supervisors/:supervisorId/status", adminController.toggleSupervisorStatus);
router.delete("/supervisors/:supervisorId", adminController.deleteSupervisor);

export default router;

