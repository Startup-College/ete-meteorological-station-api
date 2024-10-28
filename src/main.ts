import fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { exampleRoute } from './routes/example-route';

const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(exampleRoute);

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP server running');
});
