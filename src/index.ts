import dotenv from 'dotenv';
import express from 'express';
import userRoutes from './routes/userRoutes';
import { createDbConnection } from './utils/db';

dotenv.config();
const app = express();
app.use(express.json());

const startServer = async () => {
  try {
    const db = await createDbConnection();
    // Set up the database connection in the app locals
    // This allows you to access the database connection in your routes
    app.locals.db = db;  

    app.use('/users', userRoutes);

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to DB:', error);
    process.exit(1);
  }
};

startServer();
