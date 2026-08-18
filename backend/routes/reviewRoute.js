import express from 'express'
import { submitReview, getDoctorReviews, hasUserReviewed, deleteReview } from '../controllers/reviewController.js'
import authUser from '../middleware/authUser.js'

const reviewRouter = express.Router()

// User review endpoints (require auth)
reviewRouter.post('/submit', authUser, submitReview)
reviewRouter.post('/check', authUser, hasUserReviewed)

// Public endpoints
reviewRouter.post('/get-doctor-reviews', getDoctorReviews)

// Admin endpoints (will add admin auth later if needed)
reviewRouter.post('/delete', deleteReview)

export default reviewRouter
