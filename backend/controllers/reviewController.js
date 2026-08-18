import doctorModel from "../models/doctorModel.js"
import appointmentModel from "../models/appointmentModel.js"

// API to submit or update a review for an appointment
const submitReview = async (req, res) => {
    try {
        const { appointmentId, docId, rating, comment } = req.body
        const userId = req.body.userId

        if (!appointmentId || !docId || !rating) {
            return res.json({ success: false, message: "Missing required fields" })
        }

        if (rating < 1 || rating > 5) {
            return res.json({ success: false, message: "Rating must be between 1 and 5" })
        }

        // Verify appointment exists and belongs to user
        const appointment = await appointmentModel.findById(appointmentId)
        if (!appointment) {
            return res.json({ success: false, message: "Appointment not found" })
        }

        if (appointment.userId !== userId) {
            return res.json({ success: false, message: "Not authorized to review this appointment" })
        }

        if (!appointment.isCompleted || appointment.cancelled) {
            return res.json({ success: false, message: "Can only review completed appointments" })
        }

        // Get doctor and user data for review
        const doctor = await doctorModel.findById(docId)
        if (!doctor) {
            return res.json({ success: false, message: "Doctor not found" })
        }

        const userName = appointment.userData?.name || "Anonymous"

        // Update or add review to appointment
        appointment.review = {
            rating,
            comment: comment || '',
            reviewedAt: new Date()
        }
        appointment.hasReview = true
        await appointment.save()

        // Check if review already exists for this appointment in doctor's reviews
        const existingReviewIndex = doctor.reviews.findIndex(
            r => r.userId === userId && r.appointmentId === appointmentId
        )

        if (existingReviewIndex > -1) {
            // Update existing review
            doctor.reviews[existingReviewIndex] = {
                userId,
                userName,
                appointmentId,
                rating,
                comment: comment || '',
                createdAt: new Date()
            }
        } else {
            // Add new review
            doctor.reviews.push({
                userId,
                userName,
                appointmentId,
                rating,
                comment: comment || '',
                createdAt: new Date()
            })
        }

        // Recalculate average rating
        const totalRating = doctor.reviews.reduce((sum, review) => sum + review.rating, 0)
        doctor.avgRating = Math.round((totalRating / doctor.reviews.length) * 10) / 10
        doctor.totalReviews = doctor.reviews.length

        await doctor.save()

        res.json({
            success: true,
            message: "Review submitted successfully",
            avgRating: doctor.avgRating,
            totalReviews: doctor.totalReviews
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get reviews for a doctor (for display on appointment page)
const getDoctorReviews = async (req, res) => {
    try {
        const { docId } = req.body

        if (!docId) {
            return res.json({ success: false, message: "Doctor ID required" })
        }

        const doctor = await doctorModel.findById(docId)
        if (!doctor) {
            return res.json({ success: false, message: "Doctor not found" })
        }

        // Sort reviews by most recent first
        const sortedReviews = doctor.reviews.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        )

        res.json({
            success: true,
            reviews: sortedReviews,
            avgRating: doctor.avgRating,
            totalReviews: doctor.totalReviews
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to check if user has reviewed an appointment
const hasUserReviewed = async (req, res) => {
    try {
        const { appointmentId } = req.body
        const userId = req.body.userId

        const appointment = await appointmentModel.findById(appointmentId)
        if (!appointment) {
            return res.json({ success: false, message: "Appointment not found" })
        }

        res.json({
            success: true,
            hasReview: appointment.hasReview,
            review: appointment.review || null
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to delete a review (admin/moderator only)
const deleteReview = async (req, res) => {
    try {
        const { docId, userId, appointmentId } = req.body

        if (!docId || !userId) {
            return res.json({ success: false, message: "Missing required fields" })
        }

        const doctor = await doctorModel.findById(docId)
        if (!doctor) {
            return res.json({ success: false, message: "Doctor not found" })
        }

        // Remove review from doctor's reviews
        const initialLength = doctor.reviews.length
        doctor.reviews = doctor.reviews.filter(
            r => !(r.userId === userId && (r.appointmentId === appointmentId || !appointmentId))
        )

        if (doctor.reviews.length === initialLength) {
            return res.json({ success: false, message: "Review not found" })
        }

        // Update appointment if appointment ID was provided
        if (appointmentId) {
            const appointment = await appointmentModel.findById(appointmentId)
            if (appointment) {
                appointment.hasReview = false
                appointment.review = null
                await appointment.save()
            }
        }

        // Recalculate average rating
        if (doctor.reviews.length > 0) {
            const totalRating = doctor.reviews.reduce((sum, review) => sum + review.rating, 0)
            doctor.avgRating = Math.round((totalRating / doctor.reviews.length) * 10) / 10
        } else {
            doctor.avgRating = 0
        }
        doctor.totalReviews = doctor.reviews.length

        await doctor.save()

        res.json({
            success: true,
            message: "Review deleted successfully",
            avgRating: doctor.avgRating,
            totalReviews: doctor.totalReviews
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { submitReview, getDoctorReviews, hasUserReviewed, deleteReview }
