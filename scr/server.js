//Criando servidor e estabelecendo suas rotas...
import {fastify} from 'fastify';

const server = fastify();

//Rotas Usuários 
server.post('/users/register');

server.get('/users/login');

server.put('/users/profile:id');

//Rotas Livros
server.post('/books');

server.get('/books');

server.put('/books/:id');
