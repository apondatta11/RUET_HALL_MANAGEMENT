"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/lib/axios";
import {
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Check,
  X,
  User,
  ShieldCheck,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface RechargeQueueClientProps {
  initialRequests: Array<{
    id: string;
    amount: number;
    transactionId: string;
    provider: string;
    status: string;
    createdAt: string;
    reviewNote: string | null;
    user: {
      name: string;
      roll: string;
    };
  }>;
}

export default function RechargeQueueClient({ initialRequests }: RechargeQueueClientProps) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [filterStatus, setFilterStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<typeof initialRequests[0] | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [isLoading, setIsLoading] = useState<"APPROVE" | "REJECT" | null>(null);

  // Compute Stats
  const stats = {
    pending: initialRequests.filter((r) => r.status === "PENDING").length,
    approved: initialRequests.filter((r) => r.status === "APPROVED" || r.status === "AUTO_APPROVED").length,
    rejected: initialRequests.filter((r) => r.status === "REJECTED").length,
  };

  // Filtered requests list
  const filteredRequests = initialRequests.filter((req) => {
    const matchesStatus =
      filterStatus === "APPROVED"
        ? req.status === "APPROVED" || req.status === "AUTO_APPROVED"
        : req.status === filterStatus;

    const matchesSearch =
      req.user.roll.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.user.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleAction = async (action: "APPROVE" | "REJECT") => {
    if (!selectedRequest) return;
    setIsLoading(action);

    try {
      const res = await apiPost<{ success: boolean; message: string }>("/api/manager/recharge", {
        requestId: selectedRequest.id,
        action,
        reviewNote,
      });

      toast.success(res.message || `Request ${action.toLowerCase()}d successfully`);
      setSelectedRequest(null);
      setReviewNote("");
      router.refresh();
    } catch (error: any) {
      const errMsg = error.response?.data?.error || error.message || "Failed to process request";
      toast.error(errMsg);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b15] text-white p-6 sm:p-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-900/40 via-blue-900/20 to-slate-900/40 border border-cyan-800/30 p-6 sm:p-8 mb-8 backdrop-blur-md">
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-3.5 h-3.5" /> Staff Control Room
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Recharge Approval Queue</h1>
            <p className="text-slate-400 text-sm">Review manual student balance recharge requests.</p>
          </div>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div
          onClick={() => setFilterStatus("PENDING")}
          className={`rounded-xl border p-5 cursor-pointer transition-all duration-300 ${
            filterStatus === "PENDING"
              ? "bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-500/5"
              : "bg-[#090d16] border-slate-800/60 hover:border-slate-700"
          }`}
        >
          <div className="flex justify-between items-center">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Pending Review</p>
            <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{stats.pending}</p>
        </div>

        <div
          onClick={() => setFilterStatus("APPROVED")}
          className={`rounded-xl border p-5 cursor-pointer transition-all duration-300 ${
            filterStatus === "APPROVED"
              ? "bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-500/5"
              : "bg-[#090d16] border-slate-800/60 hover:border-slate-700"
          }`}
        >
          <div className="flex justify-between items-center">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Approved</p>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{stats.approved}</p>
        </div>

        <div
          onClick={() => setFilterStatus("REJECTED")}
          className={`rounded-xl border p-5 cursor-pointer transition-all duration-300 ${
            filterStatus === "REJECTED"
              ? "bg-rose-500/10 border-rose-500/30 shadow-lg shadow-rose-500/5"
              : "bg-[#090d16] border-slate-800/60 hover:border-slate-700"
          }`}
        >
          <div className="flex justify-between items-center">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Rejected</p>
            <XCircle className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{stats.rejected}</p>
        </div>
      </div>

      {/* Main Panel */}
      <Card className="bg-[#090d16] border-slate-800/60 shadow-xl overflow-hidden min-h-[400px]">
        {/* Search & Actions Header */}
        <div className="p-6 border-b border-slate-800/60 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <h2 className="text-white text-lg font-bold flex items-center gap-2">
            {filterStatus === "PENDING" && <Clock className="w-5 h-5 text-amber-400" />}
            {filterStatus === "APPROVED" && <CheckCircle className="w-5 h-5 text-emerald-400" />}
            {filterStatus === "REJECTED" && <XCircle className="w-5 h-5 text-rose-400" />}
            {filterStatus} Queue ({filteredRequests.length})
          </h2>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search Roll, Name or TxnID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-[#0f1626] border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-cyan-500/50"
            />
          </div>
        </div>

        {/* Requests List */}
        <CardContent className="p-0">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-sm">
              No recharge requests found matching filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0c1220]/60 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Student Details</th>
                    <th className="py-4 px-6">Wallet Provider</th>
                    <th className="py-4 px-6">Amount</th>
                    <th className="py-4 px-6">Transaction ID</th>
                    <th className="py-4 px-6">Submission Date</th>
                    {filterStatus !== "PENDING" && <th className="py-4 px-6">Review Notes</th>}
                    {filterStatus === "PENDING" && <th className="py-4 px-6 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-[#0f1626]/20 transition-all duration-200">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-800/40 rounded-full border border-slate-700/50">
                            <User className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{req.user.name}</p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">{req.user.roll}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                          {req.provider}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 font-black text-white">৳ {req.amount.toFixed(2)}</td>
                      <td className="py-4 px-6 font-mono text-sm text-cyan-400">{req.transactionId}</td>
                      <td className="py-4 px-6 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {new Date(req.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      {filterStatus !== "PENDING" && (
                        <td className="py-4 px-6 text-xs text-slate-400 max-w-[200px] truncate">
                          {req.reviewNote || <span className="text-slate-600 italic">No notes</span>}
                        </td>
                      )}
                      {filterStatus === "PENDING" && (
                        <td className="py-4 px-6 text-right">
                          <Button
                            size="sm"
                            onClick={() => setSelectedRequest(req)}
                            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold h-8 px-4"
                          >
                            Review
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 max-w-md w-full relative overflow-hidden shadow-2xl space-y-4">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 to-blue-600" />

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Review Recharge Request</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Details */}
            <div className="bg-[#0f1626] border border-slate-800 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Student:</span>
                <span className="font-bold text-white">{selectedRequest.user.name} ({selectedRequest.user.roll})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-black text-cyan-400">৳ {selectedRequest.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Provider:</span>
                <span className="font-bold text-white">{selectedRequest.provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="font-mono font-bold text-white">{selectedRequest.transactionId}</span>
              </div>
            </div>

            {/* Warning Info */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/30 text-cyan-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Please double-check transaction receipts on your manager payment panel before approving requests.</p>
            </div>

            {/* Notes Input */}
            <div className="space-y-2">
              <Label htmlFor="note" className="text-slate-400">Review Notes (Optional)</Label>
              <Input
                id="note"
                type="text"
                placeholder="e.g. Verified transaction on portal"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="bg-[#0f1626] border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-cyan-500/50"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-2">
              <Button
                variant="outline"
                disabled={isLoading !== null}
                onClick={() => handleAction("REJECT")}
                className="flex-1 bg-rose-950/20 border-rose-900/30 text-rose-400 hover:bg-rose-950/40"
              >
                {isLoading === "REJECT" ? "Rejecting..." : "Reject"}
              </Button>
              <Button
                disabled={isLoading !== null}
                onClick={() => handleAction("APPROVE")}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
              >
                {isLoading === "APPROVE" ? "Approving..." : "Approve"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
