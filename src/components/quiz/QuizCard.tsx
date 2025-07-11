import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Trophy } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface QuizCardProps {
  quiz: {
    id: string;
    title: string;
    description: string;
    is_premium: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
    duration_minutes: number;
    category: string;
  };
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const hasActivePlan = profile?.current_plan_id && profile?.plan_expires_at && new Date(profile.plan_expires_at) > new Date();
  const isAdmin = profile?.is_admin;
  const canAccess = !quiz.is_premium || hasActivePlan || isAdmin;

  const handleStartQuiz = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!canAccess) {
      navigate('/#plans');
      return;
    }

    navigate(`/quiz/${quiz.id}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg">{quiz.title}</CardTitle>
          <div className="flex gap-2">
            {quiz.is_premium && <Badge variant="secondary">{t('quiz.premium')}</Badge>}
            <Badge className={getDifficultyColor(quiz.difficulty)}>
              {t(`quiz.${quiz.difficulty}`)}
            </Badge>
          </div>
        </div>
        <CardDescription>{quiz.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{quiz.duration_minutes} {t('quiz.minutes')}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleStartQuiz}
          disabled={!user && quiz.is_premium}
        >
          {!user ? t('quiz.loginRequired') : 
           !canAccess ? t('quiz.upgradeRequired') : 
           t('quiz.startQuiz')}
        </Button>
      </CardFooter>
    </Card>
  );
};