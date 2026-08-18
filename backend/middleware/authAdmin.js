import jwt from "jsonwebtoken"

// admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {
        const atoken = req.headers.atoken || req.headers.aToken || req.headers['a-token']
        if (!atoken) {
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }

        const decoded = jwt.verify(atoken, process.env.JWT_SECRET)
        if (!decoded || decoded.email !== process.env.ADMIN_EMAIL) {
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }

        next()
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export default authAdmin;