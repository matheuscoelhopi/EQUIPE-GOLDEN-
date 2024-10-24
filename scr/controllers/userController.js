import pool from '../database.js';
import bcrypt from 'bcrypt';
import sql from '../database.js'

const userController = {
  // Atualizar informações do perfil do usuário
  updateProfile: async (req, reply) => {
    const { id: userId } = req.user;
    const { name, phone, password } = req.body;

    try {
      // Atualiza apenas se os dados forem enviados
      const updates = [];
      const params = [];

      if (name) {
        updates.push('name = $' + (params.length + 1));
        params.push(name);
      }

      if (phone) {
        updates.push('phone = $' + (params.length + 1));
        params.push(phone);
      }

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updates.push('password = $' + (params.length + 1));
        params.push(hashedPassword);
      }

      params.push(userId); // O último parâmetro será o ID do usuário

      if (updates.length > 0) {
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING id, name, phone`;
        const result = await pool.query(query, params);
        const updatedUser = result.rows[0];
        reply.send({ message: 'Perfil atualizado com sucesso!', user: updatedUser });
      } else {
        reply.status(400).send({ error: 'Nenhuma informação foi enviada para atualização.' });
      }
    } catch (error) {
      reply.status(500).send({ error: 'Erro ao atualizar o perfil do usuário.' });
    }
  },

  // Exibir informações do perfil do usuário logado
  getProfile: async (req, reply) => {
    const { id: userId } = req.user;

    try {
      const result = await pool.query('SELECT id, name, phone FROM users WHERE id = $1', [userId]);
      const user = result.rows[0];

      if (!user) {
        return reply.status(404).send({ error: 'Usuário não encontrado.' });
      }

      reply.send({ user });
    } catch (error) {
      reply.status(500).send({ error: 'Erro ao buscar informações do perfil.' });
    }
  }
};

export default userController;
