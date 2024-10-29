'use client'

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface Transaction {
  id: string;
  date: string;
  amount: number;
  merchant: string;
  cardLast4: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reason: any
}

interface FraudDetectionDashboardProps {
  transactions: Transaction[];
}

export default function FraudDetectionDashboard({ transactions }: FraudDetectionDashboardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    const key = sortConfig.key as keyof Transaction;
    if (key === 'date') {
      const dateA = new Date(a[key]);
      const dateB = new Date(b[key]);
      return sortConfig.direction === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    } else if (key === 'amount') {
      return sortConfig.direction === 'asc' ? a[key] - b[key] : b[key] - a[key];
    }
    return 0;
  });

  const handleTransactionClick = async () => {
    setIsLoading(true);
    await wait(1000);
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Fraudulent Transactions Dashboard</CardTitle>
        <CardDescription>Recent transactions flagged as potentially fraudulent</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <Button variant="ghost" onClick={() => handleSort('date')}>
                  Date
                  {sortConfig.key === 'date' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('amount')}>
                  Amount
                  {sortConfig.key === 'amount' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>Card</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.date.slice(0, -8)}</TableCell>
                <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                <TableCell>{transaction.merchant}</TableCell>
                <TableCell>****{transaction.cardLast4}</TableCell>
                <TableCell>
                 <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" onClick={() => handleTransactionClick()}>Details</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Transaction Details</DialogTitle>
                        <DialogDescription>
                          Transaction ID: {transaction.id}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="font-bold">Date:</span>
                          <span className="col-span-3">{transaction.date.slice(0, -8)}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="font-bold">Amount:</span>
                          <span className="col-span-3">${transaction.amount.toFixed(2)}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="font-bold">Merchant:</span>
                          <span className="col-span-3">{transaction.merchant}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="font-bold">Card:</span>
                          <span className="col-span-3">****{transaction.cardLast4}</span>
                        </div>
                        <div className="grid gap-2">
                          <span className="font-bold">Fraud Analysis:</span>
                          {isLoading ? (
                            <p>Loading analysis...</p>
                          ) : (
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{transaction.reason}</p>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
