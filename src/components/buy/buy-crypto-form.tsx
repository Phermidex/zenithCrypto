"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cryptoAssets, creditCards } from "@/lib/data";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const buySchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  crypto: z.string().min(1, { message: "Please select a cryptocurrency." }),
  card: z.string().min(1, { message: "Please select a payment method." }),
});

export default function BuyCryptoForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof buySchema>>({
    resolver: zodResolver(buySchema),
    defaultValues: {
      amount: undefined,
      crypto: "",
      card: creditCards.find(c => c.isDefault)?.id || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof buySchema>) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);

    // Example error handling:
    // const success = Math.random() > 0.2;
    // if (!success) {
    //   toast({
    //     variant: "destructive",
    //     title: "Purchase Failed",
    //     description: "There was a problem with your purchase. Please try again.",
    //   })
    //   return;
    // }

    setIsSuccess(true);
     toast({
        title: "Purchase Successful",
        description: `Your purchase of ${form.getValues('crypto').toUpperCase()} was successful.`,
     })
  };
  
  const resetForm = () => {
    form.reset({ amount: undefined, crypto: '', card: creditCards.find(c => c.isDefault)?.id || ''});
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="crypto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cryptocurrency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a crypto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cryptoAssets.map(asset => (
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a card" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {creditCards.map(card => (
                        <SelectItem key={card.id} value={card.id}>
                          {card.brand} ending in {card.last4}
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
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
    </Card>
  );
}
