import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface Quiz {
  id: string;
  title_en: string;
  title_fr: string;
  title_rw: string;
  description_en: string | null;
  description_fr: string | null;
  description_rw: string | null;
  is_premium: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  duration_minutes: number;
  category: string;
  display_order: number;
}

export const useQuizzes = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (error) throw error;
        setQuizzes(data || []);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const getLocalizedQuiz = (quiz: Quiz) => ({
    ...quiz,
    title: quiz[`title_${language}` as keyof Quiz] as string,
    description: quiz[`description_${language}` as keyof Quiz] as string,
  });

  const localizedQuizzes = quizzes.map(getLocalizedQuiz);

  return { quizzes: localizedQuizzes, loading };
};