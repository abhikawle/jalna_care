import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/userModel.js";

// API for admin login
const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            console.log('=== ADMIN LOGIN: Signing token ===')
            console.log('Secret:', process.env.JWT_SECRET)
            console.log('Secret length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0)
            const token = jwt.sign({ email: process.env.ADMIN_EMAIL }, process.env.JWT_SECRET, { expiresIn: '8h' })
            console.log('Token created:', token)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}


// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {

        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API for appointment cancellation
const appointmentCancel = async (req, res) => {
    try {

        const { appointmentId } = req.body
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API for adding Doctor
const addDoctor = async (req, res) => {

    try {

        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body
        const imageFile = req.file

        // checking for all data to add doctor
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing Details" })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
        const imageUrl = imageUpload.secure_url

        const parsedAddress = typeof address === 'string' ? JSON.parse(address) : address

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: parsedAddress,
            clinicName: name,
            clinicAddress: parsedAddress,
            providerType: 'individual',
            verificationStatus: 'pending',
            isVerified: false,
            date: Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()
        res.json({ success: true, message: 'Doctor Added' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {

        const doctors = await doctorModel.find({}).select('-password')
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {

        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse()
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update provider verification status (JalnaCare feature)
const updateProviderVerification = async (req, res) => {
    try {

        const { docId, verificationStatus, rejectionReason } = req.body

        if (!docId || !verificationStatus) {
            return res.json({ success: false, message: "Missing Details" })
        }

        const validStatuses = ['pending', 'verified', 'rejected', 'suspended']
        if (!validStatuses.includes(verificationStatus)) {
            return res.json({ success: false, message: "Invalid verification status" })
        }

        const updateData = {
            verificationStatus,
            isVerified: verificationStatus === 'verified' ? true : false,
        }

        if (verificationStatus === 'verified') {
            updateData.verificationDate = new Date()
        }

        if (verificationStatus === 'rejected' && rejectionReason) {
            updateData.rejectionReason = rejectionReason
        }

        await doctorModel.findByIdAndUpdate(docId, updateData)
        res.json({ success: true, message: 'Provider verification status updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get pending provider applications
const getPendingProviders = async (req, res) => {
    try {

        const pendingDoctors = await doctorModel.find({ verificationStatus: 'pending' }).select('-password')
        res.json({ success: true, providers: pendingDoctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    loginAdmin,
    appointmentsAdmin,
    appointmentCancel,
    addDoctor,
    allDoctors,
    adminDashboard,
    updateProviderVerification,
    getPendingProviders
}