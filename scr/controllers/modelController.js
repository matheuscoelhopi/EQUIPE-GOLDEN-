import modelController from '.controllers/modelController.js';

const bookController = {
  create: async (req, reply) => {
    const { name, author, publisher, year, photo } = req.body;
    const userId = req.user.id;

    try {
      const newBook = await modelController.createBook({ name, author, publisher, year, photo, userId });
      reply.status(201).send(newBook);
    } catch (error) {
      reply.status(500).send({ error: 'Erro ao criar o livro.' });
    }
  },
};
