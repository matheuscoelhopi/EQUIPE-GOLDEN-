import pg from 'pg';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

// Desestruturar o Pool da biblioteca 'pg'
const { Pool } = pg;

// Configurações da conexão ao banco de dados PostgreSQL usando variáveis de ambiente
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // URL completa do banco de dados PostgreSQL
  ssl: {
    rejectUnauthorized: false, // Configura SSL
  },
});

// Testar a conexão ao banco de dados
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Erro ao conectar ao banco de dados:', err.stack);
  }
  console.log('Conectado ao banco de dados PostgreSQL com sucesso!');
  release(); // Libera o client após o teste de conexão
});

export default pool;
