import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from 'fastify-type-provider-zod';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

import { exampleRoute } from './routes/example-route';

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

app.register(exampleRoute);

app.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log('HTTP server running');
});
