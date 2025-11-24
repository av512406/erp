const bcrypt = require('bcrypt');
const { Pool } = require('pg');

// Do not load .env file, rely on container environment variables
// require('dotenv').config({ path: '/srv/school-erp/.env' });

(async () => {
    console.log('Starting admin creation...');
    if (!process.env.DATABASE_URL) {
        console.error('Error: DATABASE_URL is not set in environment');
        process.exit(1);
    }

    try {
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        console.log('Connected to database.');

        const hash = await bcrypt.hash('admin123', 10);
        console.log('Password hashed.');

        await pool.query('DELETE FROM users WHERE email = $1', ['admin@school.edu']);
        console.log('Deleted existing admin.');

        await pool.query('INSERT INTO users (id, email, password_hash, role, name) VALUES (gen_random_uuid()::text, $1, $2, $3, $4)', ['admin@school.edu', hash, 'admin', 'Admin User']);
        console.log('Admin user created successfully');

        await pool.end();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
})();
