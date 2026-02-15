"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc } from "firebase/firestore";
import type { CreditCard as CreditCardType } from "@/lib/firebase-types";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, MoreVertical, Trash2, Star, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

const cardSchema = z.object({
  cardholderName: z.string().min(3, "Name must be at least 3 characters."),
  cardNumber: z.string().refine((val) => /^\d{16}$/.test(val.replace(/\s/g, '')), "Invalid 16-digit card number."),
  expiry: z.string().refine((val) => /^(0[1-9]|1[0-2])\s?\/\s?\d{2}$/.test(val), "Invalid expiry date (MM/YY)."),
  cvc: z.string().refine((val) => /^\d{3,4}$/.test(val), "Invalid CVC."),
  isDefault: z.boolean().default(false),
});

const VisaIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-8 w-12 fill-current"><title>Visa</title><path d="M7.105 15.244l-1.63-8.852h2.802l1.63 8.852zm9.364-8.852L14.45 11.7l-1.09-5.292-.022-.104H10.45l2.203 10.59h2.928l4.475-10.59zm-4.706 0h-2.73l-1.74 10.59h2.803c.001 0 1.74-10.59 1.74-10.59zm-5.02.023c-.562.002-1.01.442-1.02 1.002v.035l1.63 8.85h2.825l.43-8.887zm11.777-.023l-1.84 10.59h2.61l1.838-10.59z"/></svg>;
const MastercardIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-8 w-12 fill-current"><path d="M12 12a5.42 5.42 0 0 0 5.38-5H6.62A5.42 5.42 0 0 0 12 12zm0 1.5a5.42 5.42 0 0 1-5.38-4h10.76a5.42 5.42 0 0 1-5.38 4z"/><path d="M12 0A12 12 0 1 0 24 12 12 12 0 0 0 12 0zm0 18.5a6.5 6.5 0 1 1 6.5-6.5 6.5 6.5 0 0 1-6.5 6.5z"/></svg>;
const AmexIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-8 w-12"><g fill="none" fillRule="evenodd"><path fill="#006FCF" d="M22 19H2V5h20v14zM21 4H3C2.45 4 2 4.45 2 5v14c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1z"/><path fill="#FFF" d="M11.5 14.5h-1L9.75 16h-1.5L9.5 12l-1.25-2.5h1.5L10.5 11.5h1l.75-2h1.5L12.5 12l1.25 2.5h-1.5zM15.5 11.5h-2v-2h4v.75L15.5 14v.5h2V16h-4v-1.25L15.5 11v-.5z"/></g></svg>;

const CardIcon = ({ brand }: { brand: CreditCardType['brand'] }) => {
    if (brand === 'Visa') return <VisaIcon />;
    if (brand === 'Mastercard') return <MastercardIcon />;
    if (brand === 'Amex') return <AmexIcon />;
    return null;
}

function getCardBrand(cardNumber: string): CreditCardType['brand'] {
    if (/^4/.test(cardNumber)) return 'Visa';
    if (/^5[1-5]/.test(cardNumber)) return 'Mastercard';
    if (/^3[47]/.test(cardNumber)) return 'Amex';
    return 'Visa'; // Default
}

