import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuizzes } from '@/hooks/useQuizzes';
import { QuizCard } from '@/components/quiz/QuizCard';

const Quizzes = () => {
  const { t } = useLanguage();
  const { quizzes, loading } = useQuizzes();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  const categories = [...new Set(quizzes.map(quiz => quiz.category))];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('quiz.title')}</h1>
        <p className="text-muted-foreground">Practice with our comprehensive quiz collection</p>
      </div>

      {categories.map(category => {
        const categoryQuizzes = quizzes.filter(quiz => quiz.category === category);
        
        return (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-semibold mb-4 capitalize">{category.replace('_', ' ')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryQuizzes.map(quiz => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          </div>
        );
      })}

      {quizzes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No quizzes available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default Quizzes;