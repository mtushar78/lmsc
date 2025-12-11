const express = require('express')
const cors = require('cors')
require('dotenv').config()
const usersRouter = require('./routes/users')
const lessonsRouter = require('./routes/lessons')
const teacherRouter = require('./routes/teacher')
const app = express()

// Tighten CORS: allow frontend origin from env in production, default to localhost:3000
const frontendOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000'
app.use(cors({ origin: frontendOrigin }))
app.use(express.json())

// Basic health endpoint for readiness checks
app.get('/health', (req, res) => {
	res.json({ ok: true, uptime: process.uptime() })
})

app.use('/api/users', usersRouter)
app.use('/api/lessons', lessonsRouter)
app.use('/api/teacher', teacherRouter)

module.exports = app
