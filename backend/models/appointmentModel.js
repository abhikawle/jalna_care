import mongoose from "mongoose"

const appointmentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    consultationType: { type: String, enum: ['in-clinic', 'video', 'same-day'], default: 'in-clinic' },
    isUrgent: { type: Boolean, default: false },
    userData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true },
    date: { type: Number, required: true },
    cancelled: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    hasReview: { type: Boolean, default: false },
    review: {
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String, default: '' },
        reviewedAt: { type: Date },
        moderationStatus: { type: String, enum: ['pending', 'approved', 'flagged'], default: 'approved' },
        moderationReason: { type: String, default: '' },
        moderatedBy: { type: String, default: '' },
        moderatedAt: { type: Date, default: null }
    }
})

const appointmentModel = mongoose.models.appointment || mongoose.model("appointment", appointmentSchema)
export default appointmentModel