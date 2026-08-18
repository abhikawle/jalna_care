import jwt from "jsonwebtoken"

const getAdminTokenFromRequest = (req) => {
    const authorization = req.headers.authorization || req.headers.Authorization
    const bearerToken = authorization && authorization.startsWith('Bearer ') ? authorization.slice(7) : null
    return req.headers.atoken || req.headers.aToken || req.headers['a-token'] || bearerToken
}

// admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {
        const atoken = getAdminTokenFromRequest(req)
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