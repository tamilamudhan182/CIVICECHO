import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dashboardRoutes from './routes/dashboard.routes';
import issuesRoutes from './routes/issues.routes';
import walletRoutes from './routes/wallet.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import authorityRoutes from './routes/authority.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/user', dashboardRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/authority', authorityRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Civic Echo API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
