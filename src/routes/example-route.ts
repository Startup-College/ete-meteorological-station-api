import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

export function exampleRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/example-create',
    {
      schema: {
        summary: 'criar exemplo',
        tags: ['example'],
        body: z.object({
          title: z.string().min(4),
          details: z.string().nullable(),
          quantity: z.number().int().positive().nullable()
        }),
        response: {
          201: z.object({
            id: z.string().uuid()
          })
        }
      }
    },
    async (request, reply) => {
      const { title, details, quantity } = request.body;

      console.log(`
      title: ${title} 
      details: ${details}
      quantity: ${quantity}`);

      const id = crypto.randomUUID().toString();

      return reply.status(201).send({ id });
    }
  );
}
