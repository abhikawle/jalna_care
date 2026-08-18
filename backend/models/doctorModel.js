import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    available: { type: Boolean, default: true },
    fees: { type: Number, required: true },
    slots_booked: { type: Object, default: {} },
    address: { type: Object, required: true },
    date: { type: Number, required: true },
    
    // JalnaCare verification and trust fields
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected', 'suspended'], default: 'pending' },
    clinicName: { type: String, default: '' },
    clinicLicenseNumber: { type: String, default: '' },
    clinicAddress: { type: Object, default: { line1: '', line2: '', city: '', state: '', zipcode: '' } },
    phoneNumber: { type: String, default: '' },
    providerType: { type: String, enum: ['individual', 'clinic', 'hospital'], default: 'individual' },
    consultationModes: { type: [String], default: ['in-clinic'] },
    sameDayAvailable: { type: Boolean, default: false },
    
    // Ratings and reviews summary
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    reviews: [{
        userId: { type: String, required: true },
        userName: { type: String, default: '' },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now },
        moderationStatus: { type: String, enum: ['pending', 'approved', 'flagged'], default: 'approved' },
        moderationReason: { type: String, default: '' },
        moderatedBy: { type: String, default: '' },
        moderatedAt: { type: Date, default: null }
    }],
    
    // Trust signals for JalnaCare
    isVerified: { type: Boolean, default: false },
    verificationDate: { type: Date, default: null },
    rejectionReason: { type: String, default: '' },
}, { minimize: false })

const doctorModel = mongoose.models.doctor || mongoose.model("doctor", doctorSchema);
export default doctorModel;