//Criando servidor e estabelecendo suas rotas...
import { fastify } from 'fastify'

const server = fastify()



//Rotas Usuários Autenticação
server.post('/register', (request, reply) => {
    const {name, email, password , phone} = request.body;

    database.create({
        name,
        email,
        password,
        phone,
    })
    
});
//Login de Usuarios
server.get('/login', (request, reply) => {
});

//Logout do usuario
server.put('/users/profile', (request, reply) => {
    
});

//Rotas Usuários
//Livros doados por um usuario
server.get('/users/:id/books', (request, reply) => {
});
/* Por enquando não (Listar Troca de livros realizadas por usuario)
server.get('/users/:id/exchanges', (request, reply) => {
});
*/

//Rotas Livros
//Lista Livros Disponiveis
server.get('/books', (request, reply) => {
    
});

//Cadastra novo Livro
server.post('/books', (request, reply) => {
    
});

//Obtem detalhes de um livro específico
server.get('/books/:id', (request, reply) => {
    
});

// Editar informações de um livro
server.put('/books/:id', (request, reply) => {
    
});

//Deleta livro
server.delete('/books/:id', (request, reply) => {
    
});

//Buscar livro por nome, autor ou editora
server.post('/books/search', (request, reply) => {
    
});

//Rota upload de imagem
server.post('/upload/book-image', (request, reply) => {
    
});

server.listen({
    port: 3333
})