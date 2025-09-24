"use client";

import { useEffect, useState } from "react";
import { TopNav } from "../../components/top-nav";
import { Sidebar } from "../../components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeProvider } from "../../components/theme-provider";
import { Gift, Star, Users, Zap, Copy, Share2, RefreshCw } from "lucide-react"; // Added RefreshCw icon
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";

type RewardsData = {
  referralCode: string;
  referralCount: number;
  referralPoints: number;
  referralLink: string;
};

export default function EarnRewardsPage() {
  const [rewards, setRewards] = useState<RewardsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api";

  const getAuthToken = () => {
    if (typeof window !== "undefined") return localStorage.getItem("token");
    return null;
  };

  // Fetch rewards data
  const fetchRewards = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      if (!token) throw new Error("No auth token found");

      const response = await axios.get(`${API_BASE}/auth/rewards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Ensure referralLink uses the correct signup page
      const updatedRewards = {
        ...response.data,
        referralLink: `http://localhost:3000/create-account.html?ref=${response.data.referralCode}`,
      };
      setRewards(updatedRewards);
    } catch (err) {
      setError("Failed to load rewards. Please try again or log in.");
      console.error("Error fetching rewards:", err);
    } finally {
      setLoading(false);
    }
  };

  // Copy referral link to clipboard
  const copyReferralLink = async () => {
    if (rewards?.referralLink) {
      await navigator.clipboard.writeText(rewards.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const rewardOptions = [
    { name: "Refer a Friend", icon: Users, description: "Earn 150 points per successful referral", points: 150 },
    { name: "Complete Challenges", icon: Zap, description: "Earn points by completing coding challenges", points: 100 },
    { name: "Write a Blog Post", icon: Star, description: "Earn points by contributing to our blog", points: 300 },
  ];

  if (loading) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="min-h-screen bg-background">
          <TopNav />
          <div className="flex">
            <Sidebar isCollapsed={false} />
            <main className="flex-1 p-8">
              <div className="max-w-7xl mx-auto">
                <div className="text-center py-8 text-muted-foreground">Loading rewards...</div>
              </div>
            </main>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="min-h-screen bg-background">
          <TopNav />
          <div className="flex">
            <Sidebar isCollapsed={false} />
            <main className="flex-1 p-8">
              <div className="max-w-7xl mx-auto">
                <div className="text-center py-8 text-red-500">{error}</div>
                <Button onClick={fetchRewards} className="mt-4">Retry</Button>
              </div>
            </main>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar isCollapsed={false} />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <h1 className="text-3xl font-bold text-foreground mb-8">Earn Rewards</h1>

              {/* Your Rewards Card */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gift className="mr-2 h-6 w-6" />
                    Your Rewards
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{rewards?.referralPoints || 0}</div>
                      <div className="text-muted-foreground">Points Earned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{rewards?.referralCount || 0}</div>
                      <div className="text-muted-foreground">Referrals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{rewards?.referralCode || "N/A"}</div>
                      <div className="text-muted-foreground">Your Code</div>
                    </div>
                  </div>
                  {/* Referral Link with Refresh Button */}
                  {rewards?.referralLink && (
                    <div className="space-y-2">
                      <Label>Your Referral Link</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={rewards.referralLink}
                          readOnly
                          className="flex-1"
                        />
                        <Button variant="outline" size="sm" onClick={copyReferralLink}>
                          <Copy className="w-4 h-4 mr-1" />
                          {copied ? "Copied!" : "Copy"}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({ title: "Join DevOnSpot!", url: rewards.referralLink });
                            } else {
                              copyReferralLink();
                            }
                          }}
                        >
                          <Share2 className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                        <Button variant="outline" size="sm" onClick={fetchRewards}>
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Refresh
                        </Button>
                      </div>
                    </div>
                  )}
                  <p className="text-muted-foreground">Keep earning to unlock exclusive perks!</p>
                </CardContent>
              </Card>

              {/* Reward Options */}
              {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewardOptions.map((option, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <option.icon className="mr-2 h-6 w-6" />
                        {option.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">{option.description}</p>
                      <p className="font-bold mb-2">Earn {option.points} points</p>
                      <Button>Start Earning</Button>
                    </CardContent>
                  </Card>
                ))}
              </div> */}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}