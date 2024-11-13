import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export function readingsByStation(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/readings-by-station/:stationId',
    {
      schema: {
        summary: 'Listar últimas leituras de cada estação',
        tags: ['reading'],
        response: {
          200: z.array(
            z.object({
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
            })
          ),
          404: z.object({
            error: z.string()
          })
        },
        params: z.object({ stationId: z.string().uuid() })
      }
    },
    async (request, reply) => {
      const { stationId } = request.params;

      const lastReadings = await prisma.reading.findMany({
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

      if (!lastReadings) {
        return reply.code(404).send({ error: 'Nenhuma leitura da estação foi encontrada' });
      }

      const formattedReadings = lastReadings.map((reading) => {
        let icon = '';
        let description = '';

        const hour = new Date(reading.dateTime).getHours();
        const isDaytime = hour >= 6 && hour < 18;

        if (reading.rainfallVolume > 0) {
          icon = isDaytime ? 'icone de dia com chuva' : 'icone de noite com chuva';
          description = 'Chuva';
        } else if (reading.temperature > 30) {
          icon = isDaytime ? 'icone de dia Ensolarado' : 'icone de noite céu limpo';
          description = isDaytime ? 'Ensolarado' : 'Céu limpo';
        } else {
          icon = 'icone de nublado';
          description = 'Nublado';
        }

        return {
          stationId: reading.stationId,
          stationName: reading.station.name,
          dateTime: reading.dateTime,
          temperature: reading.temperature,
          humidity: reading.humidity,
          rainfallVolume: reading.rainfallVolume,
          weather: {
            icon,
            description
          }
        };
      });

      return reply.code(200).send(formattedReadings);
    }
  );
}
