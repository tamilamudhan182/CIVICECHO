import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabase.service';

const router = Router();

// GET /user/:id/metrics
router.get('/:id/metrics', async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    // Fetch user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('total_points, badge_level')
      .eq('id', id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch issues counts
    const { data: issues, error: issuesError } = await supabase
      .from('civic_issues')
      .select('status')
      .eq('user_id', id);

    if (issuesError) {
      return res.status(500).json({ error: 'Failed to fetch user issues metrics' });
    }

    const reported = issues.length;
    const resolved = issues.filter(issue => issue.status === 'Resolved').length;

    return res.json({
      metrics: {
        totalPoints: user.total_points || 0,
        badgeLevel: user.badge_level || 'Beginner',
        issuesReported: reported,
        issuesResolved: resolved,
      }
    });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
