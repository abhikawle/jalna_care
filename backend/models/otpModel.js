import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema({
    channel: { type: String, enum: ['phone', 'email'], required: true },
    identifier: { type: String, required: true, index: true },
    purpose: { type: String, enum: ['login', 'register', 'forgot-password'], required: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    attempts: { type: Number, default: 0 }
}, { timestamps: true })

otpSchema.index({ identifier: 1, purpose: 1 }, { unique: true })

const otpModel = mongoose.models.otp || mongoose.model('otp', otpSchema)
export default otpModel
