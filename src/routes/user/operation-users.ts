import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { authenticateService } from '../../middleware/authenticate-middleware';

export function getTokenByStationId(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/stations/:id/token',
    {
      preHandler: authenticateService.authenticateRequest,
      schema: {
        summary: 'Obter o token de uma estação pelo ID',
        tags: ['user'],
        security: [
          {
            BearerAuth: []
          }
        ],
        params: z.object({
          id: z.coerce.number()
        }),
        response: {
          200: z.object({
            token: z.string().uuid()
          }),
          404: z.object({
            error: z.string()
          }),
          500: z.object({
            error: z.string()
          })
        }
      }
    },
    async (request, reply) => {
      try {
        const id = Number(request.params.id);

        const station = await prisma.station.findUnique({
          where: { id },
          select: { token: true }
        });

        if (!station) {
          return reply.status(404).send({ error: 'Estação não encontrada.' });
        }

        reply.status(200).send({ token: station.token });
      } catch (error) {
        console.error(error);
        reply.status(500).send({ error: 'Erro interno do servidor.' });
      }
    }
  );
}

export function deleteStation(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/stations/:id',
    {
      preHandler: authenticateService.authenticateRequest,
      schema: {
        summary: 'Excluir uma estação pelo ID',
        tags: ['admin'],
        security: [
          {
            BearerAuth: []
          }
        ],
        params: z.object({
          id: z.coerce.number()
        }),
        response: {
          200: z.object({
            message: z.string()
          }),
          404: z.object({
            error: z.string()
          }),
          500: z.object({
            error: z.string()
          })
        }
      }
    },
    async (request, reply) => {
      try {
        const id = Number(request.params.id);

        const station = await prisma.station.findUnique({
          where: { id }
        });

        if (!station) {
          return reply.status(404).send({ error: 'Estação não encontrada.' });
        }

        // Excluir a estação
        await prisma.station.delete({
          where: { id }
        });

        reply.status(200).send({ message: 'Estação excluída com sucesso!' });
      } catch (error) {
        console.error(error);
        reply.status(500).send({ error: 'Erro interno do servidor.' });
      }
    }
  );
}
