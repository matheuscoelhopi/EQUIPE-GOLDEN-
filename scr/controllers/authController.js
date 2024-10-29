import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../database.js';

const authController = {
  // Registro de novos usuários
  register: async (req, reply) => {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword) {
      return reply.status(400).send({ error: 'Todos os campos são obrigatórios.' });
    }

    if (password !== confirmPassword) {
      return reply.status(400).send({ error: 'As senhas não coincidem.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const result = await pool.query(
        'INSERT INTO users ("name", "email", "phone", "password") VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, phone, hashedPassword]
      );
      const user = result.rows[0];
      reply.status(201).send({ message: 'Usuário registrado com sucesso!', user });
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
    }
  },

  // Login de usuários
  login: async (req, reply) => {
    const { email, password } = req.body;

    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (!user) {
        return reply.status(400).send({ error: 'Usuário não encontrado.' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return reply.status(400).send({ error: 'Senha incorreta.' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });

      reply.send({ message: 'Login realizado com sucesso!', token });
    } catch (error) {
      reply.status(500).send({ error: 'Erro ao fazer login.' });
    }
  },

  // Informações do usuário autenticado
  me: async (req, reply) => {
    const { id } = req.user;

    try {
      const result = await pool.query('SELECT id, name, phone FROM users WHERE id = $1', [id]);
      const user = result.rows[0];

      if (!user) {
        return reply.status(404).send({ error: 'Usuário não encontrado.' });
      }
      reply.send({ user });

    } catch (error) {
      reply.status(500).send({ error: 'Erro ao buscar informações do usuário.' });
    }
  },
};

export default authController;