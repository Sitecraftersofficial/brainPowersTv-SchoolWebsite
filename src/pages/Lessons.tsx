import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLessons } from '@/hooks/useLessons';
import { LessonCard } from '@/components/lesson/LessonCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Lessons = () => {
  const { t } = useLanguage();
  const { lessons, loading } = useLessons();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  const categories = [
    'road_signs',
    'traffic_rules', 
    'safety',
    'vehicle_control',
    'emergency_procedures'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('lessons.title')}</h1>
        <p className="text-muted-foreground">{t('lessons.subtitle')}</p>
      </div>

      <Tabs defaultValue={categories[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {t(`lessons.categories.${category}`)}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => {
          const categoryLessons = lessons.filter(lesson => lesson.category === category);
          
          return (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryLessons.map(lesson => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))}
              </div>
              
              {categoryLessons.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No lessons available in this category yet.</p>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default Lessons;