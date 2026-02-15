"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, runTransaction, getDoc } from "firebase/firestore";
import type { CryptocurrencyType, CreditCard as CreditCardType, Transaction, UserWallet } from "@/lib/firebase-types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const buySchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  crypto: z.string().min(1, { message: "Please select a cryptocurrency." }),
  card: z.string().min(1, { message: "Please select a payment method." }),
});

export default function BuyCryptoForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const cryptoTypesQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'cryptocurrencyTypes') : null), [firestore]);
  const { data: cryptoTypes, isLoading: isLoadingCrypto } = useCollection<CryptocurrencyType>(cryptoTypesQuery);

  const cardsQuery = useMemoFirebase(() => (user && firestore ? collection(firestore, 'users', user.uid, 'creditCards') : null), [user, firestore]);
  const { data: userCards, isLoading: isLoadingCards } = useCollection<CreditCardType>(cardsQuery);

  const form = useForm<z.infer<typeof buySchema>>({
    resolver: zodResolver(buySchema),
    defaultValues: {
      amount: undefined,
      crypto: "",
      card: "",
    },
  });

  useEffect(() => {
    if (userCards) {
        const defaultCard = userCards.find(c => c.isDefault);
        if (defaultCard) {
            form.setValue('card', defaultCard.id);
        } else if (userCards.length > 0) {
            form.setValue('card', userCards[0].id);
        }
    }
  }, [userCards, form]);

  const onSubmit = async (values: z.infer<typeof buySchema>) => {
    setIsSubmitting(true);
    if (!user || !firestore) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to make a purchase." });
        setIsSubmitting(false);
        return;
    }

    const { amount, crypto: cryptoId, card: cardId } = values;
    const selectedCrypto = cryptoTypes?.find(c => c.id === cryptoId);
    
    if (!selectedCrypto) {
        toast({ variant: "destructive", title: "Invalid Cryptocurrency", description: "Please select a valid crypto asset." });
        setIsSubmitting(false);
        return;
    }
    
    // This is a simplified mock price. In a real app, you'd fetch this from an API.
    const price = (selectedCrypto.symbol === 'BTC' ? 60000 : selectedCrypto.symbol === 'ETH' ? 3000 : 150) + (Math.random() - 0.5) * 500;
    const cryptoAmount = amount / price;

    const walletRef = doc(firestore, 'users', user.uid, 'wallets', cryptoId);
    const transactionRef = doc(collection(firestore, 'users', user.uid, 'transactions'));

    try {
        await runTransaction(firestore, async (transaction) => {
            const walletDoc = await transaction.get(walletRef);
            
            let newBalance = cryptoAmount;
            if (walletDoc.exists()) {
                newBalance += walletDoc.data().balance;
            }

            const walletData: Partial<UserWallet> = {
                balance: newBalance,
                userId: user.uid,
                cryptocurrencyTypeId: cryptoId,
                updatedAt: new Date().toISOString(),
            };

            if (!walletDoc.exists()) {
                walletData.createdAt = new Date().toISOString();
                walletData.id = walletRef.id;
            }

            transaction.set(walletRef, walletData, { merge: true });

            const transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
                userId: user.uid,
                cryptocurrencyTypeId: cryptoId,
                creditCardId: cardId,
                type: 'buy',
                cryptoAmount: cryptoAmount,
                fiatAmount: amount,
                fiatCurrency: 'USD',
                status: 'completed',
                transactionDate: new Date().toISOString(),
            };

            transaction.set(transactionRef, transactionData);
        });

        setIsSubmitting(false);
        setIsSuccess(true);
        toast({
            title: "Purchase Successful",
            description: `Your purchase of ${selectedCrypto.symbol} was successful.`,
        });

    } catch (e: any) {
        console.error("Transaction failed: ", e);
        setIsSubmitting(false);
        toast({
            variant: "destructive",
            title: "Purchase Failed",
            description: e.message || "There was a problem with your purchase. Please try again.",
        });
    }
  };
  
  const resetForm = () => {
    form.reset({ amount: undefined, crypto: '', card: userCards?.find(c => c.isDefault)?.id || userCards?.[0]?.id || ''});
    setIsSuccess(false);
  }

  if (isSuccess) {
    return (
        <Card className="w-full max-w-md bg-card/50 border-border/50">
            <CardHeader className="items-center text-center p-8">
                <CheckCircle className="h-16 w-16 text-primary mb-4" />
                <CardTitle className="text-2xl">Purchase Successful!</CardTitle>
                <CardDescription>
                    Your crypto has been added to your wallet.
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <Button className="w-full" onClick={resetForm}>
                    Make another purchase
                </Button>
            </CardFooter>
        </Card>
    )
  }

  return (
    <Card className="w-full max-w-md bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle>Purchase Cryptocurrency</CardTitle>
        <CardDescription>Select crypto and amount to purchase.</CardDescription>
      </CardHeader>
      {(isLoadingCrypto || isLoadingCards) ? (
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
                  <FormLabel>Cryptocurrency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!cryptoTypes}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a crypto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cryptoTypes?.map(asset => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name} ({asset.symbol})
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
                  <FormLabel>Amount (USD)</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                        <Input type="number" placeholder="100.00" className="pl-7" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="card"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pay with</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!userCards}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a card" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {userCards?.map(card => (
                        <SelectItem key={card.id} value={card.id}>
                          {card.brand} ending in {card.lastFourDigits}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                Purchase
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
