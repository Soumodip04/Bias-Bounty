"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import aptosService from "@/services/aptos.service";
import { CheckBalanceResponse, IUser } from "@/types/aptos.types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wallet, Copy, Check, RefreshCw, Coins } from "lucide-react";
import toast from "react-hot-toast";

type UserRole = "COMPANY" | "RESEARCHER";

const WalletPage = () => {
  const { user, walletData, setWalletData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [creatingWallet, setCreatingWallet] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [balance, setBalance] = useState<CheckBalanceResponse | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if user has wallet on mount
  useEffect(() => {
    const checkWallet = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const response = await aptosService.getUserById(user.id);

      if (response.success && "user" in response) {
        setWalletData(response.user);
        await fetchBalance(response.user.wallet_address);
      }
      setLoading(false);
    };

    checkWallet();
  }, [user?.id]);

  // Fetch balance
  const fetchBalance = async (address: string) => {
    setLoadingBalance(true);
    const balanceResponse = await aptosService.checkBalance(address);

    if (balanceResponse.success && "balance_APT" in balanceResponse) {
      setBalance(balanceResponse);
    } else {
      toast.error("Failed to fetch balance");
    }
    setLoadingBalance(false);
  };

  // Create wallet account
  const handleCreateWallet = async () => {
    if (!selectedRole || !user) {
      toast.error("Please select a role");
      return;
    }

    setCreatingWallet(true);
    const response = await aptosService.createAccount({
      userId: user.id,
      username: user.email?.split("@")[0] || user.id,
      email: user.email || "",
      role: selectedRole,
    });

    if (response.success && "user" in response) {
      setWalletData(response.user);
      await fetchBalance(response.user.wallet_address);
      toast.success("Wallet created successfully! 🎉");
      setSelectedRole(null);
    } else {
      toast.error(
        "error" in response ? response.error : "Failed to create wallet"
      );
    }
    setCreatingWallet(false);
  };

  // Copy address to clipboard
  const copyAddress = async () => {
    if (walletData?.wallet_address) {
      await navigator.clipboard.writeText(walletData.wallet_address);
      setCopied(true);
      toast.success("Address copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Refresh balance
  const handleRefreshBalance = () => {
    if (walletData?.wallet_address) {
      fetchBalance(walletData.wallet_address);
      toast.success("Balance refreshed");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access your wallet
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-lg text-muted-foreground">Loading wallet...</p>
        </div>
      </div>
    );
  }

  // No wallet exists - Show role selection
  if (!walletData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Wallet className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Create Your Aptos Wallet</CardTitle>
            <CardDescription>
              Select your role to create a new wallet account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedRole("RESEARCHER")}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedRole === "RESEARCHER"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🔬</div>
                  <div className="font-semibold">Researcher</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Find bias & earn rewards
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedRole("COMPANY")}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedRole === "COMPANY"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🏢</div>
                  <div className="font-semibold">Company</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Submit datasets & models
                  </div>
                </div>
              </button>
            </div>

            <Button
              onClick={handleCreateWallet}
              disabled={!selectedRole || creatingWallet}
              className="w-full"
              size="lg"
            >
              {creatingWallet ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Creating Wallet...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Create Wallet as {selectedRole || "..."}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Wallet exists - Show wallet UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your Aptos Wallet
          </h1>
          <p className="text-muted-foreground">
            Manage your digital assets securely
          </p>
        </div>

        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Total Balance</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefreshBalance}
                disabled={loadingBalance}
                className="text-white hover:bg-white/20"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loadingBalance ? "animate-spin" : ""}`}
                />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-5xl font-bold mb-2">
                  {loadingBalance ? (
                    <RefreshCw className="h-12 w-12 animate-spin" />
                  ) : (
                    `${balance?.balance_APT.toFixed(4) || "0.0000"} APT`
                  )}
                </div>
                <div className="text-blue-100 text-sm">
                  {balance?.balance_octas.toLocaleString() || "0"} octas
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Username
                </label>
                <div className="text-lg font-semibold">
                  {walletData.username}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <div className="text-lg font-semibold">{walletData.email}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Role
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {walletData.role}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  User ID
                </label>
                <div className="text-sm font-semibold font-mono">
                  {walletData.userId}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Wallet Address
              </label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 p-3 bg-gray-100 rounded-lg text-sm break-all">
                  {walletData.wallet_address}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyAddress}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {walletData.createdAt && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created At
                </label>
                <div className="text-lg">
                  {new Date(walletData.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20" disabled>
                Send APT
                <span className="ml-2">💸</span>
              </Button>
              <Button variant="outline" className="h-20" disabled>
                Receive APT
                <span className="ml-2">📥</span>
              </Button>
              <Button variant="outline" className="h-20" disabled>
                Transaction History
                <span className="ml-2">📜</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Additional features coming soon!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletPage;
