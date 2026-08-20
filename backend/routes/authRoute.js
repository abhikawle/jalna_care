import express from 'express'
import { resetPassword, sendOtp, verifyOtp } from '../controllers/authController.js'

const authRouter = express.Router()
authRouter.post('/send-otp', sendOtp)
authRouter.post('/verify-otp', verifyOtp)
authRouter.post('/reset-password', resetPassword)

export default authRouter
