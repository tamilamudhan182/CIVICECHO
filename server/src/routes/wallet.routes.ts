import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabase.service';

const router = Router();

// GET /wallet/:userId
router.get('/:userId', async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('total_points, badge_level')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      balance: user.total_points || 0,
      badge: user.badge_level || 'Beginner'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /wallet/:userId/transactions
router.get('/:userId/transactions', async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;

    const { data: transactions, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    return res.json(transactions);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /wallet/:userId/redeem
router.post('/:userId/redeem', async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;
    const { amount, description } = req.body;

    // Validate balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('total_points')
      .eq('id', userId)
      .single();

    if (userError || !user) return res.status(404).json({ error: 'User not found' });

    if (user.total_points < amount) {
      return res.status(400).json({ error: 'Insufficient points to redeem' });
    }

    // Process redemption
    const newTotal = user.total_points - amount;

    // Update DB
    const { error: txError } = await supabase.from('wallet_transactions').insert({
      user_id: userId,
      amount: -amount, // Negative for redemption
      type: 'redeem',
      description: `Rewards Redemption: ${description}`
    });

    if (txError) throw new Error('Failed to record transaction');

    const { error: updateError } = await supabase
      .from('users')
      .update({ total_points: newTotal })
      .eq('id', userId);

    if (updateError) throw new Error('Failed to update total points');

    return res.json({ success: true, newBalance: newTotal });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
