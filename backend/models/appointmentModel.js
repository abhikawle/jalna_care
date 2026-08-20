import mongoose from "mongoose"

const appointmentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    consultationType: { type: String, enum: ['in-clinic', 'video', 'home-visit', 'same-day'], default: 'in-clinic' },
    patientAddress: { type: Object, default: null },
    homeVisitFee: { type: Number, default: 0 },
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