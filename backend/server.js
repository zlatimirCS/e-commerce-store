import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import { connectDB } from './db/connectDB.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  connectDB(process.env.MONGO_URI);
  console.log(`server is running on port ${PORT}`);
});
