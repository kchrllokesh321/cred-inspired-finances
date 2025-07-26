import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UsernameEntryProps {
  onSuccess: (userId: string, username: string) => void;
}

export const UsernameEntry: React.FC<UsernameEntryProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    // Basic validation
    if (username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error('Username can only contain letters, numbers, and underscores');
      return;
    }

    setLoading(true);

    try {
      // First, sign in anonymously to create auth session
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously({
        options: {
          data: {
            username: username.trim()
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user created');

      // Now find or create the profile with the authenticated user
      const { data: userId, error: userError } = await supabase.rpc('find_or_create_user_by_username', {
        input_username: username.trim()
      });

      if (userError) throw userError;
      if (!userId) throw new Error('No user ID returned');

      // Store username in localStorage for UI purposes
      localStorage.setItem('username', username.trim());
      localStorage.setItem('userId', userId as string);
      
      toast.success('Welcome!');
      onSuccess(userId, username.trim());
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create/find user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome!</CardTitle>
          <CardDescription>
            Enter a username to get started. This will be your unique identifier.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !username.trim()}>
              {loading ? 'Setting up...' : 'Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};