import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export function getLastReadingByStation(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/last-reading-by-station/:stationId',
    {
      schema: {
        summary: 'Obter a última leitura da estação',
        tags: ['reading'],
        response: {
          200: z.object({
            stationId: z.string().uuid(),
            stationName: z.string(),
            dateTime: z.date(),
            temperature: z.number(),
            humidity: z.number(),
            rainfallVolume: z.number(),
            weather: z.object({
              icon: z.string(),
              description: z.string()
            })
          }),
          404: z.object({
            error: z.string()
          })
        },
        params: z.object({ stationId: z.string().uuid() })
      }
    },
    async (request, reply) => {
      const { stationId } = request.params;

      const lastReading = await prisma.reading.findFirst({
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
        },
        where: { stationId }
      });

      if (!lastReading) {
        return reply.code(404).send({ error: 'Nenhuma leitura da estação foi encontrada' });
      }

      let icon = '';
      let description = '';

      const hour = new Date(lastReading.dateTime).getHours();
      const isDaytime = hour >= 6 && hour < 18;

      if (lastReading.rainfallVolume > 0) {
        icon = isDaytime ? 'icone de dia + chuva' : 'icone de noite + chuva';
        description = 'Chuva';
      } else if (lastReading.temperature > 30) {
        icon = isDaytime ? 'icone de dia bem ensolarado' : 'icone de noite com o céu limpo';
        description = isDaytime ? 'Ensolarado' : 'Céu limpo';
      } else {
        icon = 'icone de nublado';
        description = 'Nublado';
      }

      const formattedReading = {
        stationId: lastReading.stationId,
        stationName: lastReading.station.name,
        dateTime: lastReading.dateTime,
        temperature: lastReading.temperature,
        humidity: lastReading.humidity,
        rainfallVolume: lastReading.rainfallVolume,
        weather: {
          icon,
          description
        }
      };

      return reply.code(200).send(formattedReading);
    }
  );
}
