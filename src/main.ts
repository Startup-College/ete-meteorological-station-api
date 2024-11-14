import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from 'fastify-type-provider-zod';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

import { createStation } from './routes/station/create-station';
import { addReadingStation } from './routes/reading/add-reading-station';
import { getLastReadingByStation } from './routes/reading/get-last-reading-by-station';
import { readingsByStation } from './routes/reading/readings-by-station';

const app = fastify();

app.register(fastifyCors, {
  origin: '*'
});

app.register(fastifySwagger, {
  swagger: {
    consumes: ['application/json'],
    produces: ['application/json'],
    info: {
      title: 'ETE - Estação de Monitoramento Modular (ETE - EMM)',
      description: 'Especificação da API ETE - EMM',
      version: '1.0.0'
    }
  },
  transform: jsonSchemaTransform
});

app.register(fastifySwaggerUi, {
  routePrefix: '/'
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createStation, { prefix: 'api/v1' });
app.register(addReadingStation, { prefix: 'api/v1' });
app.register(getLastReadingByStation, { prefix: 'api/v1' });
app.register(readingsByStation, { prefix: 'api/v1' });

app.listen({ port: parseInt(process.env.PORT || '3333'), host: process.env.HOST || '0.0.0.0' }, (err) => {
  if (err) {
    throw new Error(err.message);
  }

  const address = app.server.address();

  if (address && typeof address === 'object') {
    console.log(`Server listening on http://localhost:${address.port}`);
  } else {
    console.log(`Server started but couldn't determine the address.`);
  }
});
