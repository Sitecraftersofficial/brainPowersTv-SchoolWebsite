import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, CreditCard, Smartphone, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Plan {
  id: string;
  name_en: string;
  name_fr: string;
  name_rw: string;
  description_en?: string;
  description_fr?: string;
  description_rw?: string;
  price_rwf: number;
  duration_days: number;
  attempts_included?: number;
  features_en: string[];
  features_fr: string[];
  features_rw: string[];
}

interface PaymentForm {
  phoneNumber: string;
}

type PaymentMethod = 'mtn_mobile_money' | 'airtel_money' | 'card';

const Payment = () => {
  const { planId } = useParams<{ planId: string }>();
  const { t, language } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [plan, setPlan] = useState<Plan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn_mobile_money');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<PaymentForm>();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchPlan();
  }, [planId, user]);

  const fetchPlan = async () => {
    if (!planId) return;
    
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setPlan({
        ...data,
        features_en: data.features_en as string[],
        features_fr: data.features_fr as string[],
        features_rw: data.features_rw as string[]
      });
    } catch (error) {
      console.error('Error fetching plan:', error);
      toast({
        title: t('common.error'),
        description: t('payment.plan_not_found'),
        variant: 'destructive',
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PaymentForm) => {
    if (!plan || !user) return;

    setProcessing(true);
    try {
      // Create payment record
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          plan_id: plan.id,
          amount_rwf: plan.price_rwf,
          payment_method: paymentMethod,
          phone_number: paymentMethod !== 'card' ? data.phoneNumber : null,
          status: 'pending'
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // For demo purposes, we'll simulate a successful payment
      // In a real implementation, you would integrate with actual payment providers
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing

      // Update payment status to completed
      const { error: updateError } = await supabase
        .from('payments')
        .update({ status: 'completed' })
        .eq('id', paymentData.id);

      if (updateError) throw updateError;

      // Create or update user plan
      const planStartDate = new Date();
      const planEndDate = new Date();
      planEndDate.setDate(planStartDate.getDate() + plan.duration_days);

      const { error: planError } = await supabase
        .from('user_plans')
        .insert({
          user_id: user.id,
          plan_id: plan.id,
          starts_at: planStartDate.toISOString(),
          expires_at: planEndDate.toISOString(),
          attempts_remaining: plan.attempts_included,
          status: 'active'
        });

      if (planError) throw planError;

      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          current_plan_id: plan.id,
          plan_expires_at: planEndDate.toISOString(),
          attempts_left: plan.attempts_included
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      toast({
        title: t('payment.success'),
        description: t('payment.success_message'),
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: t('payment.failed'),
        description: t('payment.error_message'),
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const getPlanName = () => {
    if (!plan) return '';
    switch (language) {
      case 'fr': return plan.name_fr;
      case 'rw': return plan.name_rw;
      default: return plan.name_en;
    }
  };

  const getPlanDescription = () => {
    if (!plan) return '';
    switch (language) {
      case 'fr': return plan.description_fr;
      case 'rw': return plan.description_rw;
      default: return plan.description_en;
    }
  };

  const getPlanFeatures = () => {
    if (!plan) return [];
    switch (language) {
      case 'fr': return plan.features_fr;
      case 'rw': return plan.features_rw;
      default: return plan.features_en;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'card': return <CreditCard className="h-5 w-5" />;
      default: return <Smartphone className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('payment.plan_not_found')}</h2>
            <p className="text-muted-foreground mb-4">{t('payment.plan_not_found_desc')}</p>
            <Button onClick={() => navigate('/')}>{t('common.go_back')}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('payment.title')}</h1>
          <p className="text-muted-foreground">{t('payment.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{t('payment.order_summary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">{getPlanName()}</h3>
                {getPlanDescription() && (
                  <p className="text-muted-foreground text-sm">{getPlanDescription()}</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t('payment.duration')}</span>
                  <span className="font-medium">
                    {plan.duration_days} {t('common.days')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t('payment.attempts')}</span>
                  <span className="font-medium">
                    {plan.attempts_included ? plan.attempts_included : t('payment.unlimited')}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>{t('payment.total')}</span>
                  <span>{formatPrice(plan.price_rwf)}</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">{t('payment.features_included')}</h4>
                <ul className="space-y-2">
                  {getPlanFeatures().map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>{t('payment.payment_details')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">{t('payment.payment_method')}</Label>
                  <RadioGroup 
                    value={paymentMethod} 
                    onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value="mtn_mobile_money" id="mtn" />
                      <Label htmlFor="mtn" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-5 w-5 text-yellow-600" />
                          <span className="font-medium">MTN Mobile Money</span>
                        </div>
                        <Badge variant="secondary" className="ml-auto">Popular</Badge>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value="airtel_money" id="airtel" />
                      <Label htmlFor="airtel" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-5 w-5 text-red-600" />
                          <span className="font-medium">Airtel Money</span>
                        </div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">{t('payment.credit_card')}</span>
                        </div>
                        <Badge variant="outline">{t('payment.demo_only')}</Badge>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Phone Number Input (for mobile money) */}
                {paymentMethod !== 'card' && (
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">{t('payment.phone_number')} *</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+250 7XX XXX XXX"
                      {...register('phoneNumber', {
                        required: t('payment.phone_required'),
                        pattern: {
                          value: /^(\+250|250)?[0-9]{9}$/,
                          message: t('payment.phone_invalid')
                        }
                      })}
                      className={errors.phoneNumber ? 'border-destructive' : ''}
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t('payment.phone_help')}
                    </p>
                  </div>
                )}

                {/* Card Demo Notice */}
                {paymentMethod === 'card' && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>{t('payment.demo_notice')}:</strong> {t('payment.demo_description')}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  disabled={processing} 
                  className="w-full" 
                  size="lg"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      {t('payment.processing')}
                    </>
                  ) : (
                    <>
                      {getPaymentMethodIcon(paymentMethod)}
                      <span className="ml-2">
                        {t('payment.pay_now')} {formatPrice(plan.price_rwf)}
                      </span>
                    </>
                  )}
                </Button>

                {/* Security Notice */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    🔒 {t('payment.security_notice')}
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payment;