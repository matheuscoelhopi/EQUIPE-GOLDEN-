import Fastify from 'fastify'; // Framework de servidor
import dotenv from 'dotenv'; // Carregar variáveis de ambiente
import fastifyJwt from 'fastify-jwt'; // Plugin para autenticação JWT
import fastifyMultipart from 'fastify-multipart'; // Plugin para upload de arquivos (se necessário)
import authController from './scr/controllers/authController.js'; // Controlador de autenticação
import bookController from './scr/controllers/bookController.js'; // Controlador de livros
import userController from './scr/controllers/userController.js'; // Controlador de usuários (adicionado)
import donationsController from './scr/controllers/donationsController.js';//Controlador de doações 
import exchangesController from './scr/controllers/exchangesController.js';//Controlador de trocas
import verifyJWT from './scr/middlewares/verifyJWT.js'; // Middleware para proteger rotas
import pool from './scr/database.js'; // Configuração do banco de dados PostgreSQL

dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

// Inicializar o servidor Fastify
const fastify = Fastify({ logger: true });

// Registrar o plugin de multipart (se estiver lidando com upload de imagens de livros)
fastify.register(fastifyMultipart);

//Registrar o plugin JWT para autenticação
fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET, // A chave secreta usada para assinar tokens JWT
});

// Conectar ao banco de dados antes de iniciar o servidor
fastify.addHook('onReady', async () => {
  try {
    await pool.connect();
    fastify.log.info('Conectado ao banco de dados PostgreSQL com sucesso!');
  } catch (error) {
    fastify.log.error('Erro ao conectar ao banco de dados:', error);
    process.exit(1); // Encerra a aplicação se não conseguir conectar
  }
});

// Rotas de Autenticação
fastify.post('/register', authController.register); // Registro de novos usuários
fastify.post('/login', authController.login); // Login de usuários
fastify.get('/me', { preHandler: [verifyJWT] }, authController.me); // Informações do usuário autenticado

// Rotas de Usuários
fastify.put('/profile', { preHandler: [verifyJWT] }, userController.updateProfile); // Atualizar perfil do usuário
fastify.get('/profile', { preHandler: [verifyJWT] }, userController.getProfile); // Exibir perfil do usuário

// Rotas de Livros
fastify.post('/books', { preHandler: [verifyJWT] }, bookController.createBook); // Adicionar novo livro
fastify.get('/books', bookController.listBooks); // Listar livros (com filtro de pesquisa)
fastify.put('/books/:id', { preHandler: [verifyJWT] }, bookController.updateBook); // Editar livro
fastify.delete('/books/:id', { preHandler: [verifyJWT] }, bookController.removeBook); // Remover livro

// Rotas de Doações
fastify.post('/donations', { preHandler: [verifyJWT] }, donationsController.createDonation); // Cria uma nova doação
fastify.get('/donations', { preHandler: [verifyJWT] }, donationsController.listUserDonations); // Lista doações do usuário autenticado
fastify.delete('/donations/:id', { preHandler: [verifyJWT] }, donationsController.removeDonation); // Remove uma doação específica
fastify.get('/available-donations', donationsController.listAvailableDonations); // Lista todos os livros disponíveis para doação

// Rotas de Troca
fastify.post('/exchanges/propose', { preHandler: [verifyJWT] }, exchangesController.proposeExchange); // Propor nova troca
fastify.get('/exchanges', { preHandler: [verifyJWT] }, exchangesController.listUserExchanges); // Listar trocas do usuário autenticado
fastify.put('/exchanges/:id/approve', { preHandler: [verifyJWT] }, exchangesController.approveExchange); // Aprovar troca
fastify.put('/exchanges/:id/reject', { preHandler: [verifyJWT] }, exchangesController.rejectExchange); // Rejeitar troca
fastify.delete('/exchanges/:id/cancel', { preHandler: [verifyJWT] }, exchangesController.cancelExchange); // Cancelar proposta de troca


// Iniciar o servidor
const start = async () => {
  try {
    const port = process.env.PORT || 3000; // Porta padrão ou porta definida nas variáveis de ambiente
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`Servidor rodando na porta ${port}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

// Chamar a função para iniciar o servidor
start();
