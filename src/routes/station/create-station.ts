import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { authenticateService } from '../../middleware/authenticate-middleware';

export function createStation(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/create-station',
    {
      preHandler: authenticateService.authenticateRequest,
      schema: {
        summary: 'criar estação',
        tags: ['station'],
        security: [
          {
            BearerAuth: []
          }
        ],
        body: z.object({
          name: z.string().min(4),
          latitude: z.string().optional(),
          longitude: z.string().optional()
        }),
        response: {
          201: z.object({
            id: z.string().uuid()
          }),
          400: z.object({ error: z.string() }),
          500: z.object({ error: z.string() })
        }
      }
    },

    async (request, reply) => {
      try {
        const { user } = request;
        const { name, latitude, longitude } = request.body;

        const existingStation = await prisma.station.findFirst({
          where: { name }
        });

        if (existingStation) {
          return reply.status(400).send({ error: 'Esta estação já foi criada.' });
        }

        const { id } = await prisma.station.create({
          data: {
            name,
            latitude,
            longitude,
            userId: user?.id
          }
        });

        return reply.status(201).send({ id });
      } catch (error) {
        console.log(error);
        reply.status(500).send({ error: 'Erro interno do servidor' });
      }
    }
  );
}
