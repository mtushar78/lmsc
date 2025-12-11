/**
 * Authentication middleware and utilities
 * Provides JWT token generation, validation, and role-based access control
 */
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production'
const TOKEN_EXPIRY = '7d'

/**
 * Generate JWT token for user
 * @param {number} userId - User ID
 * @param {string} role - User role: 'student', 'teacher', or 'admin'
 * @returns {string} JWT token
 */
function generateToken(userId, role) {
  if (!userId || !role) {
    throw new Error('userId and role are required')
  }

  if (!['student', 'teacher', 'admin'].includes(role)) {
    throw new Error('Invalid role: must be student, teacher, or admin')
  }

  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY, algorithm: 'HS256' }
  )
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error(`Invalid token: ${error.message}`)
  }
}

/**
 * Middleware to authenticate requests
 * Extracts token from Authorization header and validates it
 */
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' })
    }

    const token = authHeader.slice(7) // Remove "Bearer " prefix
    const decoded = verifyToken(token)

    // Attach user info to request for use in controllers
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
}

/**
 * Middleware to check if user has required role(s)
 * @param {...string} allowedRoles - Roles that are permitted
 * @returns {function} Express middleware
 */
function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: requires one of roles: ${allowedRoles.join(', ')}`,
      })
    }

    next()
  }
}

/**
 * Middleware to validate that user is accessing their own data
 * For students: check student_id matches user ID
 * For teachers: check teacher_id matches user ID
 */
function ownershipMiddleware(req, res, next) {
  const { user } = req
  const { student_id, teacher_id } = req.body || req.query || {}

  if (user.role === 'student' && student_id && parseInt(student_id) !== user.userId) {
    return res.status(403).json({ error: 'Cannot access other students\' data' })
  }

  if (user.role === 'teacher' && teacher_id && parseInt(teacher_id) !== user.userId) {
    return res.status(403).json({ error: 'Cannot access other teachers\' data' })
  }

  next()
}

module.exports = {
  generateToken,
  verifyToken,
  authMiddleware,
  roleMiddleware,
  ownershipMiddleware,
}
