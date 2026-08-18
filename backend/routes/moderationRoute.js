import express from "express"
import { getPendingReviews, getFlaggedReviews, approveReview, flagReview, deleteFlaggedReview } from "../controllers/moderationController.js"
import authAdmin from "../middleware/authAdmin.js"

const moderationRouter = express.Router()

moderationRouter.get("/pending-reviews", getPendingReviews)
moderationRouter.get("/flagged-reviews", getFlaggedReviews)
moderationRouter.post("/approve", authAdmin, approveReview)
moderationRouter.post("/flag", authAdmin, flagReview)
moderationRouter.post("/delete-flagged", authAdmin, deleteFlaggedReview)

export default moderationRouter
