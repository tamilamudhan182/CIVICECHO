import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabase.service';
import { analyzeIssue } from '../services/ai.service';
import { awardPoints } from '../services/gamification.service';

const router = Router();

// GET /issues?location=:geo
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const { location } = req.query;
    
    let query = supabase.from('civic_issues').select('*').order('created_at', { ascending: false });
    
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

// POST /issues
router.post('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId, location, description, category, evidenceUrl } = req.body;

    const { data, error } = await supabase
      .from('civic_issues')
      .insert({
        user_id: userId,
        location,
        description, // Description isn't in original schema req but useful for AI
        category: category || 'Other',
        evidence_url: evidenceUrl,
        status: 'Pending',
        urgency: 'Low', // Defaults before AI analysis
        sentiment: 'Neutral',
        priority_score: 10
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /issues/:id/analyze
router.post('/:id/analyze', async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    // 1. Fetch issue
    const { data: issue, error: fetchErr } = await supabase
      .from('civic_issues')
      .select('description, evidence_url')
      .eq('id', id)
      .single();

    if (fetchErr || !issue) return res.status(404).json({ error: 'Issue not found' });

    // 2. Run AI logic
    const analysis = await analyzeIssue(issue.description || '', issue.evidence_url);

    // 3. Update issue in DB
    const { data: updatedIssue, error: updateErr } = await supabase
      .from('civic_issues')
      .update({
        urgency: analysis.urgency,
        sentiment: analysis.sentiment,
        category: analysis.category,
        priority_score: analysis.priorityScore
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) return res.status(500).json({ error: updateErr.message });

    // In a real system, you might emit a WebSocket event or Kafka message here to notify authority dashboard
    
    return res.json(updatedIssue);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /issues/:id/status
router.patch('/:id/status', async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate Status
    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
    if (!validStatuses.includes(status)) {
       return res.status(400).json({ error: 'Invalid status update' });
    }

    // Update Issue
    const { data: issue, error } = await supabase
      .from('civic_issues')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // If resolved, award civic points to user
    if (status === 'Resolved' && issue.user_id) {
       try {
          // Award 50 base points + priority bonus
          const pointsEarned = 50 + Math.round(issue.priority_score / 2);
          await awardPoints(issue.user_id, pointsEarned, issue.id, `Resolved issue in ${issue.location}`);
       } catch (rewardErr) {
          console.error("Failed to reward points on resolution:", rewardErr);
       }
    }

    return res.json(issue);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
