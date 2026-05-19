import mysql from 'mysql2/promise';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load .env variables
const rootEnv = path.resolve(process.cwd(), '../.env');
const localEnv = path.resolve(process.cwd(), '.env');

if (fs.existsSync(localEnv)) {
    dotenv.config({ path: localEnv });
} else if (fs.existsSync(rootEnv)) {
    dotenv.config({ path: rootEnv });
} else {
    dotenv.config();
}

async function migrate() {
  const connection = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'glico_db',
  });

  console.log('Conectado ao MySQL com sucesso.');

  try {
    console.log('Executando alteração na tabela avaliacoes...');
    await connection.query(`
      ALTER TABLE avaliacoes 
      ADD COLUMN tipo_predicao VARCHAR(10) NOT NULL DEFAULT 'ML' 
      COMMENT 'Tipo de predição: ML ou FALLBACK';
    `);
    console.log('Migração concluída com sucesso! Coluna tipo_predicao adicionada.');
  } catch (error) {
    if (error.code === 'ER_DUP_COLUMN_NAME') {
      console.log('A coluna tipo_predicao já existe na tabela avaliacoes.');
    } else {
      console.error('Erro na migração:', error);
    }
  } finally {
    await connection.end();
  }
}

migrate();
