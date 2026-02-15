"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { creditCards as initialCards } from "@/lib/data";
import type { CreditCard } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, MoreVertical, Trash2, Star, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

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

const CardIcon = ({ brand }: { brand: CreditCard['brand'] }) => {
    if (brand === 'Visa') return <VisaIcon />;
    if (brand === 'Mastercard') return <MastercardIcon />;
    if (brand === 'Amex') return <AmexIcon />;
    return null;
}

function getCardBrand(cardNumber: string): CreditCard['brand'] {
    if (/^4/.test(cardNumber)) return 'Visa';
    if (/^5[1-5]/.test(cardNumber)) return 'Mastercard';
    if (/^3[47]/.test(cardNumber)) return 'Amex';
    return 'Visa'; // Default
}

export default function CardManagement() {
  const [cards, setCards] = useState<CreditCard[]>(initialCards);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof cardSchema>>({
    resolver: zodResolver(cardSchema),
    defaultValues: { cardholderName: "", cardNumber: "", expiry: "", cvc: "", isDefault: false },
  });

  const onSubmit = async (values: z.infer<typeof cardSchema>) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newCard: CreditCard = {
        id: (Math.random() * 10000).toString(),
        last4: values.cardNumber.slice(-4),
        expiry: values.expiry,
        brand: getCardBrand(values.cardNumber), 
        isDefault: values.isDefault,
    };
    
    setCards(prev => {
        let newCards = [...prev, newCard];
        if (values.isDefault) {
            return newCards.map(c => ({...c, isDefault: c.id === newCard.id}));
        }
        return newCards;
    });

    setIsSubmitting(false);
    setOpen(false);
    form.reset();
    toast({
        title: "Card Added",
        description: `Your ${newCard.brand} card ending in ${newCard.last4} has been added.`,
    })
  };

  const removeCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
    toast({ variant: 'destructive', title: "Card Removed", description: "The selected card has been removed." })
  }
  
  const makeDefault = (id: string) => {
      setCards(prev => prev.map(c => ({...c, isDefault: c.id === id})));
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Saved Cards</h2>
             <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button> <PlusCircle className="mr-2 h-4 w-4" /> Add Card </Button>
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
                             <div className="flex gap-4">
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

        <div className="space-y-4">
            {cards.map(card => (
                <Card key={card.id} className="flex items-center justify-between p-4 bg-card/50 border-border/50">
                    <div className="flex items-center gap-4">
                        <div className="text-foreground"><CardIcon brand={card.brand} /></div>
                        <div>
                            <p className="font-semibold">{card.brand} •••• {card.last4}</p>
                            <p className="text-sm text-muted-foreground">Expires {card.expiry}</p>
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
        {cards.length === 0 && (
             <div className="text-center py-12 border-2 border-dashed rounded-lg mt-6">
                <p className="text-muted-foreground">No cards saved.</p>
                <p className="text-sm text-muted-foreground">Add a card to get started.</p>
             </div>
        )}
    </div>
  );
}
