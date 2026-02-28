import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSetup() {
    try {
        console.log('Reading setup.sql...');
        const sqlPath = path.join(__dirname, 'setup.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL...');
        await pool.query(sql);

        // Add is_active column explicitly just in case the table already existed and CREATE TABLE IF NOT EXISTS didn't add the new column
        console.log('Ensuring is_active column exists (ALTER TABLE)...');
        try {
            await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;');
        } catch (e) {
            console.log('Alter table notice:', e.message);
        }

        console.log('✅ Database setup complete!');
    } catch (error) {
        console.error('❌ Failed to run setup:', error);
    } finally {
        await pool.end();
    }
}

runSetup();
