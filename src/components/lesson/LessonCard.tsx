import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Video, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LessonCardProps {
  lesson: {
    id: string;
    title: string;
    description: string;
    is_premium: boolean;
    category: string;
    lesson_type: 'markdown' | 'video' | 'pdf';
    file_url: string | null;
    video_url: string | null;
  };
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson }) => {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const hasActivePlan = profile?.current_plan_id && profile?.plan_expires_at && new Date(profile.plan_expires_at) > new Date();
  const isAdmin = profile?.is_admin;
  const canAccess = !lesson.is_premium || hasActivePlan || isAdmin;

  const handleOpenLesson = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!canAccess) {
      navigate('/#plans');
      return;
    }

    navigate(`/lesson/${lesson.id}`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'pdf': return <Download className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryName = (category: string) => {
    return t(`lessons.categories.${category}`);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg">{lesson.title}</CardTitle>
          <div className="flex gap-2">
            {lesson.is_premium && <Badge variant="secondary">{t('lessons.premium')}</Badge>}
            <Badge variant="outline" className="flex items-center gap-1">
              {getTypeIcon(lesson.lesson_type)}
              <span className="capitalize">{lesson.lesson_type}</span>
            </Badge>
          </div>
        </div>
        <CardDescription>{lesson.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Category:</span> {getCategoryName(lesson.category)}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button 
          className="flex-1" 
          onClick={handleOpenLesson}
          disabled={!user && lesson.is_premium}
        >
          {!user ? t('lessons.loginRequired') : 
           !canAccess ? t('lessons.upgradeRequired') : 
           t('lessons.readLesson')}
        </Button>
        
        {lesson.lesson_type === 'pdf' && lesson.file_url && canAccess && (
          <Button variant="outline" size="icon" asChild>
            <a href={lesson.file_url} download target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};