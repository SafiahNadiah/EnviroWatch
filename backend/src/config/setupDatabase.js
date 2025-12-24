const fs = require('fs');
const path = require('path');
const { pool } = require('./database');

/**
 * Setup Database - Creates all tables and schema
 * Run this script to initialize the database
 */
async function setupDatabase() {
  try {
    console.log('Setting up EnviroWatch database...\n');

    // Read and execute schema SQL file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(schemaSql);

    console.log('✓ Database schema created successfully');
    console.log('✓ All tables created');
    console.log('✓ Indexes created');
    console.log('✓ Triggers created\n');
    console.log('Database setup complete!');
    console.log('Run "npm run db:seed" to populate with sample data.\n');

    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
