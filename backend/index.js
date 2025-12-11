require('dotenv').config()
const app = require('./src/app')
const prisma = require('./db')

const PORT = process.env.PORT || 4000
const server = app.listen(PORT, () => console.log('Server running on', PORT))

async function shutdown(signal) {
	console.log(`Received ${signal}, shutting down gracefully...`)
	server.close(async (err) => {
		if (err) {
			console.error('Error closing server', err)
			process.exit(1)
		}
		try {
			await prisma.$disconnect()
			console.log('Prisma disconnected')
		} catch (e) {
			console.error('Error disconnecting Prisma', e)
		}
		process.exit(0)
	})
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

process.on('uncaughtException', async (err) => {
	console.error('Uncaught exception', err)
	try { await prisma.$disconnect() } catch(e){}
	process.exit(1)
})

