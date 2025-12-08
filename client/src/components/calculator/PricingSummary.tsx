import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Student, CurriculumConfig, PricingConfig } from "@/lib/types";
import { Check, Crown, Download, Share2, Sparkles, Tag, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface PricingSummaryProps {
  student: Student;
  curriculum: CurriculumConfig;
  pricing: PricingConfig;
  setPricing: (pricing: PricingConfig) => void;
  onBack: () => void;
}

export function PricingSummary({ student, curriculum, pricing, setPricing, onBack }: PricingSummaryProps) {
  const { toast } = useToast();
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const data = e.data as any;
      if (data && data.type === 'payment-success') {
        setPaymentOpen(false);
        setPaymentSuccess(true);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    let timer: any;
    const poll = async () => {
      try {
        const r = await fetch('/api/payments/status');
        const j = await r.json();
        if (j?.status === 'success') {
          setPaymentOpen(false);
          setPaymentSuccess(true);
        }
      } catch {}
    };
    if (paymentOpen) {
      timer = setInterval(poll, 3000);
      poll();
    }
    return () => { if (timer) clearInterval(timer); };
  }, [paymentOpen]);

  // Tenure-based LPP block counts
  const tenureUnits = Math.max(1, Math.round((curriculum.durationMonths || 3) / 3));
  const frequencyFactor = (curriculum.classesPerWeek || 3) / 3; // scale relative to 3 classes/week baseline
  const learnClasses = Math.round(12 * tenureUnits * frequencyFactor);
  const practiceClasses = Math.round(24 * tenureUnits * frequencyFactor);
  const performanceClasses = Math.round(24 * tenureUnits * frequencyFactor);
  const totalClasses = learnClasses + practiceClasses + performanceClasses;
  // Display Base Fee = number of Learn classes × 3500 (inclusive of taxes)
  const baseTotalDisplay = learnClasses * 3500;

  // LPP class breakdown rendered for users

  const targetSAPFinal = learnClasses * 1500;
  const sapDiscountAmount = pricing.sapEnabled ? Math.max(0, baseTotalDisplay - targetSAPFinal) : 0;
  const subtotalBeforeCoupon = pricing.sapEnabled ? targetSAPFinal : baseTotalDisplay;
  const targetFinalWithCoupon = learnClasses * 1090;
  const couponDiscountAmount = appliedCoupon ? Math.max(0, subtotalBeforeCoupon - targetFinalWithCoupon) : 0;
  const finalPrice = appliedCoupon ? targetFinalWithCoupon : subtotalBeforeCoupon;
  const sapDiscountPercent = Math.round(baseTotalDisplay > 0 ? (sapDiscountAmount / baseTotalDisplay) * 100 : 0);
  const couponPercent = appliedCoupon ? Math.round(subtotalBeforeCoupon > 0 ? (couponDiscountAmount / subtotalBeforeCoupon) * 100 : 0) : 0;
  const totalDiscount = Math.max(0, baseTotalDisplay - finalPrice);
  const savingsPercentage = Math.round(baseTotalDisplay > 0 ? (totalDiscount / baseTotalDisplay) * 100 : 0);

  const applyCoupon = () => {
    if (couponInput.length === 6 && /^[a-zA-Z0-9]+$/.test(couponInput)) {
      setAppliedCoupon(couponInput);
      setPricing({ ...pricing, couponCode: couponInput });
      toast({
        title: "Coupon Applied!",
        description: "Discount applied successfully.",
        className: "bg-green-50 text-green-800 border-green-200"
      });
    } else {
      toast({
        title: "Invalid Coupon",
        description: "Please enter a valid 6-character alphanumeric code.",
        variant: "destructive"
      });
    }
  };

  const handleGeneratePaymentLink = () => {
    setPaymentOpen(true);
  };

  const handleDownloadProposal = async () => {
    try {
      setGenerating(true);
      const logoSrc = '/brand-logo.png';
      const now = new Date();
      const html = `<!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>PlanetSpark - Proposal Receipt</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif; margin: 24px; color: #111827; }
          .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
          .row { display: flex; justify-content: space-between; align-items: center; }
          .muted { color: #6b7280; }
          .title { font-size: 22px; font-weight: 700; }
          .section { margin-top: 16px; }
          .label { font-size: 12px; text-transform: uppercase; color: #6b7280; }
          .value { font-weight: 600; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .divider { border-top: 1px solid #e5e7eb; margin: 16px 0; }
          .right { text-align: right; }
          .total { font-size: 24px; font-weight: 800; }
          .brand { display: flex; align-items: center; gap: 10px; }
          .badge { background: #0ea5e9; color: white; padding: 4px 8px; border-radius: 999px; font-size: 12px; }
          .footer { margin-top: 24px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="row">
            <div class="brand">
              <img src="${logoSrc}" alt="Logo" style="height:48px;width:48px;" onerror="this.src='/brand-logo.svg'" />
              <div>
                <div class="title">PlanetSpark</div>
                <div class="muted">World's Best Mathematics Course</div>
              </div>
            </div>
            <div class="right">
              <div class="label">Date</div>
              <div class="value">${now.toLocaleDateString()} ${now.toLocaleTimeString()}</div>
              <div class="label">Receipt ID</div>
              <div class="value">PS-${student.id}-${now.getTime()}</div>
            </div>
          </div>
          <div class="section grid">
            <div>
              <div class="label">Student</div>
              <div class="value">${student.name}</div>
            </div>
            <div>
              <div class="label">Grade</div>
              <div class="value">${student.grade}</div>
            </div>
            <div>
              <div class="label">Duration</div>
              <div class="value">${curriculum.durationMonths} Months</div>
            </div>
            <div>
              <div class="label">Frequency</div>
              <div class="value">${curriculum.classesPerWeek} Classes/Week</div>
            </div>
            <div>
              <div class="label">Methodology</div>
              <div class="value">${curriculum.methodology}</div>
            </div>
            <div>
              <div class="label">Total Sessions</div>
              <div class="value">${totalClasses} Sessions</div>
            </div>
          </div>
          <div class="divider"></div>
              <div class="section">
            <div class="row"><div class="muted">Base Fee</div><div class="value">₹${baseTotalDisplay.toLocaleString()}</div></div>
            <div class="divider"></div>
            <div class="grid">
              <div><div class="label">Learn Classes</div><div class="value">${learnClasses}</div></div>
              <div><div class="label">Practice Classes</div><div class="value">${practiceClasses}</div></div>
              <div><div class="label">Perform Classes</div><div class="value">${performanceClasses}</div></div>
              <div><div class="label">Total</div><div class="value">${learnClasses + practiceClasses + performanceClasses}</div></div>
            </div>
            <div class="divider"></div>
            ${sapDiscountAmount > 0 ? `<div class="row"><div class="muted">SAP Discount (${sapDiscountPercent}%)</div><div class="value">- ₹${sapDiscountAmount.toLocaleString()}</div></div>` : ''}
            ${couponDiscountAmount > 0 ? `<div class="row"><div class="muted">Teacher Discount (${appliedCoupon}) ${couponPercent}%</div><div class="value">- ₹${couponDiscountAmount.toLocaleString()}</div></div>` : ''}
            <div class="divider"></div>
            <div class="row"><div class="value">Total</div><div class="total">₹${finalPrice.toLocaleString()}</div></div>
          <div class="right muted" style="font-size:12px;margin-top:6px;">All amounts are inclusive of taxes.</div>
          </div>
          <div class="section">
            <span class="badge">Congratulations on taking the first step towards a Bright Future!</span>
          </div>
          <div class="footer">
            Terms & Conditions: You agree to share information with PlanetSpark and Razorpay, adhering to applicable laws. Contact Us available on the payment page.
          </div>
        </div>
        <script>setTimeout(() => window.print(), 300);</script>
      </body>
      </html>`;
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(html);
        w.document.close();
      } else {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.location.href = url;
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-foreground">Pricing & Proposal</h2>
        <p className="text-muted-foreground">Review final details and generate the offer.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Summary */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-secondary" />
                Course Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Student</span>
                  <p className="font-semibold">{student.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Grade</span>
                  <p className="font-semibold">{student.grade}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Tenure (Months)</span>
                  <p className="font-semibold">{tenureUnits * 3} Months</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Frequency</span>
                  <p className="font-semibold">{curriculum.classesPerWeek} Classes/Week</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Total Sessions</span>
                  <p className="font-semibold">{totalClasses} Sessions</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Methodology</span>
                  <p className="font-semibold">{curriculum.methodology}</p>
                </div>
                <div className="col-span-2 grid grid-cols-4 gap-4 mt-2">
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Learn</span>
                    <p className="font-semibold">{learnClasses}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Practice</span>
                    <p className="font-semibold">{practiceClasses}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Perform</span>
                    <p className="font-semibold">{performanceClasses}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Total</span>
                    <p className="font-semibold">{learnClasses + practiceClasses + performanceClasses}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <span className="text-muted-foreground text-sm mb-2 block">Selected Topics</span>
                <div className="flex flex-wrap gap-2">
                  {curriculum.topics.map(t => (
                    <span key={t} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs border">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn("transition-all duration-300 border-secondary/20", pricing.sapEnabled ? "bg-secondary/5 ring-1 ring-secondary/50 shadow-md" : "bg-gray-50/50")}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={cn("p-2 rounded-full", pricing.sapEnabled ? "bg-secondary text-white" : "bg-gray-200 text-gray-500")}>
                     <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className={cn("font-semibold text-lg", pricing.sapEnabled ? "text-secondary" : "text-gray-700")}>Student Ambassador Program (SAP)</h3>
                    <p className="text-xs text-muted-foreground">Exclusive membership & benefits</p>
                  </div>
                </div>
                <Switch 
                  checked={pricing.sapEnabled}
                  onCheckedChange={(checked) => setPricing({ ...pricing, sapEnabled: checked })}
                />
              </div>
              
              {pricing.sapEnabled ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                   <p className="text-sm text-secondary/80 font-medium">
                    SAP Unlocks Premium Benefits:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "1:1 Personalised Learning", 
                      "Olympiad / Competitive Prep", 
                      "Mental Maths / Fast Calculation", 
                      "Lifetime LMS Access", 
                      "Flexible Days/Time",
                      "Top Rated Coach Choice"
                    ].map(tag => (
                      <div key={tag} className="flex items-center gap-2 text-sm text-secondary bg-white px-3 py-2 rounded-md border border-secondary/20 shadow-sm">
                        <Check className="h-4 w-4 shrink-0" /> {tag}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-100 p-3 rounded-md">
                   <Zap className="h-4 w-4 text-gray-400" />
                   Enable SAP to unlock 1:1 classes, Olympiad prep, and 15% scholarship.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Pricing Calculator */}
        <div className="space-y-6">
          {paymentSuccess && (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="py-4 text-center space-y-1">
                <div className="text-2xl">🎉🥳🎓</div>
                <div className="font-bold text-green-700">Welcome to PlanetSpark!</div>
                <div className="text-sm text-green-800">Congratulations on making a great decision for your child’s learning journey.</div>
              </CardContent>
            </Card>
          )}
          <Card className="shadow-lg border-t-4 border-t-primary">
            <CardContent className="pt-6 space-y-6">
              <h3 className="font-bold text-xl text-center text-primary">Investment Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Fee</span>
                  <span>₹{baseTotalDisplay.toLocaleString()}</span>
                </div>
                
                {sapDiscountAmount > 0 && (
                  <div className="flex justify-between text-secondary font-medium">
                    <span>SAP Discount ({sapDiscountPercent}%)</span>
                    <span>- ₹{sapDiscountAmount.toLocaleString()}</span>
                  </div>
                )}

                {couponDiscountAmount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Teacher Discount ({appliedCoupon}) {couponPercent}%</span>
                    <span>- ₹{couponDiscountAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-lg">Total</span>
                  <span className="font-bold text-3xl">₹{finalPrice.toLocaleString()}</span>
                </div>
                <div className="text-xs text-muted-foreground text-right">All amounts are inclusive of taxes.</div>
                {savingsPercentage > 0 && (
                  <p className="text-right text-xs text-success font-medium">
                    You save {savingsPercentage}% (₹{totalDiscount.toLocaleString()})
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                 <Label className="text-xs uppercase text-muted-foreground">Teacher Discount Code</Label>
                 <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input 
                       placeholder="ABC123" 
                       className="pl-8 h-9 text-sm uppercase" 
                       maxLength={6}
                       value={couponInput}
                       onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                     />
                  </div>
                  <Button size="sm" variant="secondary" onClick={applyCoupon} disabled={!!appliedCoupon}>Apply</Button>
                 </div>
              </div>

              <div className="pt-2 space-y-3">
                <Button className="w-full h-12 text-lg gap-2 shadow-md hover:shadow-lg transition-all" onClick={handleGeneratePaymentLink} disabled={generating}>
                  <Share2 className="h-4 w-4" /> Generate Payment Link
                </Button>
                <Button variant="outline" className="w-full gap-2" onClick={handleDownloadProposal} disabled={generating}>
                  <Download className="h-4 w-4" /> Download Proposal PDF
                </Button>
                <Button className="w-full gap-2" onClick={() => setFormOpen(true)}>
                  Admission Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-start pt-6">
        <Button variant="outline" onClick={onBack} size="lg">Back to Configuration</Button>
      </div>
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="w-[96vw] max-w-5xl h-[90vh] max-h-[90vh] p-8 overflow-hidden gap-0">
          <div className="w-full h-full overflow-auto">
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSfVm_DgUvvav146q_f4leT9BnMkfTsfKjVPS9wGijE-3rfmMg/viewform?embedded=true"
              className="w-full h-full block"
              frameBorder={0}
            />
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="w-[96vw] max-w-5xl h-[90vh] max-h-[90vh] p-8 overflow-hidden gap-0">
          <div className="w-full h-full overflow-auto">
            <iframe
              src="https://rzp.io/rzp/UTbYxyp"
              className="w-full h-full block"
              frameBorder={0}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
