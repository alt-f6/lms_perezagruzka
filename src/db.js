require('dotenv').config();
const { Pool } = require('pg');

const sslEnabled = process.env.DATABASE_SSL === 'true';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslEnabled ? { rejectUnauthorized: false } : false,
});

async function query(text, params) {
    return pool.query(text, params)
}

async function getClient() {
    return pool.connect();
}

module.exports = {
    pool,
    query,
    getClient,
};