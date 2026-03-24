import app from './app.js';
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT;

app.get('/', (req, res) => {
    res.send('Server Iniciado')
});

app.listen(port, async () => {
    console.log(`Servidor rodando na porta: ${port}`)
});