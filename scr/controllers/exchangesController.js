import pool from '../database.js';

const exchangesController = {
  // Propor uma nova troca
  proposeExchange: async (req, reply) => {
    const { bookId, recipientId } = req.body;
    const { id: proposerId } = req.user;

    try {
      const result = await pool.query(
        `INSERT INTO book_exchanges (book_id, proposer_id, recipient_id, status_id, proposal_date) 
         VALUES ($1, $2, $3, (SELECT id FROM book_statuses WHERE status_name = 'Reservado'), NOW())
         RETURNING *`,
        [bookId, proposerId, recipientId]
      );
      
      const exchange = result.rows[0];
      reply.status(201).send({ message: 'Proposta de troca enviada com sucesso!', exchange });
    } catch (error) {
      console.error('Erro ao propor troca:', error);
      reply.status(500).send({ error: 'Erro ao propor troca.' });
    }
  },

  // Listar trocas do usuário autenticado
  listUserExchanges: async (req, reply) => {
    const { id: userId } = req.user;

    try {
      const result = await pool.query(
        `SELECT * FROM book_exchanges 
         WHERE proposer_id = $1 OR recipient_id = $1`,
        [userId]
      );
      
      reply.send({ exchanges: result.rows });
    } catch (error) {
      console.error('Erro ao listar trocas:', error);
      reply.status(500).send({ error: 'Erro ao listar trocas.' });
    }
  },

  // Aprovar uma troca
  approveExchange: async (req, reply) => {
    const { id } = req.params;
    const { id: userId } = req.user;

    try {
      // Verificar se o usuário é o destinatário da troca
      const exchangeResult = await pool.query(
        `SELECT * FROM book_exchanges WHERE id = $1 AND recipient_id = $2`,
        [id, userId]
      );

      if (exchangeResult.rows.length === 0) {
        return reply.status(403).send({ error: 'Permissão negada.' });
      }

      // Aprovar a troca e atualizar o status
      const updateResult = await pool.query(
        `UPDATE book_exchanges SET status_id = (SELECT id FROM book_statuses WHERE status_name = 'Trocado'), 
         exchange_date = NOW()
         WHERE id = $1 RETURNING *`,
        [id]
      );

      reply.send({ message: 'Troca aprovada com sucesso!', exchange: updateResult.rows[0] });
    } catch (error) {
      console.error('Erro ao aprovar troca:', error);
      reply.status(500).send({ error: 'Erro ao aprovar troca.' });
    }
  },

  // Rejeitar uma troca
  rejectExchange: async (req, reply) => {
    const { id } = req.params;
    const { id: userId } = req.user;

    try {
      // Verificar se o usuário é o destinatário da troca
      const exchangeResult = await pool.query(
        `SELECT * FROM book_exchanges WHERE id = $1 AND recipient_id = $2`,
        [id, userId]
      );

      if (exchangeResult.rows.length === 0) {
        return reply.status(403).send({ error: 'Permissão negada.' });
      }

      // Rejeitar a troca e atualizar o status
      const updateResult = await pool.query(
        `UPDATE book_exchanges SET status_id = (SELECT id FROM book_statuses WHERE status_name = 'Disponível')
         WHERE id = $1 RETURNING *`,
        [id]
      );

      reply.send({ message: 'Troca rejeitada com sucesso!', exchange: updateResult.rows[0] });
    } catch (error) {
      console.error('Erro ao rejeitar troca:', error);
      reply.status(500).send({ error: 'Erro ao rejeitar troca.' });
    }
  },

  // Cancelar uma proposta de troca (pelo usuário que propôs)
  cancelExchange: async (req, reply) => {
    const { id } = req.params;
    const { id: proposerId } = req.user;

    try {
      // Verificar se o usuário é o proponente da troca
      const exchangeResult = await pool.query(
        `SELECT * FROM book_exchanges WHERE id = $1 AND proposer_id = $2`,
        [id, proposerId]
      );

      if (exchangeResult.rows.length === 0) {
        return reply.status(403).send({ error: 'Permissão negada.' });
      }

      // Cancelar a troca
      const deleteResult = await pool.query(
        `DELETE FROM book_exchanges WHERE id = $1 RETURNING *`,
        [id]
      );

      reply.send({ message: 'Proposta de troca cancelada com sucesso!', exchange: deleteResult.rows[0] });
    } catch (error) {
      console.error('Erro ao cancelar troca:', error);
      reply.status(500).send({ error: 'Erro ao cancelar troca.' });
    }
  },
};

export default exchangesController;
