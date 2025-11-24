const { Pool } = require('pg');

// Pre-calculated hash for 'admin123'
const hash = '$2b$10$iJCNVJrNXo7kS8Ca6gtYA.8H9GdlbWT80A94JKkBfqJdXtjbmzQ86';

(async () => {
    console.log('Starting admin creation (simple)...');
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
        console.error('Error: DATABASE_URL is not set in environment');
        process.exit(1);
    }

    try {
        const pool = new Pool({ connectionString: dbUrl });
        console.log('Connected to database.');

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
