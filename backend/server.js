import express from "express"
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"
import userRouter from "./routes/userRoute.js"
import doctorRouter from "./routes/doctorRoute.js"
import adminRouter from "./routes/adminRoute.js"
import slotRouter from "./routes/slotRoute.js"
import reviewRouter from "./routes/reviewRoute.js"
import moderationRouter from "./routes/moderationRoute.js"

// app config
const app = express()
const port = process.env.PORT || 4000
// Log JWT_SECRET for debugging (only in development)
if (process.env.NODE_ENV !== 'production') {
  console.log('=== SERVER STARTUP ===')
  console.log('JWT_SECRET:', process.env.JWT_SECRET)
  console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0)
}
connectDB()
connectCloudinary()

// middlewares
app.use(express.json())

// CORS configuration for development and production
const parseAllowedOrigins = () => {
  const envOrigins = process.env.ALLOWED_ORIGINS
  if (envOrigins) {
    return envOrigins.split(',').map((origin) => origin.trim()).filter(Boolean)
  }

  if (process.env.NODE_ENV === 'production') {
    return [
      'https://your-frontend-url.vercel.app',
      'https://your-admin-url.vercel.app'
    ]
  }

  return ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5176', 'http://localhost:4173']
}

app.use(cors({
  origin: parseAllowedOrigins(),
  credentials: true
}))

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)
app.use("/api/doctor", doctorRouter)
app.use("/api/slot", slotRouter)
app.use("/api/review", reviewRouter)
app.use("/api/moderation", moderationRouter)

app.get("/", (req, res) => {
  res.send("API Working")
});

if (!process.env.VERCEL && !process.env.NETLIFY) {
  const maxAttempts = 10

  function tryListen(p, attemptsLeft) {
    const server = app.listen(p, () => console.log(`Server started on PORT:${p}`))

    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        if (attemptsLeft > 0) {
          console.warn(`Port ${p} is in use, trying port ${p + 1} (${attemptsLeft} attempts left)`)
          tryListen(p + 1, attemptsLeft - 1)
        } else {
          console.error(`All attempts failed. Port ${port} and the next ${maxAttempts} ports are in use.`)
          process.exit(1)
        }
      } else {
        console.error('Server error:', err)
        process.exit(1)
      }
    })
  }

  tryListen(Number(port), maxAttempts)
}

export default app
