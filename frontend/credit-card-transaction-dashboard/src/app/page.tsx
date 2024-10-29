'use client'
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // Import ShadCN components
import FraudDetectionDashboard from "@/components/FraudDetectionDashboard";
import ProcessTransaction from "@/components/ProcessTransaction";

interface Transaction {
  id: string;
  date: string;
  amount: number;
  merchant: string;
  cardLast4: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reason: any;
}


export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const handleTransactionSubmit = (transaction: Transaction) => {
    setTransactions((prevTransactions) => [...prevTransactions, transaction]);
  };
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="h-screen flex flex-col">
      {/* Tabs using ShadCN UI */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex justify-around shadow-sm mb-4">
          <TabsTrigger
            value="dashboard"
            className={`w-full text-center p-3 ${
              activeTab === "dashboard" ? "bg-blue-600 text-white" : ""
            }`}
          >
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="blank"
            className={`w-full text-center p-3 ${
              activeTab === "blank" ? "bg-blue-600 text-white" : ""
            }`}
          >
            Transactions
          </TabsTrigger>
        </TabsList>

        {/* Content */}
        <div className="flex-1 bg-white p-6 rounded-md">
          <TabsContent value="dashboard">
            <FraudDetectionDashboard transactions={transactions} />
          </TabsContent>
          <TabsContent value="blank">
            <ProcessTransaction onSubmitTransaction={handleTransactionSubmit}/>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}