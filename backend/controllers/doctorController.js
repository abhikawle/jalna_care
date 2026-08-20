import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";

const jalnaVillages = {
    Jalna: ['Jalna', 'Kharpudi', 'Mhaismal', 'Rajur', 'Wadigodri'],
    Ambad: ['Ambad', 'Dhangar Pimpalgaon', 'Gondi', 'Sukhapuri', 'Yeota'],
    Bhokardan: ['Bhokardan', 'Dhanora', 'Hasnabad', 'Jamkhed', 'Rajur'],
    Badnapur: ['Badnapur', 'Chikhli', 'Dabhadi', 'Kadegaon', 'Wadgaon'],
    Ghansawangi: ['Ghansawangi', 'Ambadgaon', 'Jamb Samarth', 'Kumbhar Pimpalgaon', 'Ranjani'],
    Jafrabad: ['Jafrabad', 'Ashti', 'Bhendala', 'Kumbhari', 'Tembhurni'],
    Mantha: ['Mantha', 'Kansawangi', 'Khatkheda', 'Pangri', 'Tandulwadi'],
    Partur: ['Partur', 'Ashti', 'Dhamangaon', 'Mandwa', 'Sultanwadi']
}

const parseObject = (value, fieldName) => {
    if (typeof value === 'object' && value !== null) return value
    try {
        return JSON.parse(value)
    } catch {
        const error = new Error(`Invalid ${fieldName}`)
        error.statusCode = 400
        throw error
    }
}

// Public provider application. Verification fields are deliberately not read from the request.
const registerDoctor = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phoneNumber, speciality, degree, experience, about, fees, clinicName, providerType, sameDayAvailable, homeVisitAvailable, homeVisitFee, serviceRadius, taluka, village } = req.body
        const imageFile = req.file

        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !clinicName || !phoneNumber || !req.body.address || !imageFile) {
            return res.status(400).json({ success: false, message: 'Please complete all required registration fields.' })
        }
        if (!validator.isEmail(email.trim())) {
            return res.status(400).json({ success: false, message: 'Please enter a valid email.' })
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' })
        }
        if (confirmPassword !== undefined && password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match.' })
        }
        if (!validator.isMobilePhone(phoneNumber.trim(), 'en-IN')) {
            return res.status(400).json({ success: false, message: 'Please enter a valid phone number.' })
        }
        if (!Number.isFinite(Number(fees)) || Number(fees) <= 0) {
            return res.status(400).json({ success: false, message: 'Consultation fees must be a valid amount.' })
        }
        if (!/^\d+(?:\s+years?)?$/i.test(String(experience).trim())) {
            return res.status(400).json({ success: false, message: 'Experience must be a valid number of years.' })
        }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(imageFile.mimetype) || imageFile.size > 5 * 1024 * 1024) {
            return res.status(400).json({ success: false, message: 'Profile image must be JPG, PNG, or WebP and under 5 MB.' })
        }

        const existingDoctor = await doctorModel.findOne({ email: email.trim().toLowerCase() })
        if (existingDoctor) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists.' })
        }

        const address = parseObject(req.body.address, 'address')
        const clinicAddress = req.body.clinicAddress ? parseObject(req.body.clinicAddress, 'clinic address') : address
        const allowedModes = ['in-clinic', 'video', 'home-visit', 'same-day']
        const consultationModes = (Array.isArray(req.body.consultationModes) ? req.body.consultationModes : [req.body.consultationModes])
            .filter((mode) => allowedModes.includes(mode))
        if (!address.line1 || address.state !== 'Maharashtra' || address.city !== 'Jalna' || !jalnaVillages[taluka]?.includes(village) || !address.zipcode || !consultationModes.length) {
            return res.status(400).json({ success: false, message: 'Please provide a complete address and consultation mode.' })
        }

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
        const hashedPassword = await bcrypt.hash(password, 10)
        const newDoctor = new doctorModel({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            image: imageUpload.secure_url,
            speciality: speciality.trim(),
            degree: degree.trim(),
            experience: String(experience).trim(),
            about: about.trim(),
            fees: Number(fees),
            address,
            clinicName: clinicName.trim(),
            clinicAddress,
            phoneNumber: phoneNumber.trim(),
            providerType: ['individual', 'clinic'].includes(providerType) ? providerType : 'individual',
            consultationModes,
            homeVisitAvailable: homeVisitAvailable === true || homeVisitAvailable === 'true',
            homeVisitFee: Number(homeVisitFee) || 0,
            serviceRadius: Number(serviceRadius) || 0,
            sameDayAvailable: sameDayAvailable === true || sameDayAvailable === 'true',
            verificationStatus: 'pending',
            isVerified: false,
            verificationDate: null,
            rejectionReason: '',
            available: true,
            slots_booked: {},
            reviews: [],
            avgRating: 0,
            totalReviews: 0,
            date: Date.now()
        })
        await newDoctor.save()

        return res.status(201).json({ success: true, message: 'Doctor registration submitted successfully. Waiting for admin verification.' })
    } catch (error) {
        console.log(error)
        return res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Unable to submit doctor registration.' })
    }
}

