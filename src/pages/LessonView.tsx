import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Download, FileText, Lock, Play, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Lesson {
  id: string;
  title_en: string;
  title_fr: string;
  title_rw: string;
  description_en?: string;
  description_fr?: string;
  description_rw?: string;
  content_en?: string;
  content_fr?: string;
  content_rw?: string;
  category: 'road_signs' | 'traffic_rules' | 'safety' | 'vehicle_control' | 'emergency_procedures';
  lesson_type: 'markdown' | 'video' | 'pdf';
  is_premium: boolean;
  video_url?: string;
  file_url?: string;
  display_order: number;
}

interface LessonProgress {
  id: string;
  lesson_id: string;
  user_id: string;
  completed: boolean;
  completed_at?: string;
}

const LessonView = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchLessonData();
  }, [id, user]);

  const fetchLessonData = async () => {
    if (!id) return;
    
    try {
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (lessonError) throw lessonError;

      // Check if user has access to premium lessons
      if (lessonData.is_premium && !profile?.is_admin) {
        if (!profile?.current_plan_id || !profile?.plan_expires_at) {
          toast({
            title: t('lesson.premium_required'),
            description: t('lesson.upgrade_to_access'),
            variant: 'destructive',
          });
          navigate('/lessons');
          return;
        }

        const planExpiry = new Date(profile.plan_expires_at);
        if (planExpiry < new Date()) {
          toast({
            title: t('lesson.plan_expired'),
            description: t('lesson.renew_plan'),
            variant: 'destructive',
          });
          navigate('/lessons');
          return;
        }
      }

      // Fetch user progress for this lesson
      if (user) {
        const { data: progressData } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('lesson_id', id)
          .eq('user_id', user.id)
          .single();

        setProgress(progressData);
      }

      setLesson(lessonData);
    } catch (error) {
      console.error('Error fetching lesson:', error);
      toast({
        title: t('common.error'),
        description: t('lesson.load_error'),
        variant: 'destructive',
      });
      navigate('/lessons');
    } finally {
      setLoading(false);
    }
  };

  const markAsComplete = async () => {
    if (!lesson || !user || markingComplete) return;

    setMarkingComplete(true);
    try {
      if (progress) {
        // Update existing progress
        const { error } = await supabase
          .from('lesson_progress')
          .update({ 
            completed: true, 
            completed_at: new Date().toISOString() 
          })
          .eq('id', progress.id);

        if (error) throw error;
      } else {
        // Create new progress record
        const { error } = await supabase
          .from('lesson_progress')
          .insert({
            lesson_id: lesson.id,
            user_id: user.id,
            completed: true,
            completed_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      setProgress(prev => prev ? { ...prev, completed: true, completed_at: new Date().toISOString() } : {
        id: '',
        lesson_id: lesson.id,
        user_id: user.id,
        completed: true,
        completed_at: new Date().toISOString()
      });

      toast({
        title: t('lesson.completed'),
        description: t('lesson.progress_saved'),
      });
    } catch (error) {
      console.error('Error marking lesson as complete:', error);
      toast({
        title: t('common.error'),
        description: t('lesson.progress_error'),
        variant: 'destructive',
      });
    } finally {
      setMarkingComplete(false);
    }
  };

  const getLessonTitle = () => {
    if (!lesson) return '';
    switch (language) {
      case 'fr': return lesson.title_fr;
      case 'rw': return lesson.title_rw;
      default: return lesson.title_en;
    }
  };

  const getLessonDescription = () => {
    if (!lesson) return '';
    switch (language) {
      case 'fr': return lesson.description_fr;
      case 'rw': return lesson.description_rw;
      default: return lesson.description_en;
    }
  };

  const getLessonContent = () => {
    if (!lesson) return '';
    switch (language) {
      case 'fr': return lesson.content_fr;
      case 'rw': return lesson.content_rw;
      default: return lesson.content_en;
    }
  };

  const getCategoryLabel = (category: string) => {
    return t(`lessons.categories.${category}`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
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

  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('lessons.not_found')}</h2>
            <p className="text-muted-foreground mb-4">{t('lessons.not_found_desc')}</p>
            <Button onClick={() => navigate('/lessons')}>{t('lessons.back_to_lessons')}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/lessons')}
            className="mb-4"
          >
            ← {t('lessons.back_to_lessons')}
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{getLessonTitle()}</h1>
              {getLessonDescription() && (
                <p className="text-muted-foreground text-base sm:text-lg">{getLessonDescription()}</p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Badge variant={lesson.is_premium ? "default" : "secondary"} className="w-fit">
                {lesson.is_premium ? (
                  <>
                    <Lock className="h-3 w-3 mr-1" />
                    {t('lesson.premium')}
                  </>
                ) : (
                  t('lesson.free')
                )}
              </Badge>
              
              <Badge variant="outline" className="w-fit">
                {getTypeIcon(lesson.lesson_type)}
                <span className="ml-1">{t(`lesson.type.${lesson.lesson_type}`)}</span>
              </Badge>
              
              <Badge variant="outline" className="w-fit">
                {getCategoryLabel(lesson.category)}
              </Badge>
            </div>
          </div>

          {/* Progress indicator */}
          {progress?.completed && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mb-4">
              <CheckCircle className="h-4 w-4" />
              <span>{t('lesson.completed_on')} {new Date(progress.completed_at!).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {lesson.lesson_type === 'video' && lesson.video_url && (
            <Card>
              <CardContent className="p-6">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                  <iframe
                    src={lesson.video_url}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                    title={getLessonTitle()}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {lesson.lesson_type === 'pdf' && lesson.file_url && (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{t('lesson.pdf_document')}</span>
                  </div>
                  <Button asChild className="w-full sm:w-auto">
                    <a href={lesson.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      {t('lesson.download_pdf')}
                    </a>
                  </Button>
                </div>
                
                <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
                  <iframe
                    src={`${lesson.file_url}#view=FitH`}
                    className="w-full h-full rounded-lg"
                    title={getLessonTitle()}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {lesson.lesson_type === 'markdown' && getLessonContent() && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t('lesson.content')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-slate dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: getLessonContent().replace(/\n/g, '<br/>') 
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Mark as Complete Button */}
          <div className="flex justify-center pt-6">
            {!progress?.completed ? (
              <Button 
                onClick={markAsComplete}
                disabled={markingComplete}
                size="lg"
                className="w-full sm:w-auto"
              >
                {markingComplete ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    {t('lesson.marking_complete')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t('lesson.mark_complete')}
                  </>
                )}
              </Button>
            ) : (
              <Button variant="outline" size="lg" disabled className="w-full sm:w-auto">
                <CheckCircle className="h-4 w-4 mr-2" />
                {t('lesson.completed')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonView;