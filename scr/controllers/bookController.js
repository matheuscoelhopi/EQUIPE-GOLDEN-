import pool from '../database.js';

const bookController = {
  // Adiciona um novo livro
  createBook: async (req, reply) => {
    const { title, publisher, author, publication_year, photo_url } = req.body;
    const { id: userId } = req.user;

    try {
      const result = await pool.query(
        `INSERT INTO books (title, publisher, author, publication_year, photo_url, owner_id, status_id)
         VALUES ($1, $2, $3, $4, $5, $6, 1) RETURNING *`, // status_id = 1 para 'Disponível'
        [title, publisher, author, publication_year, photo_url, userId]
      );
      const book = result.rows[0];
      reply.status(201).send({ message: 'Livro registrado com sucesso!', book });
    } catch (error) {
      console.error('Erro ao registrar o livro:', error);
      reply.status(500).send({ error: 'Erro ao registrar o livro.' });
    }
  },

  // Listar livros disponíveis com opção de busca
  listBooks: async (req, reply) => {
    const { search } = req.query;

    try {
      let query = `SELECT * FROM books WHERE status_id = 1`; // 'Disponível'
      let params = [];

      if (search) {
        query += ` AND (title ILIKE $1 OR author ILIKE $1 OR publisher ILIKE $1)`;
        params.push(`%${search}%`);
      }

      const result = await pool.query(query, params);
      reply.send({ books: result.rows });
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
      reply.status(500).send({ error: 'Erro ao buscar livros.' });
    }
  },


  // Editar informações de um livro
  updateBook: async (req, reply) => {
    const { id } = req.params;
    const { title, publisher, author, publication_year, photo_url, status_id } = req.body;
    const { id: userId } = req.user;

    try {
      const result = await pool.query(
        `UPDATE books SET title = $1, publisher = $2, author = $3, publication_year = $4, 
         photo_url = $5, status_id = $6 WHERE id = $7 AND owner_id = $8 RETURNING *`,
        [title, publisher, author, publication_year, photo_url, status_id, id, userId]
      );
      const book = result.rows[0];

      if (!book) {
        return reply.status(404).send({ error: 'Livro não encontrado ou você não tem permissão.' });
      }

      reply.send({ message: 'Livro atualizado com sucesso!', book });
    } catch (error) {
      console.error('Erro ao atualizar o livro.', error);
      reply.status(500).send({ error: 'Erro ao atualizar o livro.' });
    }
  },

  // Remover livro
  removeBook: async (req, reply) => {
    const { id } = req.params;
    const { id: userId } = req.user;

    try {
      const result = await pool.query(
        `DELETE FROM books WHERE id = $1 AND owner_id = $2`,
        [id, userId]
      );

      if (result.rowCount === 0) {
        return reply.status(404).send({ error: 'Livro não encontrado ou você não tem permissão.' });
      }

      reply.send({ message: 'Livro removido com sucesso!' });
    } catch (error) {
      console.error('Erro ao remover o livro.', error);
      reply.status(500).send({ error: 'Erro ao remover o livro.' });
    }
  },
};

export default bookController;
