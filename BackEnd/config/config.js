import dotenv from 'dotenv';

dotenv.config();

const config = {
  app: {
    port: process.env.APP_PORT || 5000,
    host: process.env.APP_HOST || 'localhost',
    env: process.env.NODE_ENV || 'development',
  },
  db: {
    uri: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  cors: {
    origins: [
      'http://localhost:3000',
      'https://localhost:3000',
      'https://c789-14-169-250-93.ngrok-free.app/',
      'https://melodyhub1.vercel.app'
    ],
    credentials: true,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
};

export default config;