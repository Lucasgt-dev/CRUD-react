import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { connectDB } from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import clientsRoutes from './routes/clients.routes.js';
import productsRoutes from './routes/products.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

dotenv.config();

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function matchesAllowedOrigin(origin) {
  return allowedOrigins.some((allowedOrigin) => {
    if (allowedOrigin.includes('*')) {
      const pattern = allowedOrigin
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\\\*/g, '.*');

      return new RegExp(`^${pattern}$`).test(origin);
    }

    return allowedOrigin === origin;
  });
}

app.use(cors({
  origin(origin, callback) {
    if (!origin || matchesAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origem não permitida pelo CORS'));
  }
}));

app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ message: 'API rodando' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
});
