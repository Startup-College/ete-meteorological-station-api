import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { string, z } from 'zod';
import { prisma } from '../../lib/prisma';

export function listStation(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/list-station',
    {
      schema: {
        summary: 'Listar estações',
        tags: ['station'],
        response: {
          200: z.array(
            z.object({
              name: z.string(),
              latitude: z.string(),
              longitude: z.string()
            })
          ),
          404: z.object({ error: z.string() }),
          500: z.object({ error: string() })
        }
      }
    },
    async (request, reply) => {
      try {
        const stations = await prisma.station.findMany();

        if (stations.length === 0) {
          reply.status(404).send({ error: 'Nenhuma estação encontrada' });
        } else {
          reply.status(200).send(stations);
        }
      } catch (error) {
        console.error(error);
        reply.status(500).send({ error: 'Erro interno no servidor' });
      }
    }
  );
}
