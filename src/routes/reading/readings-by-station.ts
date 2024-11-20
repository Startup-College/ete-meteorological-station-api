import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export function readingsByStation(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    `/readings/:id`,
    {
      schema: {
        summary: 'Listar últimas leituras de cada estação',
        tags: ['reading'],
        response: {
          200: z.array(
            z.object({
              name: z.string(),
              dateTime: z.date(),
              temperature: z.number(),
              humidity: z.number(),
              rainfallVolume: z.number()
            })
          ),
          404: z.object({
            error: z.string()
          })
        },
        params: z.object({ id: z.string() })
      }
    },
    async (request, reply) => {
      const id = Number(request.params.id);

      const readings = await prisma.reading.findMany({
        orderBy: {
          dateTime: 'desc'
        },
        select: {
          station: {
            select: {
              name: true
            }
          },
          dateTime: true,
          temperature: true,
          humidity: true,
          rainfallVolume: true
        },
        where: { station: { id } }
      });

      if (!readings) {
        return reply.code(404).send({ error: 'Nenhuma leitura da estação foi encontrada' });
      }

      const response = readings.map((r) => ({
        name: r.station.name,
        dateTime: r.dateTime,
        temperature: r.temperature,
        humidity: r.humidity,
        rainfallVolume: r.rainfallVolume
      }));

      return reply.code(200).send(response);
    }
  );
}
