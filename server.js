// Importações e configuração
const fastify = require('fastify')({ logger: true });
require('dotenv').config(); // Carregar variáveis de ambiente do arquivo .env
const pool = require('./config/database'); // Pool de conexão do banco de dados
const verifyJWT = require('./middlewares/verifyJWT'); // Middleware de autenticação JWT

// Registrar controladores de rotas
const authController = require('./controllers/authController');
const bookController = require('./controllers/bookController');
const exchangeController = require('./controllers/exchangeController');

// Rotas de autenticação
fastify.post('/register', authController.register);
fastify.post('/login', authController.login);
fastify.get('/me', { preHandler: [verifyJWT] }, authController.me);

// Rotas de livros
fastify.post('/books', { preHandler: [verifyJWT] }, bookController.donateBook);
fastify.put('/books/:id', { preHandler: [verifyJWT] }, bookController.updateBook);
fastify.delete('/books/:id', { preHandler: [verifyJWT] }, bookController.deleteBook);
fastify.get('/books/search', bookController.searchBooks);

// Rotas de trocas
fastify.post('/exchange/:bookId/propose', { preHandler: [verifyJWT] }, exchangeController.proposeExchange);
fastify.delete('/exchange/:id/cancel', { preHandler: [verifyJWT] }, exchangeController.cancelExchange);
fastify.post('/exchange/:id/accept', { preHandler: [verifyJWT] }, exchangeController.acceptExchange);
fastify.post('/exchange/:id/reject', { preHandler: [verifyJWT] }, exchangeController.rejectExchange);

// Testar conexão ao banco de dados
fastify.get('/db-check', async (request, reply) => {
  try {
    const result = await pool.query('SELECT NOW()'); // Query de teste
    reply.send({ message: 'Database connected', time: result.rows[0].now });
  } catch (err) {
    reply.status(500).send({ error: 'Failed to connect to the database.' });
  }
});

// Inicializar o servidor Fastify
const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
    fastify.log.info(`Server running at http://localhost:${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1); // Sair com erro
  }
};

start(); // Chamada para inicializar o servidor