export default function CardManagement() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const cardsQuery = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'users', user.uid, 'creditCards') : null),
    [user, firestore]
  );
  const { data: cards, isLoading: isLoadingCards } = useCollection<CreditCardType>(cardsQuery);

  const form = useForm<z.infer<typeof cardSchema>>({
    resolver: zodResolver(cardSchema),
    defaultValues: { cardholderName: "", cardNumber: "", expiry: "", cvc: "", isDefault: false },
  });

  const onSubmit = async (values: z.infer<typeof cardSchema>) => {
    setIsSubmitting(true);
    if (!user || !firestore) {
        toast({ variant: "destructive", title: "Error", description: "User not authenticated." });
        setIsSubmitting(false);
        return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const expiryParts = values.expiry.split(/\s?\/\s?/);
    const newCardRef = doc(collection(firestore, 'users', user.uid, 'creditCards'));
    
    const newCardData: CreditCardType = {
        id: newCardRef.id,
        userId: user.uid,
        stripePaymentMethodId: `pm_${Math.random().toString(36).substr(2, 9)}`, // Mock Stripe ID
        brand: getCardBrand(values.cardNumber),
        lastFourDigits: values.cardNumber.slice(-4),
        expiryMonth: parseInt(expiryParts[0], 10),
        expiryYear: 2000 + parseInt(expiryParts[1], 10),
        isDefault: values.isDefault,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    if (values.isDefault && cards) {
      cards.forEach(c => {
        if (c.isDefault) {
          const oldDefaultCardRef = doc(firestore, 'users', user!.uid, 'creditCards', c.id);
          updateDocumentNonBlocking(oldDefaultCardRef, { isDefault: false });
        }
      });
    }

    setDocumentNonBlocking(newCardRef, newCardData, {});

    setIsSubmitting(false);
    setOpen(false);
    form.reset();
    toast({
        title: "Card Added",
        description: `Your ${newCardData.brand} card ending in ${newCardData.lastFourDigits} has been added.`,
    })
  };

  const removeCard = (id: string) => {
    if (!user || !firestore) return;
    const cardRef = doc(firestore, 'users', user.uid, 'creditCards', id);
    deleteDocumentNonBlocking(cardRef);
    toast({ variant: 'destructive', title: "Card Removed", description: "The selected card has been removed." })
  }
  
  const makeDefault = (id: string) => {
      if (!user || !firestore || !cards) return;
      cards.forEach(c => {
          const cardRef = doc(firestore, 'users', user.uid, 'creditCards', c.id);
          if (c.id === id && !c.isDefault) {
              updateDocumentNonBlocking(cardRef, { isDefault: true });
          } else if (c.id !== id && c.isDefault) {
              updateDocumentNonBlocking(cardRef, { isDefault: false });
          }
      });
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Saved Cards</h2>
             <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button disabled={!user}> <PlusCircle className="mr-2 h-4 w-4" /> Add Card </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add a new card</DialogTitle>
                        <DialogDescription>Your card information is stored securely.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                             <FormField control={form.control} name="cardholderName" render={({ field }) => (
                                <FormItem><FormLabel>Cardholder Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                             )} />
                             <FormField control={form.control} name="cardNumber" render={({ field }) => (
                                <FormItem><FormLabel>Card Number</FormLabel><FormControl><Input placeholder="•••• •••• •••• ••••" {...field} /></FormControl><FormMessage /></FormItem>
                             )} />
                             <div className="flex flex-col sm:flex-row gap-4">
                                <FormField control={form.control} name="expiry" render={({ field }) => (
                                    <FormItem className="flex-1"><FormLabel>Expiry Date</FormLabel><FormControl><Input placeholder="MM/YY" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="cvc" render={({ field }) => (
                                    <FormItem className="flex-1"><FormLabel>CVC</FormLabel><FormControl><Input placeholder="•••" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                             </div>
                             <FormField control={form.control} name="isDefault" render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Set as default payment method</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                            )} />
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                                <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save card</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>

        {isLoadingCards && (
             <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        )}
        <div className="space-y-4">
            {cards && cards.map(card => (
                <Card key={card.id} className="flex items-center justify-between p-4 bg-card/50 border-border/50">
                    <div className="flex items-center gap-4">
                        <div className="text-foreground"><CardIcon brand={card.brand} /></div>
                        <div>
                            <p className="font-semibold">{card.brand} •••• {card.lastFourDigits}</p>
                            <p className="text-sm text-muted-foreground">Expires {String(card.expiryMonth).padStart(2, '0')}/{String(card.expiryYear).slice(-2)}</p>
                        </div>
                         {card.isDefault && <div className="text-xs font-semibold text-accent bg-accent/10 px-2 py-1 rounded-full">DEFAULT</div>}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {!card.isDefault && <DropdownMenuItem onClick={() => makeDefault(card.id)}><Star className="mr-2 h-4 w-4" /> Make default</DropdownMenuItem>}
                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => removeCard(card.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </Card>
            ))}
        </div>
        {!isLoadingCards && cards?.length === 0 && (
             <div className="text-center py-12 border-2 border-dashed rounded-lg mt-6">
                <p className="text-muted-foreground">No cards saved.</p>
                <p className="text-sm text-muted-foreground">Add a card to get started.</p>
             </div>
        )}
    </div>
  );
}
