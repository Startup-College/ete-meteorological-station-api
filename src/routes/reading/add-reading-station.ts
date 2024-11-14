import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export function addReadingStation(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/add-reading',
    {
      schema: {
        summary: 'adicionar leitura da estação',
        tags: ['reading'],
        body: z.object({
          stationId: z.string().uuid(),
          temperature: z.number(),
          humidity: z.number(),
          rainfallVolume: z.number()
        }),
        response: {
          201: z.object({
            id: z.string().uuid()
          })
        }
      }
    },
    async (request, reply) => {
      const { stationId, temperature, humidity, rainfallVolume } = request.body;

      const { id } = await prisma.reading.create({
        data: { stationId, temperature, humidity, rainfallVolume }
      });

      return reply.status(201).send({ id });
    }
  );
}
