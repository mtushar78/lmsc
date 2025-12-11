import 'dotenv/config'

// Prisma v7+ configuration file for migrations and CLI operations.
// This moves connection strings out of the schema and into a JS/TS config,
// allowing production-ready options like Accelerate or adapters.
export default {
  datasources: {
    db: {
      // Provide DATABASE_URL from environment for Migrate/CLI
      url: process.env.DATABASE_URL,
    },
  },
}
