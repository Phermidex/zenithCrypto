'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

const VisaIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto fill-white"><title>Visa</title><path d="M7.105 15.244l-1.63-8.852h2.802l1.63 8.852zm9.364-8.852L14.45 11.7l-1.09-5.292-.022-.104H10.45l2.203 10.59h2.928l4.475-10.59zm-4.706 0h-2.73l-1.74 10.59h2.803c.001 0 1.74-10.59 1.74-10.59zm-5.02.023c-.562.002-1.01.442-1.02 1.002v.035l1.63 8.85h2.825l.43-8.887zm11.777-.023l-1.84 10.59h2.61l1.838-10.59z"/></svg>;

const ChipIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="38" viewBox="0 0 48 38" className="rounded-md">
        <g fill="none" fillRule="evenodd">
            <rect fill="#A9A9A9" width="48" height="38" rx="4"/>
            <path fill="#D5D5D5" d="M10 19h28v1H10z"/>
            <path fill="#D5D5D5" d="M24 10h1v18h-1z"/>
            <path stroke="#FFF" strokeOpacity=".5" d="M10.5 19.5h27m-27.5-9h28v18h-28z"/>
        </g>
    </svg>
);

export default function SampleCard() {
    const { toast } = useToast();
    
    const cardData = {
        name: "John Doe",
        number: "4242 4242 4242 4242",
        expiry: "12/26",
        cvc: "123",
        brand: "Visa",
    };

    const copyToClipboard = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied to clipboard",
            description: `${fieldName} has been copied.`,
        });
    };

    return (
        <div>
            <Card className="w-full max-w-md bg-gradient-to-br from-gray-800 to-black text-white rounded-2xl shadow-lg p-6 font-mono relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                    <ChipIcon />
                    <VisaIcon />
                </div>
                <div className="mb-6">
                    <div className="text-2xl tracking-widest mb-2">{cardData.number}</div>
                </div>
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-xs uppercase text-gray-400 mb-1">Card Holder</div>
                        <div className="text-lg tracking-wider">{cardData.name}</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase text-gray-400 mb-1">Expires</div>
                        <div className="text-lg tracking-wider">{cardData.expiry}</div>
                    </div>
                </div>
            </Card>
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Test Card Data</CardTitle>
                    <CardDescription>Use this data to add a new card on the Payment page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                        <p><span className="font-semibold">Card Number:</span> {cardData.number}</p>
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(cardData.number.replace(/\s/g, ''), 'Card Number')}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                     <div className="flex justify-between items-center">
                        <p><span className="font-semibold">Expiry Date (MM/YY):</span> {cardData.expiry}</p>
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(cardData.expiry, 'Expiry Date')}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                     <div className="flex justify-between items-center">
                        <p><span className="font-semibold">CVC:</span> {cardData.cvc}</p>
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(cardData.cvc, 'CVC')}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                     <div className="flex justify-between items-center">
                        <p><span className="font-semibold">Cardholder Name:</span> {cardData.name}</p>
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(cardData.name, 'Cardholder Name')}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
