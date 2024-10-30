import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export function getLastReadingsByStation(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/last-readings-by-station',
    {
      schema: {
        summary: 'Listar últimas leituras de cada estação',
        tags: ['reading'],
        response: {
          200: z.array(
            z.object({
              stationId: z.string(),
              stationName: z.string(),
              dateTime: z.string(), // ISO string format
              temperature: z.number(),
              humidity: z.number(),
              rainfallVolume: z.number()
            })
          )
        }
      }
    },
    async (request, reply) => {
      const lastReadings = await prisma.reading.findMany({
        distinct: ['stationId'],
        orderBy: {
          dateTime: 'desc'
        },
        select: {
          stationId: true,
          station: {
            select: {
              name: true
            }
          },
          dateTime: true,
          temperature: true,
          humidity: true,
          rainfallVolume: true
        }
      });

      const formattedReadings = lastReadings.map((reading) => ({
        stationId: reading.stationId,
        stationName: reading.station.name,
        dateTime: reading.dateTime.toISOString(),
        temperature: reading.temperature,
        humidity: reading.humidity,
        rainfallVolume: reading.rainfallVolume
      }));

      return reply.code(200).send(formattedReadings);
    }
  );
}