// API for doctor Login 
const loginDoctor = async (req, res) => {

    try {

        const { email, password } = req.body
        const user = await doctorModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
    try {

        const { docId } = req.body
        const appointments = await appointmentModel.find({ docId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
    try {

        const { docId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
            return res.json({ success: true, message: 'Appointment Cancelled' })
        }

        res.json({ success: false, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
    try {

        const { docId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })
            return res.json({ success: true, message: 'Appointment Completed' })
        }

        res.json({ success: false, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to get all doctors list for Frontend
const doctorList = async (req, res) => {
    try {

        const doctors = await doctorModel.find({ verificationStatus: 'verified', isVerified: true }).select(['-password', '-email', '-phoneNumber', '-clinicAddress', '-address.line1', '-address.line2', '-address.state', '-address.zipcode'])
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to change doctor availablity for Admin and Doctor Panel
const changeAvailablity = async (req, res) => {
    try {

        const { docId } = req.body

        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
        res.json({ success: true, message: 'Availablity Changed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get doctor profile for  Doctor Panel
const doctorProfile = async (req, res) => {
    try {

        const { docId } = req.body
        const profileData = await doctorModel.findById(docId).select('-password')

        res.json({ success: true, profileData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update doctor profile data from  Doctor Panel
const updateDoctorProfile = async (req, res) => {
    try {

        const { docId, fees, address, available, about, clinicName, clinicAddress, consultationModes, sameDayAvailable } = req.body

        const updateData = { fees, address, available, about }
        
        // Update clinic info if provided
        if (clinicName) updateData.clinicName = clinicName
        if (clinicAddress) updateData.clinicAddress = clinicAddress
        
        // Update consultation modes if provided
        if (consultationModes && Array.isArray(consultationModes)) {
            updateData.consultationModes = consultationModes
        }
        
        // Update same-day availability if provided
        if (sameDayAvailable !== undefined) {
            updateData.sameDayAvailable = sameDayAvailable
        }

        await doctorModel.findByIdAndUpdate(docId, updateData)

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
    try {

        const { docId } = req.body

        const appointments = await appointmentModel.find({ docId })
        const docData = await doctorModel.findById(docId)

        let earnings = 0
        let sameDayAppointments = 0
        let videoAppointments = 0
        let inClinicAppointments = 0
        let urgentAppointments = 0
        let homeVisitAppointments = 0
        const today = new Date()
        const todaySlotDate = `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`
        const todaysPatients = new Set()

        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
            if (item.isUrgent) {
                urgentAppointments++
            }
            if (item.consultationType === 'home-visit') homeVisitAppointments++
            if (item.slotDate === todaySlotDate && !item.cancelled) todaysPatients.add(item.userId)
            if (item.consultationType === 'same-day') {
                sameDayAppointments++
            } else if (item.consultationType === 'video') {
                videoAppointments++
            } else if (item.consultationType === 'in-clinic') {
                inClinicAppointments++
            }
        })

        let patients = []

        appointments.map((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })



        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse(),
            sameDayAppointments,
            videoAppointments,
            inClinicAppointments,
            urgentAppointments,
            homeVisitAppointments,
            todaysPatients: todaysPatients.size,
            consultationModes: docData.consultationModes || ['in-clinic'],
            sameDayAvailable: docData.sameDayAvailable || false,
            avgRating: docData.avgRating || 0
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to search and filter providers (JalnaCare discovery feature)
const searchProviders = async (req, res) => {
    try {

        const { query, speciality, verified, sortBy, page = 1, limit = 10 } = req.body

        let filter = { verificationStatus: 'verified', isVerified: true } // Only show verified providers by default

        // Search by name or clinic name
        if (query) {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { clinicName: { $regex: query, $options: 'i' } },
                { about: { $regex: query, $options: 'i' } }
            ]
        }

        // Filter by speciality
        if (speciality) {
            filter.speciality = { $regex: speciality, $options: 'i' }
        }

        // Filter by verification if explicitly requested
        filter.isVerified = true

        if (req.body.homeVisitOnly) filter.homeVisitAvailable = true

        // Determine sort order
        let sortObj = { avgRating: -1, date: -1 } // Default: by rating, then newest
        if (sortBy === 'fee-low') {
            sortObj = { fees: 1 }
        } else if (sortBy === 'fee-high') {
            sortObj = { fees: -1 }
        } else if (sortBy === 'experience') {
            sortObj = { experience: -1 }
        }

        const skip = (page - 1) * limit
        const providers = await doctorModel.find(filter)
            .select('-password -email -phoneNumber -clinicAddress -address.line1 -address.line2 -address.state -address.zipcode')
            .sort(sortObj)
            .skip(skip)
            .limit(limit)

        const totalCount = await doctorModel.countDocuments(filter)

        res.json({
            success: true,
            providers,
            pagination: {
                page,
                limit,
                total: totalCount,
                pages: Math.ceil(totalCount / limit)
            }
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    registerDoctor,
    loginDoctor,
    appointmentsDoctor,
    appointmentCancel,
    doctorList,
    changeAvailablity,
    appointmentComplete,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile,
    searchProviders
}