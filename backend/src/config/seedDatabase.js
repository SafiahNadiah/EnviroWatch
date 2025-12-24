const bcrypt = require('bcrypt');
const { pool } = require('./database');

/**
 * Seed Database with Sample Data
 * Creates default admin user and sample monitoring data
 */
async function seedDatabase() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('Seeding EnviroWatch database...\n');

    // 1. Create users
    console.log('Creating users...');
    const hashedAdminPassword = await bcrypt.hash('Admin123!', 10);
    const hashedUserPassword = await bcrypt.hash('User123!', 10);

    const userResult = await client.query(`
      INSERT INTO users (email, password_hash, full_name, role) 
      VALUES 
        ('admin@envirowatch.com', $1, 'System Administrator', 'admin'),
        ('john.doe@envirowatch.com', $2, 'John Doe', 'user'),
        ('jane.smith@envirowatch.com', $2, 'Jane Smith', 'user')
      RETURNING id
    `, [hashedAdminPassword, hashedUserPassword]);

    const adminId = userResult.rows[0].id;
    console.log('✓ Created 3 users (1 admin, 2 regular users)');

    // 2. Create monitoring points (Malaysia locations)
    console.log('Creating monitoring points...');
    const monitoringPoints = await client.query(`
      INSERT INTO monitoring_points (name, description, latitude, longitude, type, status, installed_date, created_by) 
      VALUES 
        ('Kuala Lumpur City Centre', 'Air quality monitoring in KLCC area', 3.1578, 101.7118, 'air', 'active', '2023-01-15', $1),
        ('Port Klang Marine Monitor', 'Marine water quality monitoring', 3.0044, 101.3900, 'marine', 'active', '2023-02-01', $1),
        ('Klang River Station 1', 'River water quality - upstream', 3.0403, 101.4454, 'river', 'active', '2023-03-10', $1),
        ('Klang River Station 2', 'River water quality - midstream', 3.1412, 101.6869, 'river', 'active', '2023-03-10', $1),
        ('Petaling Jaya Air Station', 'Air quality in residential area', 3.1073, 101.6067, 'air', 'active', '2023-04-05', $1),
        ('Putrajaya Lake Monitor', 'Lake water quality monitoring', 2.9264, 101.6964, 'marine', 'active', '2023-05-20', $1),
        ('Gombak River Station', 'River water quality monitoring', 3.2599, 101.6519, 'river', 'maintenance', '2023-06-01', $1),
        ('Shah Alam Air Station', 'Air quality in industrial area', 3.0733, 101.5185, 'air', 'active', '2023-07-15', $1)
      RETURNING id
    `, [adminId]);

    console.log('✓ Created 8 monitoring points (3 air, 3 river, 2 marine)');

    // 3. Create monitoring records (last 30 days of data)
    console.log('Creating monitoring records...');
    
    for (const point of monitoringPoints.rows) {
      const pointId = point.id;
      
      // Generate 30 days of hourly data (720 records per point)
      for (let day = 0; day < 30; day++) {
        for (let hour = 0; hour < 24; hour += 3) { // Every 3 hours to reduce data
          const recordedAt = new Date();
          recordedAt.setDate(recordedAt.getDate() - day);
          recordedAt.setHours(hour, 0, 0, 0);

          // Get monitoring point type to generate appropriate data
          const pointType = await client.query(
            'SELECT type FROM monitoring_points WHERE id = $1',
            [pointId]
          );
          const type = pointType.rows[0].type;

          if (type === 'air') {
            // Air quality data
            await client.query(`
              INSERT INTO monitoring_records 
              (monitoring_point_id, recorded_at, pm25, pm10, aqi, temperature, humidity)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
              pointId,
              recordedAt,
              Math.random() * 50 + 10, // PM2.5: 10-60
              Math.random() * 80 + 20, // PM10: 20-100
              Math.floor(Math.random() * 150 + 20), // AQI: 20-170
              Math.random() * 10 + 25, // Temp: 25-35°C
              Math.random() * 30 + 60, // Humidity: 60-90%
            ]);
          } else {
            // Water quality data (river/marine)
            await client.query(`
              INSERT INTO monitoring_records 
              (monitoring_point_id, recorded_at, ph, dissolved_oxygen, turbidity, conductivity, temperature)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
              pointId,
              recordedAt,
              Math.random() * 2 + 6.5, // pH: 6.5-8.5
              Math.random() * 5 + 5, // DO: 5-10 mg/L
              Math.random() * 20 + 5, // Turbidity: 5-25 NTU
              Math.random() * 300 + 200, // Conductivity: 200-500 µS/cm
              Math.random() * 5 + 26, // Temp: 26-31°C
            ]);
          }
        }
      }
    }

    console.log('✓ Created monitoring records (30 days of data for each point)');

    // 4. Create sample chat sessions
    console.log('Creating sample chat sessions...');
    const chatSession = await client.query(`
      INSERT INTO chat_sessions (user_id, title)
      VALUES ($1, 'Air Quality in Kuala Lumpur')
      RETURNING id
    `, [adminId]);

    const sessionId = chatSession.rows[0].id;

    await client.query(`
      INSERT INTO chat_messages (session_id, role, content)
      VALUES 
        ($1, 'user', 'What is the current air quality in Kuala Lumpur?'),
        ($1, 'assistant', 'Based on recent monitoring data, the air quality in Kuala Lumpur is currently MODERATE. The KLCC station reports an AQI of 87, with PM2.5 levels at 32 µg/m³. The Petaling Jaya station shows similar readings. Would you like detailed information about specific pollutants?'),
        ($1, 'user', 'What about water quality in Klang River?'),
        ($1, 'assistant', 'The Klang River monitoring stations show improving water quality trends. Station 1 (upstream) reports a pH of 7.2 and dissolved oxygen at 6.8 mg/L, which are within acceptable ranges. Station 2 (midstream) shows slightly lower DO at 5.9 mg/L. Turbidity levels are moderate at both stations. The overall water quality is classified as FAIR and continues to improve due to ongoing rehabilitation efforts.')
    `, [sessionId]);

    console.log('✓ Created sample chat session with messages');

    await client.query('COMMIT');

    console.log('\n✓ Database seeded successfully!\n');
    console.log('Default Admin Account:');
    console.log('  Email: admin@envirowatch.com');
    console.log('  Password: Admin123!\n');
    console.log('Default User Account:');
    console.log('  Email: john.doe@envirowatch.com');
    console.log('  Password: User123!\n');

    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

seedDatabase();
