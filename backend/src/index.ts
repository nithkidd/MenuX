import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './shared/middleware/error.middleware.js';
import morgan from 'morgan';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes
app.use('/api/v1', routes);

// Swagger Documentation
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MenuBuilder API running on http://localhost:${PORT}`);
  console.log(`📖 Health check: http://localhost:${PORT}/api/v1/health`);
});

export default app;
