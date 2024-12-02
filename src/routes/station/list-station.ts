import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { string, z } from 'zod';
import { prisma } from '../../lib/prisma';

export function listStation(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/stations',
    {
      schema: {
        summary: 'Listar estações',
        tags: ['station'],
        response: {
          200: z.array(
            z.object({
              id: z.number(),
              name: z.string(),
              latitude: z.string().nullable(),
              longitude: z.string().nullable(),
              lastReading: z
                .object({
                  dateTime: z.date(),
                  temperature: z.number(),
                  humidity: z.number(),
                  rainfallVolume: z.number()
                })
                .nullable(),
              weather: z.object({
                icon: z.string(),
                description: z.string()
              })
            })
          ),
          404: z.object({ error: z.string() }),
          500: z.object({ error: string() })
        }
      }
    },
    async (request, reply) => {
      try {
        const stations = await prisma.station.findMany({
          select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
            readings: {
              orderBy: { dateTime: 'desc' },
              select: {
                dateTime: true,
                temperature: true,
                humidity: true,
                rainfallVolume: true
              }
            }
          }
        });

        if (stations.length === 0) {
          reply.status(404).send({ error: 'Nenhuma estação encontrada' });
        }

        const response = stations.map((station) => {
          let icon = '';
          let description = '';

          const hour = new Date(station.readings[0].dateTime).getHours();
          const isDaytime = hour >= 6 && hour < 18;

          if (station.readings[0]?.rainfallVolume > 0) {
            icon = isDaytime ? '/public/assets/icons/cloud-sun-rain.svg' : '/public/assets/icons/night-rain.svg';
            description = 'Chuva';
          } else if (station.readings[0]?.temperature > 30) {
            icon = isDaytime ? '/public/assets/icons/day-sunny.svg' : '/public/assets/icons/night-clear.svg';
            description = isDaytime ? 'Ensolarado' : 'Céu limpo';
          } else {
            icon = '/public/assets/icons/cloudy.svg';
            description = 'Nublado';
          }

          return {
            id: station.id,
            name: station.name,
            latitude: station.latitude,
            longitude: station.longitude,
            lastReading: station.readings[0] || null,
            weather: {
              icon,
              description
            }
          };
        });

        reply.status(200).send(response);
      } catch (error) {
        console.error(error);
        reply.status(500).send({ error: 'Erro interno no servidor' });
      }
    }
  );
}
