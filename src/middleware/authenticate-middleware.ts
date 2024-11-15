import JWT from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { FastifyReply, FastifyRequest } from 'fastify';

interface TokenPayload {
  userId: string;
}

interface User {
  id: string;
  username: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
  }
}

export const authenticateService = {
  generateToken(payload: TokenPayload): Promise<string> {
    return new Promise((resolve, reject) => {
      JWT.sign(payload, process.env.SECRET_KEY as string, { expiresIn: '1d' }, (error, token) => {
        if (error) {
          reject(new Error('ERR_INVALID_TOKEN'));
        } else {
          resolve(token as string);
        }
      });
    });
  },

  async verifyToken(token: string): Promise<User | null> {
    try {
      const secretKey = process.env.SECRET_KEY;
      if (!secretKey) {
        throw new Error('SECRET_KEY não está configurado.');
      }

      const decodedToken = JWT.verify(token, secretKey);

      const { userId } = decodedToken as TokenPayload;

      if (!userId) {
        throw new Error('ID do usuário não encontrado no token');
      }

      const user = await prisma.user.findFirst({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      return user;
    } catch (error) {
      console.error(error);
      return null; // Retorna null em caso de falha para facilitar o tratamento
    }
  },

  async authenticateRequest(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const token = request.headers.authorization?.replace(/^Bearer /, '');

      if (!token) {
        reply.status(401).send({ message: 'Token não fornecido.' });
        throw new Error('Token não fornecido'); // Interrompe a execução
      }

      const user = await authenticateService.verifyToken(token);

      if (!user) {
        reply.status(401).send({ message: 'Não autorizado: Token inválido' });
        throw new Error('Token inválido'); // Interrompe a execução
      }

      // Adiciona o usuário autenticado à requisição
      request.user = user;
    } catch (error) {
      console.error(error);
      reply.status(500).send({ message: 'Erro interno no servidor.' });
      throw error; // Garante que o fluxo do Fastify seja interrompido
    }
  }
};
