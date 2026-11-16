import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabase.service';

const router = Router();

// GET /leaderboard
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    // We sort by total_points DESC
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, total_points, badge_level')
      .order('total_points', { ascending: false })
      .limit(50); // Top 50

    if (error) return res.status(500).json({ error: error.message });

    return res.json(users);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
