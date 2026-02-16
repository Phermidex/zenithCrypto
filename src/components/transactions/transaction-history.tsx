'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore } from '@/firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  endBefore,
  limitToLast,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { Transaction } from '@/lib/firebase-types';
import { cryptoAssets } from '@/lib/data';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const ITEMS_PER_PAGE = 5;

const formatDate = (isoString: string) => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function TransactionHistory() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [transactions, setTransactions] = useState<(Transaction & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firstVisible, setFirstVisible] = useState<QueryDocumentSnapshot | null>(null);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
  const [page, setPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);

  const cryptoMap = useMemo(() => new Map(cryptoAssets.map(c => [c.id, c])), []);

  const fetchTransactions = async (direction: 'next' | 'prev' | 'initial' = 'initial') => {
    if (!user || !firestore) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    const transactionsRef = collection(firestore, 'users', user.uid, 'transactions');
    let q;
    
    if (direction === 'next' && lastVisible) {
      q = query(transactionsRef, orderBy('transactionDate', 'desc'), startAfter(lastVisible), limit(ITEMS_PER_PAGE));
    } else if (direction === 'prev' && firstVisible) {
      q = query(transactionsRef, orderBy('transactionDate', 'desc'), endBefore(firstVisible), limitToLast(ITEMS_PER_PAGE));
    } else {
      q = query(transactionsRef, orderBy('transactionDate', 'desc'), limit(ITEMS_PER_PAGE));
    }

    try {
      const docSnapshots = await getDocs(q);
      const isPrev = direction === 'prev';
      const docs = isPrev ? docSnapshots.docs.reverse() : docSnapshots.docs;

      if (!docSnapshots.empty) {
        const newTransactions = docs.map(doc => ({ ...doc.data() as Transaction, id: doc.id }));
        setTransactions(newTransactions);
        setFirstVisible(docs[0]);
        setLastVisible(docs[docs.length - 1]);
        
        if (direction !== 'prev') {
            const nextQuery = query(transactionsRef, orderBy('transactionDate', 'desc'), startAfter(docs[docs.length - 1]), limit(1));
            const nextSnap = await getDocs(nextQuery);
            setIsLastPage(nextSnap.empty);
        }

      } else if (direction === 'next') {
        setIsLastPage(true);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions('initial');
    } else {
      setTransactions([]);
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleNext = () => {
    if (!isLastPage) {
      setPage(p => p + 1);
      fetchTransactions('next');
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      setPage(p => p - 1);
      fetchTransactions('prev');
      setIsLastPage(false); // We can always go next from a previous page
    }
  };

  const renderIcon = (type: 'buy' | 'send') => {
    const className = "h-5 w-5 mr-3 rounded-full p-1";
    if (type === 'buy') {
      return <ArrowDownLeft className={cn(className, "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400")} />;
    }
    return <ArrowUpRight className={cn(className, "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400")} />;
  };

  const renderSkeleton = () =>
    Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
      <TableRow key={i}>
        <TableCell colSpan={5}>
          <Skeleton className="h-12 w-full" />
        </TableCell>
      </TableRow>
    ));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>A record of your recent crypto transactions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden md:table-cell">Value</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              renderSkeleton()
            ) : transactions.length > 0 ? (
              transactions.map(tx => {
                const crypto = cryptoMap.get(tx.cryptocurrencyTypeId);
                return (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {renderIcon(tx.type)}
                        <div>
                          <p className="font-medium capitalize">{tx.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {tx.type === 'send' ? `To: ${tx.recipientEmail}` : `From: Bank`}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{tx.cryptoAmount.toFixed(6)} {crypto?.symbol}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <p>${tx.fiatAmount.toFixed(2)} {tx.fiatCurrency}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(tx.transactionDate)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={tx.status === 'completed' ? 'secondary' : 'default'} className={tx.status === 'completed' ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" : ""}>
                        {tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Button onClick={handlePrev} disabled={page <= 1 || isLoading}>
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <Button onClick={handleNext} disabled={isLastPage || isLoading}>
          Next
        </Button>
      </CardFooter>
    </Card>
  );
}
