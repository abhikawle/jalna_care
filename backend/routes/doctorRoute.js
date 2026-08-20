import express from 'express';
import { registerDoctor, loginDoctor, appointmentsDoctor, appointmentCancel, doctorList, changeAvailablity, appointmentComplete, doctorDashboard, doctorProfile, updateDoctorProfile, searchProviders } from '../controllers/doctorController.js';
import authDoctor from '../middleware/authDoctor.js';
import upload from '../middleware/multer.js';
const doctorRouter = express.Router();

doctorRouter.post("/register", upload.single('image'), registerDoctor)
doctorRouter.post("/login", loginDoctor)
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel)
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor)
doctorRouter.get("/list", doctorList)
doctorRouter.post("/change-availability", authDoctor, changeAvailablity)
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete)
doctorRouter.get("/dashboard", authDoctor, doctorDashboard)
doctorRouter.get("/profile", authDoctor, doctorProfile)
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile)

// JalnaCare provider discovery
doctorRouter.post("/search", searchProviders)

export default doctorRouter;