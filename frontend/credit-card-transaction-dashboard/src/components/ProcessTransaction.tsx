'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "../hooks/use-toast"
import { Loader2, CheckCircle  } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Papa from 'papaparse'

interface Transaction {
    id: string;
    date: string;
    amount: number;
    merchant: string;
    cardLast4: string;
}
  

interface ProcessTransactionProps {
    onSubmitTransaction: (transaction: Transaction) => void;
}

// Simulated function to read transactions from a CSV file
// const readTransactionsFromCSV = async (): Promise<Transaction[]> => {
//   // In a real application, this would read from an actual CSV file
//   // For demonstration, we're returning a Promise to simulate an async operation
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve([
//         { id: '1', date: '2023-05-01', amount: '1500.00', merchant: 'Online Electronics Store', cardLast4: '1234' },
//         { id: '2', date: '2023-05-02', amount: '2000.00', merchant: 'Foreign Travel Agency', cardLast4: '5678' },
//         { id: '3', date: '2023-05-03', amount: '3000.00', merchant: 'Luxury Goods Shop', cardLast4: '9012' },
//         { id: '4', date: '2023-05-04', amount: '500.00', merchant: 'Local Grocery Store', cardLast4: '3456' },
//         { id: '5', date: '2023-05-05', amount: '1200.00', merchant: 'Online Clothing Retailer', cardLast4: '7890' },
//       ]);
//     }, 1000); // Simulate a 1-second delay
//   });
// }
// "trans_date_trans_time": "2020-06-21 22:14:25", 
// "dob": "1990-01-17", 
// "amt": 1199.84, 
// "zip": 51002, 
// "lat": 33.9659, 
// "long": -80.9355, 
// "city_pop": 333497, 
// "merch_lat": 33.986391, 
// "merch_long": -81.200714, 
// "category": "personal_care", 
// "gender": "M"
const readTransactionsFromCSV = async (): Promise<Transaction[]> => {
    return new Promise((resolve, reject) => {
      // Fetch the CSV file
      fetch('/data/transactions.csv')
        .then((response) => response.text())
        .then((csvData) => {
          Papa.parse(csvData, {
            header: true,
            skipEmptyLines: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            complete: (results: any) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const filteredTransactions = results.data.map((row: any) => ({
                trans_date_trans_time: row.trans_date_trans_time,
                amt: row.amt,
                id: String(row.trans_num),
                dob: row.dob,
                zip: row.zip,
                lat: row.lat,
                long: row.long,
                city_pop: row.city_pop,
                merch_lat: row.merch_lat,
                merch_long: row.merch_long,
                date: row.trans_date_trans_time,
                amount: parseFloat(row.amt),
                merchant: row.merchant.slice(6),
                category: row.category,
                gender: row.gender,
                cardLast4: row.cc_num.slice(-4), // Get last 4 digits of card number
                fraud: row.is_fraud
              }));
              resolve(filteredTransactions);
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            error: (error: any) => {
              reject(error);
            },
          });
        })
        .catch((error) => reject(error));
    });
  };
  
  const processTransaction = async (transaction: Transaction): Promise<void> => {
      const response = await fetch('http://ec2-18-218-234-68.us-east-2.compute.amazonaws.com:81/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),  // Convert transaction object to JSON
      });
      console.log(JSON.stringify(transaction))
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      const result = await response.json(); // Parse the response as JSON
      if(result.Prediction[0] == 1) throw new Error('Failed Transaction');
      console.log('Prediction result:', result);
  };

export default function ProcessTransaction({ onSubmitTransaction }: ProcessTransactionProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadTransactions = async () => {
      const data = await readTransactionsFromCSV();
      setTransactions(data);
      setIsLoading(false);
    };
    loadTransactions();
  }, []);

  const handleTransactionSelect = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    setSelectedTransaction(transaction || null);
    setIsProcessed(false);
    setIsFailed(false);
  };

  const handleSubmit = () => {
    if(selectedTransaction != null) {
        onSubmitTransaction(selectedTransaction);
        console.log(selectedTransaction)
    }
  };

  const handleProcess = async () => {
    if (selectedTransaction) {
        setIsProcessing(true);
        setIsProcessed(false);
        setIsFailed(false)
      try {
        await processTransaction(selectedTransaction);
        setIsProcessed(true);
        toast({
          title: "Transaction Processed",
          description: `Transaction ${selectedTransaction.id} has been successfully processed.`,
          duration: 5000,
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setIsFailed(true);
        handleSubmit();
        toast({
          title: "Processing Failed",
          description: "An error occurred while processing the transaction. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Transaction Processor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="transaction-select">Select a Transaction</Label>
          <Select onValueChange={handleTransactionSelect}>
            <SelectTrigger id="transaction-select">
              <SelectValue placeholder="Select a transaction" />
            </SelectTrigger>
            <SelectContent>
              {transactions.map((transaction) => (
                <SelectItem key={transaction.id} value={String(transaction.id)}>
                  {transaction.date} - ${transaction.amount} - {transaction.merchant}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTransaction && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" value={selectedTransaction.date} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" value={selectedTransaction.amount} readOnly />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="merchant">Merchant</Label>
              <Input id="merchant" value={selectedTransaction.merchant} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card">Card (last 4 digits)</Label>
              <Input id="card" value={selectedTransaction.cardLast4} readOnly />
            </div>
          </div>
        )}

        <Button 
          onClick={handleProcess} 
          className="w-full" 
          disabled={!selectedTransaction || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Process Transaction'
          )}
        </Button>
        {isProcessed && (
          <Alert className="bg-green-100 border-green-500">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">
              Transaction {selectedTransaction?.id} has been successfully processed.
            </AlertDescription>
          </Alert>
        )}
        {isFailed && (
          <Alert className="bg-red-100 border-red-500">
            <AlertTitle className="text-red-800">Failed</AlertTitle>
            <AlertDescription className="text-red-700">
              There was an error processing transaction {selectedTransaction?.id}.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}