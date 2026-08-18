import jwt from 'jsonwebtoken'

// user authentication middleware
const authUser = async (req, res, next) => {
    const token = req.headers.token || req.headers.Token || req.headers['x-auth-token']
    if (!token) {
        return res.json({ success: false, message: 'Not Authorized Login Again' })
    }
    try {
        console.log('=== VERIFY: Verifying token ===')
        console.log('Secret:', process.env.JWT_SECRET)
        console.log('Secret length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0)
        console.log('Token:', token)
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        req.body.userId = token_decode.id
        next()
    } catch (error) {
        console.log('Token verification error:', error.message)
        res.json({ success: false, message: error.message })
    }
}

export default authUser;