import morgan from 'morgan';

// Custom token for morgan
morgan.token('timestamp', () => {
  return new Date().toISOString();
});

// Morgan middleware with custom format
export const morganMiddleware = morgan(':timestamp :method :url :status :response-time ms');
