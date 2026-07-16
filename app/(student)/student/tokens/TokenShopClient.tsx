"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Coins,
  QrCode,
  Utensils,
  Calendar,
  Info,
  Sparkles,
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
} from "lucide-react";

interface TokenShopClientProps {
  initialUser: {
    id: string;
    name: string;
    balance: number;
    hallId: string | null;
    isResident: boolean;
  };
  halls: Array<{
    id: string;
    name: string;
    noonNonResidentCapacity: number;
    nightNonResidentCapacity: number;
  }>;
  tomorrowSales: Array<{
    hallId: string;
    type: "LUNCH" | "DINNER";
    count: number;
  }>;
  activeTokens: Array<{
    id: string;
    type: "LUNCH" | "DINNER";
    tokenCode: string;
    price: number;
    hall: {
      name: string;
    };
  }>;
  lunchPrice: number;
  dinnerPrice: number;
}

export default function TokenShopClient({
  initialUser,
  halls,
  tomorrowSales,
  activeTokens,
  lunchPrice,
  dinnerPrice,
}: TokenShopClientProps) {
  const router = useRouter();
  const [selectedHallId, setSelectedHallId] = useState(
    initialUser.hallId || (halls[0]?.id || "")
  );
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [selectedTokenCode, setSelectedTokenCode] = useState<string | null>(null);

  // Compute tomorrow's readable date
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const formattedDate = tomorrowDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const selectedHall = halls.find((h) => h.id === selectedHallId);
  const isResidentBooking = initialUser.isResident && initialUser.hallId === selectedHallId;

  // Check if lunch or dinner already purchased
  const hasPurchasedLunch = activeTokens.some((t) => t.type === "LUNCH");
  const hasPurchasedDinner = activeTokens.some((t) => t.type === "DINNER");

  // Get sales and remaining capacities
  const getSalesCount = (type: "LUNCH" | "DINNER") => {
    const sale = tomorrowSales.find(
      (s) => s.hallId === selectedHallId && s.type === type
    );
    return sale ? sale.count : 0;
  };

  const getRemainingSlots = (type: "LUNCH" | "DINNER") => {
    if (!selectedHall) return 0;
    const sold = getSalesCount(type);
    const capacity =
      type === "LUNCH"
        ? selectedHall.noonNonResidentCapacity
        : selectedHall.nightNonResidentCapacity;
    return Math.max(0, capacity - sold);
  };

  const remainingLunchSlots = getRemainingSlots("LUNCH");
  const remainingDinnerSlots = getRemainingSlots("DINNER");

  const handlePurchase = async (tokenType: "LUNCH" | "DINNER") => {
    setIsLoading(tokenType);
    try {
      const res = await fetch("/api/student/tokens/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenType, hallId: selectedHallId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to purchase token");
      }

      toast.success(data.message || "Token purchased successfully!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b15] text-white p-6 sm:p-8">
      {/* Date Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-900/40 via-blue-900/20 to-slate-900/40 border border-cyan-800/30 p-6 sm:p-8 mb-8 backdrop-blur-md">
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Dining Hall Token Shop
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Tomorrow&apos;s Meal Booking
            </h1>
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Booking for: <span className="text-white font-medium">{formattedDate}</span>
            </p>
          </div>

          {/* Current Balance Card */}
          <div className="bg-[#0f1930]/90 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4 min-w-[200px]">
            <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <Coins className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Your Wallet</p>
              <p className="text-xl font-black text-white">৳ {initialUser.balance.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Shop & Selection */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-[#090d16] border-slate-800/60 shadow-xl overflow-visible">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Utensils className="w-5 h-5 text-cyan-400" /> 1. Select Dining Hall
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Residents get guaranteed booking at their own hall. Non-residents can choose halls with open capacity slots.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Hall Name</label>
                <div className="relative">
                  <select
                    value={selectedHallId}
                    onChange={(e) => setSelectedHallId(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-slate-800 bg-[#0f1626] text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none cursor-pointer"
                  >
                    {halls.map((hall) => (
                      <option key={hall.id} value={hall.id}>
                        {hall.name} {initialUser.hallId === hall.id ? "(My Hall - Default)" : ""}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    ▼
                  </div>
                </div>
              </div>

              {/* Residency Badge & Status Banner */}
              {isResidentBooking ? (
                <div className="flex items-start gap-3 p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-emerald-400 text-xs">
                  <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Resident Booking Guaranteed:</span> You are booking for your registered hall. Your seat is secured no matter what.
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-3.5 rounded-lg bg-amber-950/20 border border-amber-800/30 text-amber-400 text-xs">
                  <Unlock className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Non-Resident Booking:</span> You are booking for a hall other than your registered one. Purchase is subject to non-resident capacity limits.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Meal Booking Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* LUNCH CARD */}
            <Card className="bg-[#090d16] border-slate-800/60 shadow-xl flex flex-col justify-between overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-500 to-orange-500" />
              <div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Lunch Meal
                    </Badge>
                    <span className="text-2xl font-black text-white">৳ {lunchPrice.toFixed(0)}</span>
                  </div>
                  <CardTitle className="text-white text-lg mt-3">Afternoon Session</CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Standard lunch meal token valid for tomorrow afternoon.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Conditional Slots Display */}
                  {!isResidentBooking ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-400">Non-Resident Capacity</span>
                        <span className={remainingLunchSlots > 0 ? "text-cyan-400" : "text-rose-400"}>
                          {remainingLunchSlots} slots left
                        </span>
                      </div>
                      <div className="w-full bg-[#121b2d] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(remainingLunchSlots / (selectedHall?.noonNonResidentCapacity || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 flex items-center gap-2 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Booking Guaranteed
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="p-6 pt-0 mt-auto">
                {hasPurchasedLunch ? (
                  <Button className="w-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10 cursor-not-allowed" disabled>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Already Purchased
                  </Button>
                ) : !isResidentBooking && remainingLunchSlots <= 0 ? (
                  <Button className="w-full bg-rose-950/20 text-rose-400 border border-rose-900/30 hover:bg-rose-950/20 cursor-not-allowed" disabled>
                    <AlertTriangle className="w-4 h-4 mr-2" /> Sold Out
                  </Button>
                ) : initialUser.balance < lunchPrice ? (
                  <Button className="w-full bg-slate-900 text-slate-500 border border-slate-800 hover:bg-slate-900 cursor-not-allowed" disabled>
                    Insufficient Balance
                  </Button>
                ) : (
                  <Button
                    onClick={() => handlePurchase("LUNCH")}
                    disabled={isLoading !== null}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold hover:from-amber-600 hover:to-orange-700 border-0 shadow-lg shadow-orange-500/10 transition-all duration-300"
                  >
                    {isLoading === "LUNCH" ? "Processing..." : "Purchase Lunch"}
                  </Button>
                )}
              </div>
            </Card>

            {/* DINNER CARD */}
            <Card className="bg-[#090d16] border-slate-800/60 shadow-xl flex flex-col justify-between overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 to-purple-500" />
              <div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Dinner Meal
                    </Badge>
                    <span className="text-2xl font-black text-white">৳ {dinnerPrice.toFixed(0)}</span>
                  </div>
                  <CardTitle className="text-white text-lg mt-3">Night Session</CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Standard dinner meal token valid for tomorrow night.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Conditional Slots Display */}
                  {!isResidentBooking ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-400">Non-Resident Capacity</span>
                        <span className={remainingDinnerSlots > 0 ? "text-cyan-400" : "text-rose-400"}>
                          {remainingDinnerSlots} slots left
                        </span>
                      </div>
                      <div className="w-full bg-[#121b2d] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(remainingDinnerSlots / (selectedHall?.nightNonResidentCapacity || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 flex items-center gap-2 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Booking Guaranteed
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="p-6 pt-0 mt-auto">
                {hasPurchasedDinner ? (
                  <Button className="w-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10 cursor-not-allowed" disabled>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Already Purchased
                  </Button>
                ) : !isResidentBooking && remainingDinnerSlots <= 0 ? (
                  <Button className="w-full bg-rose-950/20 text-rose-400 border border-rose-900/30 hover:bg-rose-950/20 cursor-not-allowed" disabled>
                    <AlertTriangle className="w-4 h-4 mr-2" /> Sold Out
                  </Button>
                ) : initialUser.balance < dinnerPrice ? (
                  <Button className="w-full bg-slate-900 text-slate-500 border border-slate-800 hover:bg-slate-900 cursor-not-allowed" disabled>
                    Insufficient Balance
                  </Button>
                ) : (
                  <Button
                    onClick={() => handlePurchase("DINNER")}
                    disabled={isLoading !== null}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:from-indigo-600 hover:to-purple-700 border-0 shadow-lg shadow-purple-500/10 transition-all duration-300"
                  >
                    {isLoading === "DINNER" ? "Processing..." : "Purchase Dinner"}
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Right Side: Purchased Active Tokens / QR Codes */}
        <div className="space-y-6">
          <Card className="bg-[#090d16] border-slate-800/60 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <QrCode className="w-5 h-5 text-cyan-400" /> Active Meal Tokens
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Tokens purchased for tomorrow. Tap to view the QR code for entry validation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeTokens.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl bg-[#060a12]">
                  <p className="text-slate-500 text-sm">No active tokens purchased for tomorrow yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeTokens.map((token) => (
                    <div
                      key={token.id}
                      onClick={() => setSelectedTokenCode(token.tokenCode)}
                      className="group flex items-center justify-between p-4 rounded-xl border border-slate-800/80 bg-[#0f1626]/40 hover:bg-[#0f1626]/80 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${token.type === "LUNCH" ? "bg-amber-500/10 text-amber-400" : "bg-indigo-500/10 text-indigo-400"}`}>
                          <Utensils className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                            {token.type} Token
                          </p>
                          <p className="text-xs text-slate-400 font-medium">
                            {token.hall.name}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="h-8 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
                        View QR
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QR Modal */}
      {selectedTokenCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 to-blue-600" />
            <h3 className="text-lg font-bold text-white mb-2">Scan for Dining Admission</h3>
            <p className="text-xs text-slate-400 mb-6">Present this code at the dining hall counter for validation.</p>

            <div className="bg-white p-4 rounded-xl inline-block mb-6 shadow-inner">
              {/* QR Code Server API Generator */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedTokenCode}&color=080e1a`}
                alt="QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <div className="space-y-4">
              <div className="text-xs text-slate-500 bg-[#0f1626] py-2 px-3 rounded-lg font-mono break-all border border-slate-800">
                Code: {selectedTokenCode}
              </div>
              <Button
                onClick={() => setSelectedTokenCode(null)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800"
              >
                Close Window
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
