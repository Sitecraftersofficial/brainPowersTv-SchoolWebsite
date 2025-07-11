import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  text_en: string;
  text_fr: string;
  text_rw: string;
  options_en: string[];
  options_fr: string[];
  options_rw: string[];
  correct_answer: number;
  explanation_en?: string;
  explanation_fr?: string;
  explanation_rw?: string;
  image_url?: string;
  display_order: number;
}

interface Quiz {
  id: string;
  title_en: string;
  title_fr: string;
  title_rw: string;
  description_en?: string;
  description_fr?: string;
  description_rw?: string;
  duration_minutes: number;
  pass_percentage: number;
  is_premium: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

const QuizTaking = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchQuizData();
  }, [id, user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && timeLeft > 0 && !isCompleted) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            submitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, timeLeft, isCompleted]);

  const fetchQuizData = async () => {
    if (!id) return;
    
    try {
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (quizError) throw quizError;

      if (quizData.is_premium && !profile?.is_admin) {
        if (!profile?.current_plan_id || !profile?.plan_expires_at) {
          toast({
            title: t('quiz.premium_required'),
            description: t('quiz.upgrade_to_access'),
            variant: 'destructive',
          });
          navigate('/');
          return;
        }

        const planExpiry = new Date(profile.plan_expires_at);
        if (planExpiry < new Date()) {
          toast({
            title: t('quiz.plan_expired'),
            description: t('quiz.renew_plan'),
            variant: 'destructive',
          });
          navigate('/');
          return;
        }

        if (profile.attempts_left !== null && profile.attempts_left <= 0) {
          toast({
            title: t('quiz.no_attempts'),
            description: t('quiz.upgrade_for_more'),
            variant: 'destructive',
          });
          navigate('/');
          return;
        }
      }

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', id)
        .order('display_order');

      if (questionsError) throw questionsError;

      setQuiz(quizData);
      setQuestions(questionsData.map(q => ({
        ...q,
        options_en: q.options_en as string[],
        options_fr: q.options_fr as string[],
        options_rw: q.options_rw as string[]
      })));
      setTimeLeft(quizData.duration_minutes * 60);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast({
        title: t('common.error'),
        description: t('quiz.load_error'),
        variant: 'destructive',
      });
      navigate('/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setIsStarted(true);
    setStartTime(new Date());
  };

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: parseInt(value)
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const submitQuiz = async () => {
    if (!quiz || !startTime || !user) return;

    const endTime = new Date();
    const timeTaken = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
    
    let correctAnswers = 0;
    questions.forEach(question => {
      if (answers[question.id] === question.correct_answer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= quiz.pass_percentage;

    try {
      await supabase.from('quiz_attempts').insert({
        user_id: user.id,
        quiz_id: quiz.id,
        started_at: startTime.toISOString(),
        completed_at: endTime.toISOString(),
        time_taken_seconds: timeTaken,
        score,
        correct_answers: correctAnswers,
        total_questions: questions.length,
        passed,
        submitted_answers: answers
      });

      if (quiz.is_premium && profile && !profile.is_admin && profile.attempts_left !== null) {
        // Decrement attempts if user has limited attempts
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            attempts_left: Math.max(0, (profile.attempts_left || 0) - 1),
            total_attempts_used: (profile.total_attempts_used || 0) + 1 
          })
          .eq('user_id', user.id);
        
        if (updateError) console.error('Error updating attempts:', updateError);
      }

      setIsCompleted(true);
      
      toast({
        title: passed ? t('quiz.passed') : t('quiz.failed'),
        description: `${t('quiz.score')}: ${score}%`,
        variant: passed ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: t('common.error'),
        description: t('quiz.submit_error'),
        variant: 'destructive',
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuizTitle = () => {
    if (!quiz) return '';
    switch (language) {
      case 'fr': return quiz.title_fr;
      case 'rw': return quiz.title_rw;
      default: return quiz.title_en;
    }
  };

  const getQuestionText = (question: Question) => {
    switch (language) {
      case 'fr': return question.text_fr;
      case 'rw': return question.text_rw;
      default: return question.text_en;
    }
  };

  const getQuestionOptions = (question: Question) => {
    switch (language) {
      case 'fr': return question.options_fr;
      case 'rw': return question.options_rw;
      default: return question.options_en;
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

  if (!quiz || questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('quiz.not_found')}</h2>
            <p className="text-muted-foreground mb-4">{t('quiz.not_found_desc')}</p>
            <Button onClick={() => navigate('/quizzes')}>{t('quiz.back_to_quizzes')}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6 sm:p-8 text-center">
            <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-primary mx-auto mb-6" />
            <h2 className="text-xl sm:text-2xl font-bold mb-4">{t('quiz.completed')}</h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6">{t('quiz.thank_you')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/quizzes')} className="w-full sm:w-auto">
                {t('quiz.back_to_quizzes')}
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full sm:w-auto">
                {t('nav.dashboard')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">{getQuizTitle()}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{t('quiz.duration')}: {quiz.duration_minutes} {t('common.minutes')}</span>
              </div>
              <div>
                <span>{t('quiz.questions')}: {questions.length}</span>
              </div>
              <div>
                <span>{t('quiz.pass_percentage')}: {quiz.pass_percentage}%</span>
              </div>
              <div>
                <span className={`px-2 py-1 rounded text-xs ${
                  quiz.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {t(`quiz.difficulty.${quiz.difficulty}`)}
                </span>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-2">{t('quiz.instructions')}</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t('quiz.instruction_1')}</li>
                <li>• {t('quiz.instruction_2')}</li>
                <li>• {t('quiz.instruction_3')}</li>
                <li>• {t('quiz.instruction_4')}</li>
              </ul>
            </div>

            <Button onClick={startQuiz} className="w-full" size="lg">
              {t('quiz.start_quiz')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h1 className="text-lg sm:text-xl font-semibold truncate">{getQuizTitle()}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span className={timeLeft < 300 ? 'text-destructive font-bold' : ''}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {currentQuestion + 1} / {questions.length}
              </span>
            </div>
          </div>
          
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg leading-relaxed">
              {getQuestionText(currentQ)}
            </CardTitle>
            {currentQ.image_url && (
              <div className="mt-4">
                <img 
                  src={currentQ.image_url} 
                  alt="Question illustration"
                  className="max-w-full h-auto rounded-lg shadow-sm"
                />
              </div>
            )}
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[currentQ.id]?.toString() || ''}
              onValueChange={handleAnswerChange}
              className="space-y-3"
            >
              {getQuestionOptions(currentQ).map((option, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} className="mt-1 flex-shrink-0" />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer leading-relaxed text-sm sm:text-base">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="flex-1 sm:flex-none"
            >
              {t('quiz.previous')}
            </Button>
            {currentQuestion < questions.length - 1 ? (
              <Button 
                onClick={nextQuestion}
                className="flex-1 sm:flex-none"
              >
                {t('quiz.next')}
              </Button>
            ) : (
              <Button 
                onClick={submitQuiz}
                className="flex-1 sm:flex-none"
                variant="default"
              >
                {t('quiz.submit')}
              </Button>
            )}
          </div>
          
          <Button 
            variant="destructive" 
            onClick={submitQuiz}
            className="w-full sm:w-auto"
          >
            {t('quiz.finish_early')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizTaking;