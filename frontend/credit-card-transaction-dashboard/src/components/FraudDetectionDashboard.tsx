'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


interface Transaction {
    id: number;
    date: string;
    amount: number;
    merchant: string;
    cardLast4: string;
  }

// Mock data for demonstration purposes
const mockFraudulentTransactions = [
  { id: 1, date: '2023-05-01', amount: 1500, merchant: 'Online Electronics Store', cardLast4: '1234' },
  { id: 2, date: '2023-05-02', amount: 2000, merchant: 'Foreign Travel Agency', cardLast4: '5678' },
  { id: 3, date: '2023-05-03', amount: 3000, merchant: 'Luxury Goods Shop', cardLast4: '9012' },
  { id: 4, date: '2023-05-03', amount: 3000, merchant: 'Luxury Goods Shop', cardLast4: '9012' }
]

// Mock function to simulate fetching LLM explanation
const getLLMExplanation = async (transaction: Transaction) => {
  // In a real application, this would call your backend API which would then use an LLM
  await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
  return `This transaction was flagged as potentially fraudulent due to several factors:
  1. Unusual merchant: The transaction was made at ${transaction.merchant}, which is not consistent with the cardholder's typical spending patterns.
  2. High amount: The transaction amount of $${transaction.amount} is significantly higher than the average transaction amount for this card.
  3. Timing: This transaction occurred outside of the cardholder's usual active hours.
  4. Location: The transaction location doesn't match the cardholder's known locations.
  
  These factors combined triggered our fraud detection algorithm. However, please note that this is an initial assessment and may require further investigation.`
}

export default function FraudDetectionDashboard() {
//   const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [explanation, setExplanation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' })

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    })
  }

  const sortedTransactions = [...mockFraudulentTransactions].sort((a, b) => {
    const key = sortConfig.key as keyof Transaction; // Ensures TypeScript knows we're accessing a valid Transaction key
    
    if (key === 'date') {
      // Sort by date (convert to Date object for correct comparison)
      const dateA = new Date(a[key]);
      const dateB = new Date(b[key]);
      return sortConfig.direction === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    } else if (key === 'amount') {
      // Sort by amount (numerical comparison)
      return sortConfig.direction === 'asc' ? a[key] - b[key] : b[key] - a[key];
    }
  
    return 0;
  });

  const handleTransactionClick = async (transaction: Transaction) => {
    // setSelectedTransaction(transaction)
    setIsLoading(true)
    const explanation = await getLLMExplanation(transaction)
    setExplanation(explanation)
    setIsLoading(false)
  }

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
                <TableCell>{transaction.date}</TableCell>
                <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                <TableCell>{transaction.merchant}</TableCell>
                <TableCell>****{transaction.cardLast4}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" onClick={() => handleTransactionClick(transaction)}>Details</Button>
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
                          <span className="col-span-3">{transaction.date}</span>
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
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{explanation}</p>
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
  )
}