import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from 'fastify-type-provider-zod';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

import { createStation } from './routes/station/create-station';
import { addReadingStation } from './routes/reading/add-reading-station';
import { readingsByStation } from './routes/reading/readings-by-station';
import { listStation } from './routes/station/list-station';
import { registerUser } from './routes/user/register-user';
import { loginUser } from './routes/user/login-user';
import fastifyStatic from '@fastify/static';
import { join } from 'path';
import { getTokenByStationId } from './routes/user/operation-users';

const app = fastify();

app.register(fastifyCors, {
  origin: '*'
});

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'ETE - Estação de Monitoramento Modular (ETE - EMM)',
      description: 'Especificação da API ETE - EMM',
      version: '1.0.0'
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },

  transform: jsonSchemaTransform
});

app.register(fastifySwaggerUi, {
  routePrefix: '/'
});

app.get('/admin', async (request, reply) => {
  return reply.sendFile('index.html');
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyStatic, {
  root: join(__dirname, '../public'),
  prefix: '/public/'
});

// API user
app.register(registerUser, { prefix: 'api/v1' });
app.register(loginUser, { prefix: 'api/v1' });
app.register(getTokenByStationId, { prefix: 'api/v1' });

// API station
app.register(createStation, { prefix: 'api/v1' });
app.register(listStation, { prefix: 'api/v1' });

// API Reading
app.register(addReadingStation, { prefix: 'api/v1' });
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
