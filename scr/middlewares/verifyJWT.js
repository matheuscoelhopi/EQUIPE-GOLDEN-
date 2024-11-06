// Middleware para verificar o JWT acho que o render tem o https mas 
const verifyJWT = async (req, reply) => {
    try {
      // Verifica e decodifica o token JWT enviado no cabeçalho de autorização
      const token = req.headers.authorization?.split(' ')[1]; // O formato esperado é "Bearer <token>"
  
      if (!token) {
        return reply.status(401).send({ error: 'Token de autenticação não fornecido.' });
      }
  
      // Valida o token JWT e anexa os dados decodificados ao objeto de requisição
      const decoded = await req.jwtVerify(); // Verifica automaticamente o token usando o plugin fastify-jwt
      req.user = decoded; // Armazena as informações do usuário no objeto req (disponível nas rotas protegidas)
    } catch (error) {
      // Lida com erros de autenticação, como token inválido ou expirado
      return reply.status(401).send({ error: 'Token de autenticação inválido ou expirado.' });
    }
  };
  
  export default verifyJWT;
  