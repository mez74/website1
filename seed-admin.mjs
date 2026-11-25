import bcryptjs from 'bcryptjs';
import mysql from 'mysql2/promise';

const email = 'franco@michaelmackenziegroup.com';
const password = 'Azem301173@';

// Hash the password
const saltRounds = 10;
const passwordHash = await bcryptjs.hash(password, saltRounds);

console.log('Email:', email);
console.log('Password Hash:', passwordHash);

// Connect to database and insert
try {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'michael_mackenzie',
  });

  // Insert the admin user
  const query = 'INSERT INTO admin_users (email, passwordHash, isActive) VALUES (?, ?, true)';
  const [result] = await connection.execute(query, [email, passwordHash]);
  
  console.log('Admin user created successfully!');
  console.log('User ID:', result.insertId);
  
  await connection.end();
} catch (error) {
  console.error('Error seeding admin user:', error.message);
  process.exit(1);
}
