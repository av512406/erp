const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { randomUUID } = require('crypto');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createAdmin() {
    try {
        const email = 'admin@school.edu';
        const password = 'admin123';

        console.log('Creating admin user...');
        console.log('Email:', email);
        console.log('Password:', password);

        const passwordHash = await bcrypt.hash(password, 10);

        // Delete existing admin if any
        await pool.query('DELETE FROM users WHERE email = $1', [email]);
        console.log('Deleted existing user (if any)');

        // Create new admin
        const id = randomUUID();
        await pool.query(
            'INSERT INTO users (id, email, password_hash, role, name) VALUES ($1, $2, $3, $4, $5)',
            [id, email, passwordHash, 'admin', 'Admin User']
        );

        console.log('✓ Admin user created successfully!');
        console.log('');
        console.log('Login credentials:');
        console.log('  Email: admin@school.edu');
        console.log('  Password: admin123');

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();
