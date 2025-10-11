'use client';

import { signIn, getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, Zap, Globe } from 'lucide-react';

export default function SignIn() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already signed in
    getSession().then((session) => {
      if (session) {
        router.push('/');
      }
    });
  }, [router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signIn('google', { 
        callbackUrl: '/',
        redirect: false 
      });
      
      if (result?.ok) {
        router.push('/');
      } else if (result?.error) {
        console.error('Sign in error:', result.error);
      }
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = () => {
    // For demo purposes, redirect without auth
    router.push('/?demo=true');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Human-Rooted Segmentation Studio</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Build personas from human needs, culture, and economics
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="flex flex-col items-center p-4">
              <Users className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-medium">Cultural Insights</h3>
              <p className="text-sm text-muted-foreground">Language, communication, regional preferences</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <Globe className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-medium">Economic Analysis</h3>
              <p className="text-sm text-muted-foreground">Income, profession, financial behaviors</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <Zap className="w-8 h-8 text-purple-600 mb-2" />
              <h3 className="font-medium">AI Generation</h3>
              <p className="text-sm text-muted-foreground">Smart persona creation with insights</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <Shield className="w-8 h-8 text-orange-600 mb-2" />
              <h3 className="font-medium">Ethical Framework</h3>
              <p className="text-sm text-muted-foreground">No discriminatory targeting</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sign In with Google</CardTitle>
              <CardDescription>
                Use your Google account to access all features including workspace collaboration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleGoogleSignIn} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Signing in...' : 'Continue with Google'}
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                We only access your basic profile information (email, name). No Gmail data.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Try Demo Mode</CardTitle>
              <CardDescription>
                Explore the platform without signing up. Limited to single-user experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleDemoMode}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Continue as Demo User
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                Demo mode doesn't save data permanently or support collaboration features.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            By signing in, you agree to our ethical guidelines and privacy practices.
          </p>
        </div>
      </div>
    </div>
  );
}