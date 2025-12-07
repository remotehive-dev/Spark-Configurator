import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Student, CurriculumConfig, PricingConfig, PRICING_RULES } from "@/lib/types";
import { Check, Crown, Download, Share2, Sparkles, Tag, Zap } from "lucide-react";
import { useState } from "react";
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

  // Calculate Costs
  const totalClasses = curriculum.classesPerWeek * 4 * curriculum.durationMonths; // Approx 4 weeks/month
  const baseRate = curriculum.classesPerWeek === 3 ? PRICING_RULES.baseRate3Classes : PRICING_RULES.baseRate5Classes;
  const baseTotal = totalClasses * baseRate;

  // Discounts
  let totalDiscount = 0;
  
  // Tenure Discount
  const tenureDiscountRate = 
    curriculum.durationMonths >= 24 ? PRICING_RULES.longTermDiscount[24] :
    curriculum.durationMonths >= 18 ? PRICING_RULES.longTermDiscount[18] :
    curriculum.durationMonths >= 12 ? PRICING_RULES.longTermDiscount[12] :
    curriculum.durationMonths >= 6 ? PRICING_RULES.longTermDiscount[6] : 0;
  
  const tenureDiscountAmount = baseTotal * tenureDiscountRate;
  totalDiscount += tenureDiscountAmount;

  // SAP Discount
  const sapDiscountAmount = pricing.sapEnabled ? baseTotal * PRICING_RULES.sapDiscount : 0;
  totalDiscount += sapDiscountAmount;

  // Coupon Discount (Mock)
  const couponDiscountAmount = appliedCoupon ? 2000 : 0; // Flat 2000 off for valid coupon
  totalDiscount += couponDiscountAmount;

  const finalPrice = baseTotal - totalDiscount;
  const savingsPercentage = Math.round((totalDiscount / baseTotal) * 100);

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
                  <span className="text-muted-foreground">Duration</span>
                  <p className="font-semibold">{curriculum.durationMonths} Months</p>
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
          <Card className="shadow-lg border-t-4 border-t-primary">
            <CardContent className="pt-6 space-y-6">
              <h3 className="font-bold text-xl text-center text-primary">Investment Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Fee</span>
                  <span>₹{baseTotal.toLocaleString()}</span>
                </div>
                
                {tenureDiscountAmount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Tenure Discount ({tenureDiscountRate * 100}%)</span>
                    <span>- ₹{tenureDiscountAmount.toLocaleString()}</span>
                  </div>
                )}
                
                {sapDiscountAmount > 0 && (
                  <div className="flex justify-between text-secondary font-medium">
                    <span>SAP Scholarship (15%)</span>
                    <span>- ₹{sapDiscountAmount.toLocaleString()}</span>
                  </div>
                )}

                {couponDiscountAmount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Coupon ({appliedCoupon})</span>
                    <span>- ₹{couponDiscountAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-1">
                <div className="flex justify-between items-end">
                  <span className="font-medium text-lg">Total</span>
                  <span className="font-bold text-3xl">₹{finalPrice.toLocaleString()}</span>
                </div>
                {savingsPercentage > 0 && (
                  <p className="text-right text-xs text-success font-medium">
                    You save {savingsPercentage}% (₹{totalDiscount.toLocaleString()})
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                 <Label className="text-xs uppercase text-muted-foreground">Counsellor Discount Code</Label>
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
                <Button className="w-full h-12 text-lg gap-2 shadow-md hover:shadow-lg transition-all">
                  <Share2 className="h-4 w-4" /> Generate Payment Link
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Download className="h-4 w-4" /> Download Proposal PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-start pt-6">
        <Button variant="outline" onClick={onBack} size="lg">Back to Configuration</Button>
      </div>
    </div>
  );
}
