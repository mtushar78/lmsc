require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

// Use a global variable to preserve the PrismaClient across module reloads
// in development (e.g. nodemon / hot reload). This prevents exhausting
// database connections during development.
const baseConfig = {
	log: [
		{ level: 'error', emit: 'event' },
		{ level: 'warn', emit: 'event' },
		{ level: 'info', emit: 'event' }
	]
}

// Build client options depending on whether user wants a direct connection or Accelerate
// Use `datasourceUrl` for the PrismaClient constructor (supported by current runtime),
// or `accelerateUrl` when using Prisma Accelerate.
const clientOptions = { ...baseConfig }
if (process.env.PRISMA_ACCELERATE_URL) {
	clientOptions.accelerateUrl = process.env.PRISMA_ACCELERATE_URL
} else if (process.env.DATABASE_URL) {
	// pass the connection string as `datasourceUrl` which the runtime validates
	clientOptions.datasourceUrl = process.env.DATABASE_URL
}

let prisma
if (process.env.NODE_ENV === 'production') {
	prisma = new PrismaClient(clientOptions)
} else {
	// eslint-disable-next-line no-underscore-dangle
	if (!global.__prisma) {
		// eslint-disable-next-line no-underscore-dangle
		global.__prisma = new PrismaClient(clientOptions)
	}
	// eslint-disable-next-line no-underscore-dangle
	prisma = global.__prisma
}

// Optional: surface Prisma events to stderr/stdout in dev for debugging
prisma.$on('error', (e) => {
	console.error('Prisma error:', e)
})
prisma.$on('warn', (e) => {
	if (process.env.NODE_ENV !== 'production') console.warn('Prisma warning:', e)
})

module.exports = prisma
