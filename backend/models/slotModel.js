import mongoose from "mongoose"

const slotSchema = new mongoose.Schema({
    docId: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    consultationType: { type: String, enum: ['in-clinic', 'video', 'same-day'], default: 'in-clinic' },
    isBooked: { type: Boolean, default: false },
    bookedBy: { type: String, default: null },
    createdAt: { type: Number, required: true },
    updatedAt: { type: Number, default: Date.now }
})

// Compound index to prevent duplicate slots
slotSchema.index({ docId: 1, date: 1, time: 1, consultationType: 1 }, { unique: true })

const slotModel = mongoose.models.slot || mongoose.model("slot", slotSchema)
export default slotModel
