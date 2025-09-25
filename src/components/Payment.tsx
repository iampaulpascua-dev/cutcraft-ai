import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Zap, Check, Crown, ArrowLeft } from 'lucide-react';
import type { Page } from '../App';

interface PaymentProps {
  onNavigate: (page: Page) => void;
  onUpgrade: () => void;
}

export function Payment({ onNavigate, onUpgrade }: PaymentProps) {
  const handleUpgrade = () => {
    // Simulate payment processing
    alert('Payment processing... This would integrate with a payment provider like Stripe.');
    onUpgrade();
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

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start with our free plan or upgrade to Pro for unlimited AI video editing with premium features
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader className="text-center pb-8">
              <Badge variant="secondary" className="w-fit mx-auto mb-4">
                Current Plan
              </Badge>
              <CardTitle className="text-2xl mb-2">Free Plan</CardTitle>
              <div className="text-4xl font-bold mb-2">
                $0
                <span className="text-lg font-normal text-muted-foreground">/month</span>
              </div>
              <CardDescription>
                Perfect for trying out CutCraft AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>5 AI video edits per month</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Upload videos up to 100MB</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Basic AI editing features</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Check className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <span>CutCraft AI watermark included</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Check className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <span>Standard processing speed</span>
                </li>
              </ul>
              
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-primary shadow-lg">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1">
                <Crown className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
            </div>
            
            <CardHeader className="text-center pb-8 pt-8">
              <CardTitle className="text-2xl mb-2 flex items-center justify-center gap-2">
                <Crown className="w-6 h-6 text-primary" />
                Pro Plan
              </CardTitle>
              <div className="text-4xl font-bold mb-2">
                $29
                <span className="text-lg font-normal text-muted-foreground">/month</span>
              </div>
              <CardDescription>
                Unlimited AI video editing for creators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="font-medium">Unlimited AI video edits</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="font-medium">Upload videos up to 1GB</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="font-medium">Advanced AI editing features</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="font-medium">No watermarks on exports</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="font-medium">Priority processing queue</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="font-medium">HD/4K export quality</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="font-medium">Priority email support</span>
                </li>
              </ul>
              
              <Button onClick={handleUpgrade} className="w-full text-lg py-6">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                Billed monthly. Cancel anytime.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your Pro subscription at any time. You'll continue to have Pro access until the end of your current billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What video formats are supported?</h3>
              <p className="text-muted-foreground">
                We support all major video formats including MP4, MOV, AVI, MKV, and more. Our AI works best with MP4 files.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">How does the AI video editing work?</h3>
              <p className="text-muted-foreground">
                Our AI analyzes your video content and automatically applies professional editing techniques like color correction, audio enhancement, scene transitions, and more.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}