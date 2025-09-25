import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Zap, 
  ArrowLeft, 
  Crown, 
  CreditCard, 
  Download, 
  Calendar,
  LogOut,
  Settings as SettingsIcon,
  AlertCircle 
} from 'lucide-react';
import { userApi } from '../utils/supabase/client';
import type { Page } from '../App';

interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro';
  video_edits_used: number;
  subscription_status: string;
}

interface SettingsProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  user: User | null;
  onUpgrade: () => Promise<void>;
  onUserUpdate: () => Promise<void>;
}

interface BillingRecord {
  user_id: string;
  amount: number;
  plan: string;
  status: string;
  date: string;
}

export function Settings({ onNavigate, onLogout, user, onUpgrade, onUserUpdate }: SettingsProps) {
  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.plan === 'pro') {
      loadBillingHistory();
    }
  }, [user]);

  const loadBillingHistory = async () => {
    try {
      const { billing_history } = await userApi.getBillingHistory();
      setBillingHistory(billing_history);
    } catch (error) {
      console.error('Failed to load billing history:', error);
    }
  };

  const handleCancelSubscription = () => {
    if (confirm('Are you sure you want to cancel your Pro subscription? You will lose access to Pro features at the end of your current billing period.')) {
      alert('Subscription cancellation would be processed here. You will retain Pro access until your next billing date.');
    }
  };

  const handleUpgradeClick = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await onUpgrade();
      await onUserUpdate();
    } catch (error) {
      console.error('Upgrade error:', error);
      setError('Failed to upgrade subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">CutCraft AI</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Title */}
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Account Settings</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your account details and current subscription status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Address</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Current Plan</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.plan === 'pro' ? 'Pro Plan - $29/month' : 'Free Plan'}
                    </p>
                  </div>
                  <Badge variant={user?.plan === 'pro' ? 'default' : 'secondary'} className="gap-1">
                    {user?.plan === 'pro' && <Crown className="w-3 h-3" />}
                    {user?.plan === 'pro' ? 'Pro' : 'Free'}
                  </Badge>
                </div>

                {user?.plan === 'pro' && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Video Edits Used</p>
                        <p className="text-sm text-muted-foreground">
                          {user?.video_edits_used || 0} this month
                        </p>
                      </div>
                      <Badge variant="outline">Unlimited</Badge>
                    </div>
                  </>
                )}

                {user?.plan === 'free' && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Video Edits Used</p>
                        <p className="text-sm text-muted-foreground">
                          {user?.video_edits_used || 0} / 5 this month
                        </p>
                      </div>
                      <Badge variant={
                        (user?.video_edits_used || 0) >= 5 ? 'destructive' : 'secondary'
                      }>
                        {5 - (user?.video_edits_used || 0)} remaining
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Billing History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Billing History
                </CardTitle>
                <CardDescription>
                  Your payment history and invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user?.plan === 'pro' && billingHistory.length > 0 ? (
                  <div className="space-y-4">
                    {billingHistory.map((bill, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{bill.plan} Plan</p>
                            <p className="text-sm text-muted-foreground">{formatDate(bill.date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">${bill.amount.toFixed(2)}</p>
                            <Badge variant="secondary" className="text-xs">
                              {bill.status}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No billing history available</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.plan === 'free' 
                        ? 'Upgrade to Pro to start your billing history'
                        : 'Your billing history will appear here after your first payment'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>
                  Manage your subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {user?.plan === 'free' ? (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <Crown className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="font-medium text-sm">Upgrade to Pro</p>
                      <p className="text-xs text-muted-foreground">
                        Get unlimited AI edits and remove watermarks
                      </p>
                    </div>
                    <Button 
                      onClick={handleUpgradeClick} 
                      className="w-full"
                      disabled={isLoading}
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      {isLoading ? 'Processing...' : 'Upgrade to Pro'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <Crown className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <p className="font-medium text-sm text-green-800">Pro Plan Active</p>
                      <p className="text-xs text-green-600">
                        Unlimited AI edits and premium features
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleCancelSubscription} className="w-full">
                      Cancel Subscription
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>
                  Manage your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Account Settings
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                
                <Separator />
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={onLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>
                  Your current usage this month
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>AI Video Edits</span>
                    <span className="font-medium">
                      {user?.video_edits_used || 0} / {user?.plan === 'pro' ? 'Unlimited' : '5'}
                    </span>
                  </div>
                  {user?.plan === 'free' && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${((user?.video_edits_used || 0) / 5) * 100}%` }}
                      ></div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Plan Status</span>
                    <span className="font-medium capitalize">{user?.subscription_status || 'Active'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}