import express from 'express'
import { createSlots, getAvailableSlots, getDoctorSlots, deleteSlot, createWeeklySlots } from '../controllers/slotController.js'
import authDoctor from '../middleware/authDoctor.js'

const slotRouter = express.Router()

// Doctor routes (require auth)
slotRouter.post('/create-slots', authDoctor, createSlots)
slotRouter.post('/create-weekly', authDoctor, createWeeklySlots)
slotRouter.get('/doctor-slots', authDoctor, getDoctorSlots)
slotRouter.post('/delete', authDoctor, deleteSlot)

// User/Public routes
slotRouter.post('/available', getAvailableSlots)

export default slotRouter
