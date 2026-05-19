import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

const rootEnv = path.resolve(process.cwd(), '../.env');
const localEnv = path.resolve(process.cwd(), '.env');

if (fs.existsSync(localEnv)) {
    dotenv.config({ path: localEnv });
} else if (fs.existsSync(rootEnv)) {
    dotenv.config({ path: rootEnv });
} else {
    dotenv.config();
}

import app from './app.js';

const PORT = process.env.PORT;

app.get('/', (req, res) => {
    res.send('Server Aberto!')
})

app.listen(PORT, () => {
    console.log(`Servidor aberto na porta: ${PORT}`)
})