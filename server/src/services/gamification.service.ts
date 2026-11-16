import { supabase } from './supabase.service';

export const awardPoints = async (userId: string, points: number, issueId: string, description: string) => {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('total_points, badge_level')
    .eq('id', userId)
    .single();

  if (userError || !user) throw new Error('User not found');

  const newTotal = (user.total_points || 0) + points;
  let newBadge = user.badge_level;

  // Simple Gamification Leveling
  if (newTotal > 1000) newBadge = 'Civic Hero';
  else if (newTotal > 500) newBadge = 'Community Leader';
  else if (newTotal > 100) newBadge = 'Active Citizen';
  else newBadge = 'Beginner';

  // 1. Log transaction
  const { error: txError } = await supabase.from('wallet_transactions').insert({
    user_id: userId,
    amount: points,
    type: 'earn',
    description: `Awarded for issue resolution - ${description}`,
  });

  if (txError) throw new Error('Failed to record transaction');

  // 2. Update user
  const { error: updateError } = await supabase
    .from('users')
    .update({ total_points: newTotal, badge_level: newBadge })
    .eq('id', userId);

  if (updateError) throw new Error('Failed to update total points');

  return { newTotal, newBadge };
};
