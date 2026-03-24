import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

const PORT = process.env.PORT;

app.get('/', (req, res) => {
    res.send('Server Aberto!')
})

app.listen(PORT, () => {
    console.log(`Servidor aberto na porta: ${PORT}`)
})