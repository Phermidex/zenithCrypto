"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useMemo } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, runTransaction } from "firebase/firestore";
import type { CryptocurrencyType, Transaction, UserWallet } from "@/lib/firebase-types";
import { cryptoAssets } from '@/lib/data';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const sendSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  crypto: z.string().min(1, { message: "Please select a cryptocurrency." }),
  recipientEmail: z.string().email({ message: "Please enter a valid email." }),
});

export default function SendCryptoForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const cryptoTypes = cryptoAssets;
  const isLoadingCrypto = false;

  const userWalletsQuery = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'users', user.uid, 'wallets') : null),
    [user, firestore]
  );
  const { data: userWallets, isLoading: isLoadingWallets } = useCollection<UserWallet>(userWalletsQuery);

  const form = useForm<z.infer<typeof sendSchema>>({
    resolver: zodResolver(sendSchema),
    defaultValues: {
      amount: "",
      crypto: "",
      recipientEmail: "",
    },
  });

  const { walletOptions } = useMemo(() => {
    if (!userWallets || !cryptoTypes) {
      return { walletOptions: [] };
    }
    const cryptoMap = new Map(cryptoTypes.map(ct => [ct.id, ct]));
    const options = userWallets
      .map(wallet => {
        const details = cryptoMap.get(wallet.cryptocurrencyTypeId);
        return details ? { ...wallet, details } : null;
      })
      .filter(Boolean);

    return { walletOptions: options };
  }, [userWallets, cryptoTypes]);

  const selectedCryptoId = form.watch('crypto');
  const selectedWallet = walletOptions.find(w => w?.cryptocurrencyTypeId === selectedCryptoId);
  
  // This is a simplified mock price. In a real app, you'd fetch this from an API.
  const getPrice = (symbol: string) => (symbol === 'BTC' ? 60000 : symbol === 'ETH' ? 3000 : 150) + (Math.random() - 0.5) * 500;


  const onSubmit = async (values: z.infer<typeof sendSchema>) => {
    setIsSubmitting(true);
    if (!user || !firestore) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to send crypto." });
        setIsSubmitting(false);
        return;
    }
    
    if (!selectedWallet || values.amount > selectedWallet.balance) {
        form.setError("amount", { type: "manual", message: "Insufficient balance." });
        setIsSubmitting(false);
        return;
    }

    const price = getPrice(selectedWallet.details.symbol);
    const fiatAmount = values.amount * price;
    
    const walletRef = doc(firestore, 'users', user.uid, 'wallets', selectedWallet.cryptocurrencyTypeId);
    const transactionRef = doc(collection(firestore, 'users', user.uid, 'transactions'));

    try {
        await runTransaction(firestore, async (transaction) => {
            const walletDoc = await transaction.get(walletRef);
            if (!walletDoc.exists() || walletDoc.data().balance < values.amount) {
                throw new Error("Insufficient balance.");
            }
            
            const newBalance = walletDoc.data().balance - values.amount;
            transaction.update(walletRef, { balance: newBalance, updatedAt: new Date().toISOString() });

            const transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
                userId: user.uid,
                cryptocurrencyTypeId: selectedWallet.cryptocurrencyTypeId,
                type: 'send',
                cryptoAmount: values.amount,
                fiatAmount: fiatAmount,
                fiatCurrency: 'USD',
                status: 'completed',
                recipientEmail: values.recipientEmail,
                transactionDate: new Date().toISOString(),
                externalTransactionId: `pp_${Math.random().toString(36).substr(2, 9)}`, // Mock PayPal ID
            };

            transaction.set(transactionRef, transactionData);
        });

        setIsSubmitting(false);
        setIsSuccess(true);
        toast({
            title: "Send Successful",
            description: `You sent ${values.amount} ${selectedWallet.details.symbol}.`,
        });

    } catch (e: any) {
        console.error("Transaction failed: ", e);
        setIsSubmitting(false);
        toast({
            variant: "destructive",
            title: "Send Failed",
            description: e.message || "There was a problem with your transaction. Please try again.",
        });
    }
  };
  
  const resetForm = () => {
    form.reset();
    setIsSuccess(false);
  }

  if (isSuccess) {
    return (
        <Card className="w-full max-w-md bg-card/50 border-border/50">
            <CardHeader className="items-center text-center p-8">
                <CheckCircle className="h-16 w-16 text-primary mb-4" />
                <CardTitle className="text-2xl">Send Successful!</CardTitle>
                <CardDescription>
                    Your funds have been sent to the recipient.
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <Button className="w-full" onClick={resetForm}>
                    Make another transaction
                </Button>
            </CardFooter>
        </Card>
    )
  }

  return (
    <Card className="w-full max-w-md bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle>Send Cryptocurrency</CardTitle>
        <CardDescription>Send crypto to another user via email.</CardDescription>
      </CardHeader>
      {(isLoadingCrypto || isLoadingWallets) ? (
          <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
          </CardContent>
      ) : (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="crypto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset to send</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={walletOptions.length === 0}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select from your wallet" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {walletOptions?.map(wallet => wallet && (
                        <SelectItem key={wallet.id} value={wallet.cryptocurrencyTypeId}>
                          {wallet.details.name} ({wallet.balance.toLocaleString()} {wallet.details.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" placeholder="0.0" {...field} />
                  </FormControl>
                  {selectedWallet && <FormDescription>
                    Balance: {selectedWallet.balance.toLocaleString()} {selectedWallet.details.symbol}
                  </FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recipientEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient&apos;s PayPal Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="recipient@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting || !user}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                Send
                <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
      )}
    </Card>
  );
}
