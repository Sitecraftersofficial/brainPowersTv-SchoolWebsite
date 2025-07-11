import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface Plan {
  id: string;
  name_en: string;
  name_fr: string;
  name_rw: string;
  description_en: string;
  description_fr: string;
  description_rw: string;
  price_rwf: number;
  duration_days: number;
  attempts_included: number | null;
  features_en: any;
  features_fr: any;
  features_rw: any;
  display_order: number;
}

export const usePlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (error) throw error;
        setPlans(data || []);
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const getLocalizedPlan = (plan: Plan) => ({
    ...plan,
    name: plan[`name_${language}` as keyof Plan] as string,
    description: plan[`description_${language}` as keyof Plan] as string,
    features: plan[`features_${language}` as keyof Plan] as string[],
  });

  const localizedPlans = plans.map(getLocalizedPlan);

  return { plans: localizedPlans, loading };
};