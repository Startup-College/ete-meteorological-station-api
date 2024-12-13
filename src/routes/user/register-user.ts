import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcrypt';

export async function registerUser(app: FastifyInstance) {
  const rootUser = await prisma.user.findFirst({
    where: { username: 'root' }
  });

  if (!rootUser) {
    const rootPassword = await bcrypt.hash('12345678', 10);
    await prisma.user.create({
      data: { username: 'root', password: rootPassword }
    });
    console.log('Usuário root padrão criado!');
  }
  app.withTypeProvider<ZodTypeProvider>().post(
    '/register',
    {
      schema: {
        hide: true,
        summary: 'Registrar usuário',
        tags: ['user'],
        body: z.object({
          username: z.string().min(4),
          password: z.string()
        }),
        response: {
          201: z.object({
            message: z.string()
          }),
          401: z.object({ error: z.string() }),
          500: z.object({ error: z.string() })
        }
      }
    },
    async (request, reply) => {
      try {
        const { username, password } = request.body;

        const userExists = await prisma.user.findFirst({
          where: { username }
        });

        if (userExists) reply.status(401).send({ error: 'Usuário Existente' });

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
          data: { username, password: hashedPassword }
        });

        reply.status(201).send({ message: 'Usuário cadastrado com sucesso!' });
      } catch (error) {
        console.log(error);
        return reply.status(500).send({ error: 'Erro interno do servidor' });
      }
    }
  );
}
