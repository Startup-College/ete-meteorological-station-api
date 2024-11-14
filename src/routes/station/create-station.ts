import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export function createStation(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/create-station',
    {
      schema: {
        summary: 'criar estação',
        tags: ['station'],
        body: z.object({
          name: z.string().min(4),
          latitude: z.string(),
          longitude: z.string()
        }),
        response: {
          201: z.object({
            id: z.string().uuid()
          })
        }
      }
    },
    async (request, reply) => {
      const { name, latitude, longitude } = request.body;

      const { id } = await prisma.station.create({
        data: { name, latitude, longitude }
      });

      return reply.status(201).send({ id });
    }
  );
}
