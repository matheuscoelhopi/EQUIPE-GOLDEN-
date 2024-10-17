const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database'); // Configuração do pool de conexão do PostgreSQL

// Registrar um novo usuário
exports.register = async (request, reply) => {
  const { name, phone, password, confirmPassword } = request.body;

  
  if (password !== confirmPassword) return reply.status(400).send({ error: 'Passwords do not match.' });

  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const result = await pool.query(
      'INSERT INTO users (name, phone, password, accepted_terms) VALUES ($1, $2, $3, $4) RETURNING id, name, phone',
      [name, phone, hashedPassword]
    );
    
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, phone: user.phone }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    reply.send({ message: 'User registered successfully', token });
  } catch (err) {
    console.error(err);
    reply.status(500).send({ error: 'Error registering user.' });
  }
};

// Login de usuário
exports.login = async (request, reply) => {
  const { phone, password } = request.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    const user = result.rows[0];

    if (!user) return reply.status(400).send({ error: 'User not found.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return reply.status(400).send({ error: 'Invalid credentials.' });

    const token = jwt.sign({ id: user.id, phone: user.phone }, process.env.JWT_SECRET, { expiresIn: '1d' });
    reply.send({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    reply.status(500).send({ error: 'Error logging in.' });
  }
};

// Verificar token (rota protegida)
exports.me = async (request, reply) => {
  reply.send({ user: request.user });
};
