import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma';
import { authenticateService } from '../../middleware/authenticate-middleware';

export function loginUser(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/login',
    {
      schema: {
        summary: 'Autenticação de usuário',
        tags: ['user'],
        body: z.object({
          username: z.string().min(4),
          password: z.string()
        }),
        response: {
          200: z.object({
            username: z.string(),
            token: z.string()
          }),
          401: z.object({ error: z.string() }),
          404: z.object({ error: z.string() }),
          500: z.object({ error: z.string() })
        }
      }
    },

    async (request, reply) => {
      try {
        const { username, password } = request.body;

        const user = await prisma.user.findFirst({
          where: {
            username
          }
        });

        if (!user) {
          return reply.status(404).send({ error: 'Usuário não encontrado' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return reply.status(401).send({ error: 'Verifique se as credenciais informadas estão corretas!' });
        }

        const token = await authenticateService.generateToken({ userId: user.id });

        reply.status(200).send({ username, token });
      } catch (error) {
        console.log(error);
        reply.status(500).send({ error: 'Erro interno no servidor' });
      }
    }
  );
}
