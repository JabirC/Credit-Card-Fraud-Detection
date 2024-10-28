'use client'
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // Import ShadCN components
import DashboardPage from "./dashboard/page";

export default function Home() {
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
            Transaction
          </TabsTrigger>
        </TabsList>

        {/* Content */}
        <div className="flex-1 bg-white p-6 rounded-md">
          <TabsContent value="dashboard">
            <DashboardPage />
          </TabsContent>
          <TabsContent value="blank">
            <div className="text-center text-gray-500">This is a blank page.</div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}