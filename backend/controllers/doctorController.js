import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";

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

        const doctors = await doctorModel.find({}).select(['-password', '-email'])
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

        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
            if (item.isUrgent) {
                urgentAppointments++
            }
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

        let filter = { verificationStatus: 'verified' } // Only show verified providers by default

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
        if (verified !== undefined) {
            filter.isVerified = verified
        }

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
            .select('-password -email')
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