import pool from '../database.js';

const donationsController = {
  // Registra uma nova doação de livro
  createDonation: async (req, reply) => {
    const { bookId } = req.body;
    const { id: donorId } = req.user; // Extraído do token JWT

    try {
      // Insere a nova doação e define o status como "Doado"
      const result = await pool.query(
        `INSERT INTO book_donations (book_id, donor_id, status_id)
         VALUES ($1, $2, (SELECT id FROM book_statuses WHERE status_name = 'Doado'))
         RETURNING *`,
        [bookId, donorId]
      );
      const donation = result.rows[0];

      // Atualiza o status do livro para "Doado"
      await pool.query(
        `UPDATE books SET status_id = (SELECT id FROM book_statuses WHERE status_name = 'Doado')
         WHERE id = $1`,
        [bookId]
      );

      reply.status(201).send({ message: 'Livro doado com sucesso!', donation });
    } catch (error) {
      console.error('Erro ao registrar a doação:', error);
      reply.status(500).send({ error: 'Erro ao registrar a doação' });
    }
  },

  // Lista todas as doações feitas pelo usuário
  listUserDonations: async (req, reply) => {
    const { id: userId } = req.user;

    try {
      const result = await pool.query(
        `SELECT bd.id, b.title, b.author, b.publisher, bd.donation_date, bs.status_name as status
         FROM book_donations bd
         JOIN books b ON bd.book_id = b.id
         JOIN book_statuses bs ON bd.status_id = bs.id
         WHERE bd.donor_id = $1`,
        [userId]
      );

      reply.send({ donations: result.rows });
    } catch (error) {
      console.error('Erro ao buscar doações do usuário:', error);
      reply.status(500).send({ error: 'Erro ao buscar doações' });
    }
  },

  // Remove uma doação feita pelo usuário
  removeDonation: async (req, reply) => {
    const { id: donationId } = req.params;
    const { id: userId } = req.user;

    try {
      // Verifica se a doação pertence ao usuário e a exclui
      const result = await pool.query(
        `DELETE FROM book_donations WHERE id = $1 AND donor_id = $2 RETURNING *`,
        [donationId, userId]
      );

      if (result.rowCount === 0) {
        return reply.status(404).send({ error: 'Doação não encontrada ou acesso negado' });
      }

      // Opcionalmente, atualiza o status do livro
      await pool.query(
        `UPDATE books SET status_id = (SELECT id FROM book_statuses WHERE status_name = 'Disponível')
         WHERE id = (SELECT book_id FROM book_donations WHERE id = $1)`,
        [donationId]
      );

      reply.send({ message: 'Doação removida com sucesso!' });
    } catch (error) {
      console.error('Erro ao remover a doação:', error);
      reply.status(500).send({ error: 'Erro ao remover a doação' });
    }
  },

  // Lista todos os livros disponíveis para doação
  listAvailableDonations: async (req, reply) => {
    const { search } = req.query;

    try {
      let query = `
        SELECT b.id, b.title, b.author, b.publisher, b.photo_url, bs.status_name as status
        FROM books b
        JOIN book_statuses bs ON b.status_id = bs.id
        WHERE bs.status_name = 'Disponível'
      `;
      const params = [];

      // Adiciona filtro de pesquisa, se especificado
      if (search) {
        query += ` AND (b.title ILIKE $1 OR b.author ILIKE $1 OR b.publisher ILIKE $1)`;
        params.push(`%${search}%`);
      }

      const result = await pool.query(query, params);
      reply.send({ availableBooks: result.rows });
    } catch (error) {
      console.error('Erro ao buscar livros disponíveis para doação:', error);
      reply.status(500).send({ error: 'Erro ao buscar livros disponíveis' });
    }
  },
};

export default donationsController;