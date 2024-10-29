'use client'
import Groq from "groq-sdk";
import * as dotenv from 'dotenv';
dotenv.config();

  
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fraud: any;
    id: string;
    date: string;
    amount: number;
    merchant: string;
    cardLast4: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reason: any
}
  

interface ProcessTransactionProps {
    onSubmitTransaction: (transaction: Transaction) => void;
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY, dangerouslyAllowBrowser: true  });



const createLLMPrompt = (currentTransaction: Transaction,pastTransactions: Transaction[]): string => {
    let prompt = `
        You are an AI assistant helping to detect credit card fraud. Below, you will be provided a new transaction and a list of past transactions made by the same person. Based on these transactions, you need to determine whether the new transaction is consistent with the user's past behavior or if it is unusual enough to be considered fraudulent.
        
        - Analyze patterns in transaction amounts, locations, merchant categories, and other relevant details.
        - Consider whether the new transaction deviates significantly from past transactions in terms of amount, time, location, or merchant.
        - Provide a final decision: if the new transaction seems consistent with past behavior, return 0 meaning it is not fraudulent. If it seems suspicious and likely fraudulent, return 1.
        
        New Transaction:
        - Date: ${currentTransaction.date}
        - Amount: ${currentTransaction.amount}
        - Merchant: ${currentTransaction.merchant}
        - More meta Data: ${currentTransaction}
        
        Past Transactions:
        `;
        
            pastTransactions.forEach((transaction, index) => {
            prompt += `
        Transaction ${index + 1}:
        - Date: ${transaction.date}
        - Amount: ${transaction.amount}
        - Merchant: ${transaction.merchant}
        - Was Fraud: ${transaction.fraud}
        - More meta Data: ${transaction}
        `;
            });
        
            prompt += `
        Based on this information, is the new transaction fraudulent? Provide your decision: 0 for not fraudulent, or 1 for fraudulent.

        Deliverable: JSON format, two fields:
            Decision: with 0 or 1
            Reasoning: Detailed paragraph explanation for decision

        Only return the JSON, nothing else
        `;
        
        return prompt;
  };



  const describeFraudLLMPrompt = (currentTransaction: Transaction,pastTransactions: Transaction[]): string => {
    let prompt = `
        You are an AI assistant helping to explain why a transaction is fraudulent.
        
        - Analyze patterns in transaction amounts, locations, merchant categories, and other relevant details.
        - Consider whether the new transaction deviates significantly from past transactions in terms of amount, time, location, or merchant.
        - Provide a reasoning for why this transaction is fraudulent
        
        New Transaction:
        - Date: ${currentTransaction.date}
        - Amount: ${currentTransaction.amount}
        - Merchant: ${currentTransaction.merchant}
        - More meta Data: ${currentTransaction}
        
        Past Transactions:
        `;
        
            pastTransactions.forEach((transaction, index) => {
            prompt += `
        Transaction ${index + 1}:
        - Date: ${transaction.date}
        - Amount: ${transaction.amount}
        - Merchant: ${transaction.merchant}
        - Was Fraud: ${transaction.fraud}
        - More meta Data: ${transaction}
        `;
            });
        
            prompt += `

        Deliverable: JSON format, one fields:
            Reasoning: Detailed paragraph explanation for why transaction is fraudulent

        Only return the JSON, nothing else
        `;
        
        return prompt;
  };

  export async function getGroqChatCompletion(currentTransaction: Transaction, pastTransactions: Transaction[]) {
      return groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: createLLMPrompt(currentTransaction, pastTransactions),
          },
        ],
        model: "mixtral-8x7b-32768",
      });
    }

    export async function getFraudExplanation(currentTransaction: Transaction, pastTransactions: Transaction[]) {
        return groq.chat.completions.create({
          messages: [
            {
              role: "user",
              content: describeFraudLLMPrompt(currentTransaction, pastTransactions),
            },
          ],
          model: "mixtral-8x7b-32768",
        });
      }
  

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
                fraud: row.is_fraud,
                cardLast4: row.cc_num.slice(-4), // Get last 4 digits of card number
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
  
  const processTransaction = async (transaction: Transaction, pastTransactions: Transaction[]): Promise<void> => {
      const response = await fetch('/api/predict', {
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
      console.log('Prediction result:', result);
      if(result.Prediction[0] == 1){
        if (result.Probability[0][1] <= 0.7){
            const response = await getGroqChatCompletion(transaction, pastTransactions);
            const json_response = JSON.parse(response.choices[0]?.message?.content || " ")
            if (json_response.Decision == 1){
                transaction.reason = json_response.Reasoning
                throw new Error('Failed Transaction');
            }
        }
        else {
            const response = await getFraudExplanation(transaction, pastTransactions);
            const json_response = JSON.parse(response.choices[0]?.message?.content || " ")
            console.log(json_response);
            transaction.reason = json_response.Reasoning
            throw new Error('Failed Transaction');
        }
      } 
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
    console.log(transaction);
    setSelectedTransaction(transaction || null);
    setIsProcessed(false);
    setIsFailed(false);
  };

  const handleSubmit = () => {
    if(selectedTransaction != null) {
        onSubmitTransaction(selectedTransaction);
    }
  };

  const handleProcess = async () => {
    if (selectedTransaction) {
        setIsProcessing(true);
        setIsProcessed(false);
        setIsFailed(false)
      try {
        await processTransaction(selectedTransaction, transactions.filter(t => t.id === selectedTransaction.id));
        await wait(2000);
        setIsProcessed(true);
        toast({
          title: "Transaction Processed",
          description: `Transaction ${selectedTransaction.id} has been successfully processed.`,
          duration: 5000,
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        await wait(2000);
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