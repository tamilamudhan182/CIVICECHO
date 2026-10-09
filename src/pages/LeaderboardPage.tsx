import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import AppLayout from '@/components/AppLayout';
import { apiService, UserDTO } from '@/services/api';

const LeaderboardPage = () => {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await apiService.getUsers();
        setUsers(data);
      } catch (err) {
        console.error('Failed to load leaderboard users from Spring Boot:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-amber-500" />
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Civic Champions Leaderboard</h1>
          </div>
          <p className="text-muted-foreground mt-1">Top active citizens earning points by reporting and resolving locality issues</p>
        </motion.div>

        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Leaderboard Standings (Live from Spring Boot API)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground p-6">Loading leaderboard data...</p>
            ) : (
              <div className="space-y-3">
                {users.map((user, index) => (
                  <motion.div
                    key={user.id || user.email}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border border-border flex items-center justify-between ${
                      index === 0 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-card'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 text-center font-bold text-foreground">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      <Avatar className="h-10 w-10 border border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {user.avatarInitials || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-card-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">📍 {user.locality}, {user.district}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1 text-accent font-bold">
                          <Award className="w-4 h-4" />
                          <span>{user.points.toLocaleString()} pts</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {user.issuesReported} reported • {user.issuesResolved} resolved
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default LeaderboardPage;
