"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Coins,
  History,
  Send,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  PlusCircle,
  HelpCircle,
} from "lucide-react";

interface WalletClientProps {
  balance: number;
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    description: string;
    createdAt: string;
  }>;
  recharges: Array<{
    id: string;
    amount: number;
    transactionId: string;
    provider: string;
    status: string;
    reviewNote: string | null;
    createdAt: string;
  }>;
}

export default function WalletClient({ balance, transactions, recharges }: WalletClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ledger" | "recharge">("ledger");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    provider: "BKASH",
    transactionId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }
    if (!formData.transactionId.trim()) {
      toast.error("Please enter the Transaction ID (TxnID)");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/student/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(formData.amount),
          provider: formData.provider,
          transactionId: formData.transactionId.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      toast.success(data.message || "Recharge request submitted successfully!");
      setFormData({ amount: "", provider: "BKASH", transactionId: "" });
      router.refresh();
      setActiveTab("recharge");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "AUTO_APPROVED":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
            <CheckCircle className="w-3 h-3" /> Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 w-fit animate-pulse">
            <Clock className="w-3 h-3" /> Pending
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#070b15] text-white p-6 sm:p-8">
      {/* Upper Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-900/40 via-blue-900/20 to-slate-900/40 border border-cyan-800/30 p-6 sm:p-8 mb-8 backdrop-blur-md">
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <CreditCard className="w-3.5 h-3.5" /> Wallet Dashboard
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Manage Your Balance</h1>
            <p className="text-slate-400 text-sm">Add funds and view transactions here.</p>
          </div>

          {/* Large Balance Display */}
          <div className="bg-[#0f1930]/90 border border-slate-800/80 rounded-xl p-5 flex items-center gap-4 min-w-[240px] shadow-lg">
            <div className="p-3.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <Coins className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Current Balance</p>
              <p className="text-2xl sm:text-3xl font-black text-white">৳ {balance.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Form and History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Submit Request Form */}
        <div className="space-y-6">
          <Card className="bg-[#090d16] border-slate-800/60 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-cyan-400" /> Submit Recharge Request
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Send funds to your mobile wallet (bKash/Nagad/Rocket) and paste the transaction ID below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Provider Selector */}
                <div className="space-y-2">
                  <Label htmlFor="provider" className="text-slate-400">Payment Wallet</Label>
                  <div className="relative">
                    <select
                      id="provider"
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      className="w-full h-11 px-3 rounded-lg border border-slate-800 bg-[#0f1626] text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none cursor-pointer"
                    >
                      <option value="BKASH">bKash (Personal)</option>
                      <option value="NAGAD">Nagad (Personal)</option>
                      <option value="ROCKET">Rocket (Personal)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                      ▼
                    </div>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-slate-400">Recharge Amount (৳)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="e.g. 500"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="h-11 bg-[#0f1626] border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-cyan-500/50"
                  />
                </div>

                {/* Transaction ID */}
                <div className="space-y-2">
                  <Label htmlFor="txnId" className="text-slate-400">Transaction ID (TxnID)</Label>
                  <Input
                    id="txnId"
                    type="text"
                    placeholder="e.g. BKA7X9L10K"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    className="h-11 bg-[#0f1626] border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-cyan-500/50 font-mono"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:from-cyan-600 hover:to-blue-700 border-0 shadow-lg shadow-cyan-500/10 transition-all duration-300"
                >
                  {isLoading ? "Submitting..." : "Submit Recharge Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Ledger & Recharge Request Lists */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#090d16] border-slate-800/60 shadow-xl overflow-hidden min-h-[400px]">
            {/* Tabs Headers */}
            <div className="flex border-b border-slate-800/60">
              <button
                onClick={() => setActiveTab("ledger")}
                className={`flex-1 py-4 text-center text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all duration-300 ${
                  activeTab === "ledger"
                    ? "border-cyan-500 text-cyan-400 bg-cyan-950/10"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <History className="w-4 h-4" /> Transaction Ledger
              </button>
              <button
                onClick={() => setActiveTab("recharge")}
                className={`flex-1 py-4 text-center text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all duration-300 ${
                  activeTab === "recharge"
                    ? "border-cyan-500 text-cyan-400 bg-cyan-950/10"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <Send className="w-4 h-4" /> Submitted Recharges
              </button>
            </div>

            <CardContent className="p-6">
              {/* Tab 1: Transaction Ledger */}
              {activeTab === "ledger" && (
                <div className="space-y-4">
                  {transactions.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm">
                      No transaction history found.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800/60 max-h-[500px] overflow-y-auto pr-2">
                      {transactions.map((txn) => (
                        <div key={txn.id} className="py-3.5 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold text-white">{txn.description}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {new Date(txn.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <div className={`text-sm font-black whitespace-nowrap ${txn.type === "DEBIT" ? "text-rose-400" : "text-emerald-400"}`}>
                            {txn.type === "DEBIT" ? "-" : "+"} ৳ {txn.amount.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Recharge Requests History */}
              {activeTab === "recharge" && (
                <div className="space-y-4">
                  {recharges.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm">
                      No recharge requests submitted yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800/60 max-h-[500px] overflow-y-auto pr-2">
                      {recharges.map((req) => (
                        <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <p className="text-sm font-bold text-white">৳ {req.amount.toFixed(2)}</p>
                              <Badge className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                                {req.provider}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-400 font-mono">TxnID: {req.transactionId}</p>
                            <p className="text-[10px] text-slate-500">
                              Submitted: {new Date(req.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            {req.reviewNote && (
                              <p className="text-xs text-slate-500 bg-[#0f1626] border border-slate-800 p-2 rounded mt-2">
                                <span className="font-bold text-slate-400">Review Note:</span> {req.reviewNote}
                              </p>
                            )}
                          </div>
                          <div className="sm:text-right shrink-0">
                            {getStatusBadge(req.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
