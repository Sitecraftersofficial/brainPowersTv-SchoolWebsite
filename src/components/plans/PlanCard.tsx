import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Check, Star } from 'lucide-react';

interface PlanCardProps {
  plan: {
    id: string;
    name: string;
    description: string;
    price_rwf: number;
    duration_days: number;
    attempts_included: number | null;
    features: string[];
  };
  isPopular?: boolean;
  onSelect: () => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, isPopular, onSelect }) => {
  const { t } = useLanguage();

  return (
    <Card 
      className={`relative transition-all duration-300 hover:shadow-lg ${
        isPopular 
          ? 'border-primary shadow-elegant scale-105' 
          : 'hover:shadow-md'
      }`}
    >
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 gradient-bg text-white">
          <Star className="w-3 h-3 mr-1" />
          {t('plans.popular')}
        </Badge>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
        <CardDescription className="min-h-[3rem]">{plan.description}</CardDescription>
        <div className="mt-4">
          <span className="text-3xl font-bold text-primary">
            {plan.price_rwf.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground ml-1">
            {t('plans.priceUnit')}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          {plan.duration_days} {plan.duration_days === 1 ? 'day' : 'days'}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">{t('plans.features')}</p>
          <ul className="space-y-2">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <Button 
          className={`w-full transition-smooth ${
            isPopular 
              ? 'gradient-bg text-white shadow-elegant hover:shadow-glow' 
              : ''
          }`}
          onClick={onSelect}
        >
          {t('plans.selectPlan')}
        </Button>
      </CardContent>
    </Card>
  );
};