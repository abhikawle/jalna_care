import appointmentModel from "../models/appointmentModel.js"
import doctorModel from "../models/doctorModel.js"

// Get all pending reviews across all doctors
const getPendingReviews = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({
            hasReview: true,
            'review.moderationStatus': 'pending'
        }).sort({ 'review.reviewedAt': -1 })

        const pendingReviews = appointments.map(apt => ({
            appointmentId: apt._id,
            docId: apt.docId,
            docName: apt.docData?.name || 'Unknown Doctor',
            userName: apt.review.comment ? apt.userData?.name || 'Anonymous' : 'Anonymous',
            rating: apt.review.rating,
            comment: apt.review.comment,
            reviewedAt: apt.review.reviewedAt,
            moderationStatus: apt.review.moderationStatus
        }))

        res.json({ success: true, reviews: pendingReviews, count: pendingReviews.length })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Get all flagged reviews
const getFlaggedReviews = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({
            hasReview: true,
            'review.moderationStatus': 'flagged'
        }).sort({ 'review.moderatedAt': -1 })

        const flaggedReviews = appointments.map(apt => ({
            appointmentId: apt._id,
            docId: apt.docId,
            docName: apt.docData?.name || 'Unknown Doctor',
            userName: apt.userData?.name || 'Anonymous',
            rating: apt.review.rating,
            comment: apt.review.comment,
            reviewedAt: apt.review.reviewedAt,
            moderationStatus: apt.review.moderationStatus,
            moderationReason: apt.review.moderationReason,
            moderatedAt: apt.review.moderatedAt,
            moderatedBy: apt.review.moderatedBy
        }))

        res.json({ success: true, reviews: flaggedReviews, count: flaggedReviews.length })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Approve a review
const approveReview = async (req, res) => {
    try {
        const { appointmentId, adminId } = req.body

        if (!appointmentId || !adminId) {
            return res.json({ success: false, message: 'Missing required fields' })
        }

        const appointment = await appointmentModel.findById(appointmentId)
        if (!appointment || !appointment.hasReview) {
            return res.json({ success: false, message: 'Appointment or review not found' })
        }

        // Update appointment review status
        appointment.review.moderationStatus = 'approved'
        appointment.review.moderatedBy = adminId
        appointment.review.moderatedAt = new Date()
        await appointment.save()

        // Update doctor's review in reviews array
        const doctor = await doctorModel.findById(appointment.docId)
        if (doctor) {
            const reviewIndex = doctor.reviews.findIndex(r => 
                r.userId === appointment.userId && 
                r.createdAt.getTime() === appointment.review.reviewedAt.getTime()
            )
            if (reviewIndex !== -1) {
                doctor.reviews[reviewIndex].moderationStatus = 'approved'
                doctor.reviews[reviewIndex].moderatedBy = adminId
                doctor.reviews[reviewIndex].moderatedAt = new Date()
                await doctor.save()
            }
        }

        res.json({ success: true, message: 'Review approved successfully' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Flag a review as inappropriate
const flagReview = async (req, res) => {
    try {
        const { appointmentId, reason, adminId } = req.body

        if (!appointmentId || !reason || !adminId) {
            return res.json({ success: false, message: 'Missing required fields' })
        }

        const appointment = await appointmentModel.findById(appointmentId)
        if (!appointment || !appointment.hasReview) {
            return res.json({ success: false, message: 'Appointment or review not found' })
        }

        // Update appointment review status
        appointment.review.moderationStatus = 'flagged'
        appointment.review.moderationReason = reason
        appointment.review.moderatedBy = adminId
        appointment.review.moderatedAt = new Date()
        await appointment.save()

        // Update doctor's review in reviews array
        const doctor = await doctorModel.findById(appointment.docId)
        if (doctor) {
            const reviewIndex = doctor.reviews.findIndex(r => 
                r.userId === appointment.userId && 
                r.createdAt.getTime() === appointment.review.reviewedAt.getTime()
            )
            if (reviewIndex !== -1) {
                doctor.reviews[reviewIndex].moderationStatus = 'flagged'
                doctor.reviews[reviewIndex].moderationReason = reason
                doctor.reviews[reviewIndex].moderatedBy = adminId
                doctor.reviews[reviewIndex].moderatedAt = new Date()
                await doctor.save()
            }
        }

        res.json({ success: true, message: 'Review flagged successfully' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Delete a flagged review
const deleteFlaggedReview = async (req, res) => {
    try {
        const { appointmentId, adminId } = req.body

        if (!appointmentId || !adminId) {
            return res.json({ success: false, message: 'Missing required fields' })
        }

        const appointment = await appointmentModel.findById(appointmentId)
        if (!appointment || !appointment.hasReview) {
            return res.json({ success: false, message: 'Appointment or review not found' })
        }

        if (appointment.review.moderationStatus !== 'flagged') {
            return res.json({ success: false, message: 'Only flagged reviews can be deleted' })
        }

        // Remove review from appointment
        appointment.hasReview = false
        appointment.review = {}
        await appointment.save()

        // Remove review from doctor's reviews array
        const doctor = await doctorModel.findById(appointment.docId)
        if (doctor) {
            const reviewIndex = doctor.reviews.findIndex(r => 
                r.userId === appointment.userId && 
                r.createdAt.getTime() === appointment.review.reviewedAt.getTime()
            )
            if (reviewIndex !== -1) {
                doctor.reviews.splice(reviewIndex, 1)
                
                // Recalculate avgRating and totalReviews
                const totalRating = doctor.reviews.reduce((sum, review) => sum + review.rating, 0)
                doctor.avgRating = doctor.reviews.length > 0 ? Math.round((totalRating / doctor.reviews.length) * 10) / 10 : 0
                doctor.totalReviews = doctor.reviews.length
                await doctor.save()
            }
        }

        res.json({ success: true, message: 'Flagged review deleted successfully' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { getPendingReviews, getFlaggedReviews, approveReview, flagReview, deleteFlaggedReview }
