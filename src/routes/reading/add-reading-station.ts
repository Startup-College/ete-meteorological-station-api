import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

// Cache por token
const lastReadingCache: Map<
  string,
  {
    timestamp: Date;
    temperature: number;
    humidity: number;
    rainfallVolume: number;
  }
> = new Map();

export function addReadingStation(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/readings',
    {
      schema: {
        summary: 'Adicionar leitura da estação',
        tags: ['reading'],
        body: z.object({
          token: z.string().uuid(),
          temperature: z.number(),
          humidity: z.number(),
          rainfallVolume: z.number()
        }),
        response: {
          201: z.object({
            message: z.string()
          }),
          400: z.object({
            error: z.string()
          }),
          404: z.object({
            error: z.string()
          })
        }
      }
    },
    async (request, reply) => {
      const { token, temperature, humidity, rainfallVolume } = request.body;
      const now = new Date();

      const lastReading = lastReadingCache.get(token);

      if (lastReading) {
        const isDuplicate =
          lastReading.temperature === temperature &&
          lastReading.humidity === humidity &&
          lastReading.rainfallVolume === rainfallVolume;

        const isWithin5Minutes = now.getTime() - lastReading.timestamp.getTime() < 5 * 60 * 1000;

        if (isDuplicate && isWithin5Minutes) {
          return reply.status(400).send({ error: 'Leitura repetida dentro de 5 minutos' });
        }
      }

      const station = await prisma.station.findFirst({
        where: { token }
      });

      if (!station) {
        return reply.status(404).send({ error: 'Estação não encontrada para o token fornecido' });
      }

      const { id: stationId } = station;

      await prisma.reading.create({
        data: {
          stationId,
          temperature,
          humidity,
          rainfallVolume
        }
      });

      lastReadingCache.set(token, {
        timestamp: now,
        temperature,
        humidity,
        rainfallVolume
      });

      return reply.status(201).send({ message: 'Leitura registrada com sucesso' });
    }
  );
}
