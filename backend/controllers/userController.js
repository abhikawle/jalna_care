import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import crypto from "crypto";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { v2 as cloudinary } from 'cloudinary'
import stripe from "stripe";
import razorpay from 'razorpay';

// Gateway Initialize
const stripeInstance = process.env.STRIPE_SECRET_KEY
    ? new stripe(process.env.STRIPE_SECRET_KEY)
    : null;

const razorpayInstance = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
    ? new razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
    : null;

// API to register user
const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        // checking for all data to register user
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
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

        const userData = {
            name,
            email,
            password: hashedPassword,
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        console.log('=== REGISTER: Signing token ===')
        console.log('Secret:', process.env.JWT_SECRET)
        console.log('Secret length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
        console.log('Token created:', token)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to login user
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            console.log('=== LOGIN: Signing token ===')
            console.log('Secret:', process.env.JWT_SECRET)
            console.log('Secret length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0)
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            console.log('Token created:', token)
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user profile data
const getProfile = async (req, res) => {

    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update user profile
const updateProfile = async (req, res) => {

    try {

        const { userId, name, phone, address, dob, gender, taluka, village, language, notificationsEnabled } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender, taluka, village, language, notificationsEnabled })

        if (imageFile) {

            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageURL })
        }

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to book appointment 
const bookAppointment = async (req, res) => {

    try {

        const { userId, docId, slotDate, slotTime, consultationType = 'in-clinic', isUrgent = false, patientAddress = null } = req.body
        const docData = await doctorModel.findById(docId).select("-password")

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' })
        }

        // Validate consultation type matches provider capabilities
        if (consultationType !== 'in-clinic' && (!docData.consultationModes || !docData.consultationModes.includes(consultationType))) {
            return res.json({ success: false, message: 'This consultation type is not available' })
        }

        if (consultationType === 'home-visit' && !docData.homeVisitAvailable) {
            return res.json({ success: false, message: 'Home visits are not available with this provider' })
        }

        if (consultationType === 'home-visit' && (!patientAddress || !patientAddress.line1 || !patientAddress.taluka || !patientAddress.village)) {
            return res.json({ success: false, message: 'Patient address is required for a home visit' })
        }

        // Validate same-day is only booked if provider supports it
        if (isUrgent && !docData.sameDayAvailable) {
            return res.json({ success: false, message: 'Same-day appointments not available with this provider' })
        }

        let slots_booked = docData.slots_booked

        // checking for slot availablity 
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' })
            }
            else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select("-password")

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: consultationType === 'home-visit' ? docData.fees + (docData.homeVisitFee || 0) : docData.fees,
            slotTime,
            slotDate,
            consultationType,
            isUrgent,
            patientAddress: consultationType === 'home-visit' ? patientAddress : null,
            homeVisitFee: consultationType === 'home-visit' ? (docData.homeVisitFee || 0) : 0,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment Booked', appointmentId: newAppointment._id })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {

        const { userId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify appointment user 
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // releasing doctor slot 
        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {

        const { userId } = req.body
        const appointments = await appointmentModel.find({ userId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to make payment of appointment using razorpay
const paymentRazorpay = async (req, res) => {
    try {

        if (!razorpayInstance) {
            return res.json({ success: false, message: 'Razorpay is not configured' })
        }

        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        // creating options for razorpay payment
        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }

        // creation of an order
        const order = await razorpayInstance.orders.create(options)

        res.json({ success: true, order })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to verify payment of razorpay
const verifyRazorpay = async (req, res) => {
    try {
        if (!razorpayInstance) {
            return res.json({ success: false, message: 'Razorpay is not configured' })
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.json({ success: false, message: 'Invalid payment response' })
        }

        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex')

        const isValid = crypto.timingSafeEqual(
            Buffer.from(generatedSignature),
            Buffer.from(razorpay_signature)
        )

        if (!isValid) {
            return res.json({ success: false, message: 'Invalid signature' })
        }

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if (orderInfo && orderInfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
            return res.json({ success: true, message: 'Payment Successful' })
        }

        return res.json({ success: false, message: 'Payment Failed' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to make payment of appointment using Stripe
const paymentStripe = async (req, res) => {
    try {

        if (!stripeInstance) {
            return res.json({ success: false, message: 'Stripe is not configured' })
        }

        const { appointmentId } = req.body
        const { origin } = req.headers

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        const currency = process.env.CURRENCY.toLocaleLowerCase()

        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: "Appointment Fees"
                },
                unit_amount: appointmentData.amount * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&appointmentId=${appointmentData._id}`,
            cancel_url: `${origin}/verify?success=false&appointmentId=${appointmentData._id}`,
            line_items: line_items,
            mode: 'payment',
        })

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const verifyStripe = async (req, res) => {
    try {

        const { appointmentId, success } = req.body

        if (success === "true") {
            await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true })
            return res.json({ success: true, message: 'Payment Successful' })
        }

        res.json({ success: false, message: 'Payment Failed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to add patient review for a provider
const addReview = async (req, res) => {
    try {
        const { userId, docId, rating, comment } = req.body

        if (!userId || !docId || !rating) {
            return res.json({ success: false, message: 'Missing review details' })
        }

        const cleanRating = Number(rating)
        if (cleanRating < 1 || cleanRating > 5) {
            return res.json({ success: false, message: 'Rating must be between 1 and 5' })
        }

        const appointmentExists = await appointmentModel.findOne({
            userId,
            docId,
            $or: [{ payment: true }, { isCompleted: true }]
        })

        if (!appointmentExists) {
            return res.json({ success: false, message: 'You can only review a doctor after booking with them.' })
        }

        const doctor = await doctorModel.findById(docId)
        if (!doctor) {
            return res.json({ success: false, message: 'Provider not found' })
        }

        const userData = await userModel.findById(userId).select('-password')
        const reviewComment = comment ? comment.trim() : ''

        const existingReviewIndex = (doctor.reviews || []).findIndex(item => item.userId === userId)
        const newReview = {
            userId,
            userName: userData?.name || 'Patient',
            rating: cleanRating,
            comment: reviewComment,
            createdAt: new Date()
        }

        const existingReviews = doctor.reviews || []
        if (existingReviewIndex >= 0) {
            existingReviews[existingReviewIndex] = newReview
        } else {
            existingReviews.push(newReview)
        }

        const totalReviews = existingReviews.length
        const avgRating = totalReviews
            ? Number((existingReviews.reduce((sum, item) => sum + Number(item.rating), 0) / totalReviews).toFixed(1))
            : 0

        doctor.reviews = existingReviews
        doctor.avgRating = avgRating
        doctor.totalReviews = totalReviews
        await doctor.save()

        res.json({ success: true, message: 'Review submitted successfully', avgRating, totalReviews, review: newReview })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to fetch doctor review list
const getDoctorReviews = async (req, res) => {
    try {
        const { docId } = req.params
        const doctor = await doctorModel.findById(docId).select('reviews avgRating totalReviews name speciality')

        if (!doctor) {
            return res.json({ success: false, message: 'Provider not found' })
        }

        res.json({
            success: true,
            reviews: doctor.reviews || [],
            avgRating: doctor.avgRating || 0,
            totalReviews: doctor.totalReviews || 0,
            name: doctor.name,
            speciality: doctor.speciality
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    loginUser,
    registerUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    paymentRazorpay,
    verifyRazorpay,
    paymentStripe,
    verifyStripe,
    addReview,
    getDoctorReviews
}