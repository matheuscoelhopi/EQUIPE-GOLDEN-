//Criando servidor e estabelecendo suas rotas...
import { fastify } from 'fastify'

const routes = fastify()



//Rotas Usuários Autenticação
routes.post('/register', (request, reply) => {
    const {name, email, password , phone} = request.body;

    database.create({
        name,
        email,
        password,
        phone,
    })
    
});
//Login de Usuarios
routes.get('/login', (request, reply) => {
});

//Logout do usuario
routes.put('/users/profile', (request, reply) => {
    
});

//Rotas Usuários
//Livros doados por um usuario
routes.get('/users/:id/books', (request, reply) => {
});
/* Por enquando não (Listar Troca de livros realizadas por usuario)
routes.get('/users/:id/exchanges', (request, reply) => {
});
*/

//Rotas Livros
//Lista Livros Disponiveis
routes.get('/books', (request, reply) => {
    
});

//Cadastra novo Livro
routes.post('/books', (request, reply) => {
    
});

//Obtem detalhes de um livro específico
routes.get('/books/:id', (request, reply) => {
    
});

// Editar informações de um livro
routes.put('/books/:id', (request, reply) => {
    
});

//Deleta livro
routes.delete('/books/:id', (request, reply) => {
    
});

//Buscar livro por nome, autor ou editora
routes.post('/books/search', (request, reply) => {
    
});

//Rota upload de imagem
routes.post('/upload/book-image', (request, reply) => {
    
});

routes.listen({
    port: 3333
})