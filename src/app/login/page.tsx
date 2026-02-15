'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Please enter your password.' }),
});

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (!isUserLoading && user) {
        router.replace('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      if(!auth) {
        throw new Error("Auth service not available");
      }
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: 'Login Successful', description: "Welcome back!" });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login failed:', error);
      let description = 'An unknown error occurred.';
      if (error.code === 'auth/invalid-credential') {
        description = 'Invalid email or password. Please check your credentials and try again.';
      } else {
        description = error.message;
      }
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: description,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUserLoading || user) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 dark">
        <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-semibold text-foreground">Zenith Crypto Wallet</h1>
        </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your wallet.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@zenith.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isSubmitting || !auth}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/signup" className="font-medium text-primary hover:underline">
                  Sign Up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
