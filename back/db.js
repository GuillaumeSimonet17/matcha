const { Pool } = require('pg')

const pool = new Pool({
    host: 'db',
    port: 5432,
    database: 'db',
    user: 'matcha_app',
    password: 'test',
})

// Function to connect to the database with retries
async function connectWithRetries() {
    let retries = 5;
    while (retries > 0) {
        try {
            await pool.connect();
            console.log('Connected to PostgreSQL database');
            break;
        } catch (err) {
            console.error('Error connecting to PostgreSQL database:', err);
            retries--;
            if (retries === 0) {
                throw err;
            }
            console.log(`Retrying in 5 seconds... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

// Call the function to connect to the database
connectWithRetries().catch(err => console.error('Failed to connect to database:', err));


module.exports = {pool};
