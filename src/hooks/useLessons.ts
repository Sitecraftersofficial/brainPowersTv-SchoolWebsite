import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface Lesson {
  id: string;
  title_en: string;
  title_fr: string;
  title_rw: string;
  description_en: string | null;
  description_fr: string | null;
  description_rw: string | null;
  content_en: string | null;
  content_fr: string | null;
  content_rw: string | null;
  is_premium: boolean;
  category: 'road_signs' | 'traffic_rules' | 'safety' | 'vehicle_control' | 'emergency_procedures';
  lesson_type: 'markdown' | 'video' | 'pdf';
  display_order: number;
  file_url: string | null;
  video_url: string | null;
}

export const useLessons = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (error) throw error;
        setLessons(data || []);
      } catch (error) {
        console.error('Error fetching lessons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  const getLocalizedLesson = (lesson: Lesson) => ({
    ...lesson,
    title: lesson[`title_${language}` as keyof Lesson] as string,
    description: lesson[`description_${language}` as keyof Lesson] as string,
    content: lesson[`content_${language}` as keyof Lesson] as string,
  });

  const localizedLessons = lessons.map(getLocalizedLesson);

  return { lessons: localizedLessons, loading };
};