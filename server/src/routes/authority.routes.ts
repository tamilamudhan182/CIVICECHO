import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabase.service';

const router = Router();

// GET /authority/issues
router.get('/issues', async (req: Request, res: Response): Promise<any> => {
  try {
    // You might optionally add query parameters for explicit zones or statuses
    const { location } = req.query;

    let query = supabase
      .from('civic_issues')
      .select('*, users(username)')
      .order('priority_score', { ascending: false }); // AI prioritized descending

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    const { data: issues, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    
    return res.json(issues);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
