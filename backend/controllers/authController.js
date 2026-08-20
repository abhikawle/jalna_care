import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'
import otpModel from '../models/otpModel.js'

const normalizePhone = (value = '') => {
    const digits = String(value).replace(/\D/g, '')
    if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
    return digits
}

const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone)
const hashOtp = (otp) => crypto.createHash('sha256').update(`${otp}:${process.env.OTP_HASH_SECRET || process.env.JWT_SECRET}`).digest('hex')

const sendSms = async (phone, otp) => {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
        if (process.env.NODE_ENV !== 'production') console.log(`OTP delivery is not configured for ${phone}`)
        return false
    }

    const body = new URLSearchParams({
        To: `+91${phone}`,
        From: TWILIO_PHONE_NUMBER,
        Body: `Your JalnaCare verification code is ${otp}. It expires in 5 minutes.`
    })
    const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body
    })
    if (!response.ok) throw new Error('Unable to send OTP')
    return true
}

const sendOtp = async (req, res) => {
    try {
        const phone = normalizePhone(req.body.phone)
        const purpose = req.body.purpose || 'login'
        if (!isValidPhone(phone)) return res.status(400).json({ success: false, message: 'Enter a valid Indian mobile number.' })
        if (!['login', 'register', 'forgot-password'].includes(purpose)) return res.status(400).json({ success: false, message: 'Invalid OTP purpose.' })

        const user = await userModel.findOne({ phone })
        if (purpose === 'login' && !user) return res.status(404).json({ success: false, message: 'No account found for this phone number.' })
        if (purpose === 'register' && user) return res.status(409).json({ success: false, message: 'This phone number is already registered.' })
        if (purpose === 'forgot-password' && !user) return res.status(404).json({ success: false, message: 'No account found for this phone number.' })

        const otp = String(crypto.randomInt(100000, 1000000))
        await otpModel.findOneAndUpdate(
            { phone, purpose },
            { otpHash: hashOtp(otp), expiresAt: new Date(Date.now() + 5 * 60 * 1000), attempts: 0 },
            { upsert: true, new: true }
        )
        const delivered = await sendSms(phone, otp)
        if (!delivered && process.env.NODE_ENV === 'production') return res.status(503).json({ success: false, message: 'OTP service is not configured.' })
        return res.json({ success: true, message: 'OTP sent successfully.' })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: error.message })
    }
}

const verifyOtp = async (req, res) => {
    try {
        const phone = normalizePhone(req.body.phone)
        const purpose = req.body.purpose || 'login'
        const otp = String(req.body.otp || '')
        const record = await otpModel.findOne({ phone, purpose })
        if (!record || record.expiresAt < new Date()) return res.status(400).json({ success: false, message: 'OTP expired. Request a new code.' })
        if (record.attempts >= 5) return res.status(429).json({ success: false, message: 'Too many attempts. Request a new code.' })
        if (!/^\d{6}$/.test(otp) || hashOtp(otp) !== record.otpHash) {
            await otpModel.updateOne({ _id: record._id }, { $inc: { attempts: 1 } })
            return res.status(400).json({ success: false, message: 'Invalid OTP.' })
        }
        await otpModel.deleteOne({ _id: record._id })

        if (purpose === 'register') {
            const { name } = req.body
            if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required.' })
            const password = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10)
            const user = await userModel.create({ name: name.trim(), phone, password })
            return res.json({ success: true, token: jwt.sign({ id: user._id }, process.env.JWT_SECRET) })
        }
        if (purpose === 'forgot-password') {
            return res.json({ success: true, resetToken: jwt.sign({ phone, purpose: 'password-reset' }, process.env.JWT_SECRET, { expiresIn: '10m' }) })
        }
        const user = await userModel.findOne({ phone })
        return res.json({ success: true, token: jwt.sign({ id: user._id }, process.env.JWT_SECRET) })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: error.message })
    }
}

const resetPassword = async (req, res) => {
    try {
        const decoded = jwt.verify(req.body.resetToken, process.env.JWT_SECRET)
        if (decoded.purpose !== 'password-reset' || !req.body.password || req.body.password.length < 8) return res.status(400).json({ success: false, message: 'Use a valid reset token and password of at least 8 characters.' })
        await userModel.findOneAndUpdate({ phone: decoded.phone }, { password: await bcrypt.hash(req.body.password, 10) })
        return res.json({ success: true, message: 'Password reset successfully.' })
    } catch (error) {
        return res.status(400).json({ success: false, message: 'Reset token expired. Start again.' })
    }
}

export { sendOtp, verifyOtp, resetPassword }
