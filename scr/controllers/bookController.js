import pool from '../database.js';

const bookController = {
  // Adiciona um novo livro
  create: async (req, reply) => {
    const { name, publisher, author, year, imageUrl } = req.body;
    const { id: userId } = req.user;

    try {
      const result = await pool.query(
        'INSERT INTO books (name, publisher, author, year, image_url, user_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [name, publisher, author, year, imageUrl, userId, 'Disponível']
      );
      const book = result.rows[0];
      reply.status(201).send({ message: 'Livro registrado com sucesso!', book });
    } catch (error) {
      reply.status(500).send({ error: 'Erro ao registrar o livro.' });
    }
  },

  // Listar livros
  list: async (req, reply) => {
    const { search } = req.query;

    try {
      let query = 'SELECT * FROM books WHERE status = $1';
      let params = ['Disponível'];

      if (search) {
        query += ' AND (name ILIKE $2 OR author ILIKE $2 OR publisher ILIKE $2)';
        params.push(`%${search}%`);
      }

      const result = await pool.query(query, params);
      reply.send({ books: result.rows });
    } catch (error) {
      reply.status(500).send({ error: 'Erro ao buscar livros.' });
    }
  },

  // Editar livro
  update: async (req, reply) => {
    const { id } = req.params;
    const { name, publisher, author, year, imageUrl, status } = req.body;
    const { id: userId } = req.user;

    try {
      const result = await pool.query(
        'UPDATE books SET name = $1, publisher = $2, author = $3, year = $4, image_url = $5, status = $6 WHERE id = $7 AND user_id = $8 RETURNING *',
        [name, publisher, author, year, imageUrl, status, id, userId]
      );
      const book = result.rows[0];

      if (!book) {
        return reply.status(404).send({ error: 'Livro não encontrado ou você não tem permissão.' });
      }

      reply.send({ message: 'Livro atualizado com sucesso!', book });
    } catch (error) {
      reply.status(500).send({ error: 'Erro ao atualizar o livro.' });
    }
  },

  // Remover livro
  remove: async (req, reply) => {
    const { id } = req.params;
    const { id: userId } = req.user;

    try {
      const result = await pool.query('DELETE FROM books WHERE id = $1 AND user_id = $2', [id, userId]);
      
      if (result.rowCount === 0) {
        return reply.status(404).send({ error: 'Livro não encontrado ou você não tem permissão.' });
      }

      reply.send({ message: 'Livro removido com sucesso!' });
    } catch (error) {
      reply.status(500).send({ error: 'Erro ao remover o livro.' });
    }
  },
};

export default bookController;
