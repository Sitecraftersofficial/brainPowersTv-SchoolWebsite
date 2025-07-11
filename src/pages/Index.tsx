import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Brain, TrendingUp, Globe, ArrowRight, CheckCircle } from 'lucide-react';
import { PlanCard } from '@/components/plans/PlanCard';
import { usePlans } from '@/hooks/usePlans';

const Index = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { plans, loading } = usePlans();

  const features = [
    {
      icon: Brain,
      title: t('home.features.quiz.title'),
      description: t('home.features.quiz.description'),
    },
    {
      icon: BookOpen,
      title: t('home.features.lessons.title'),
      description: t('home.features.lessons.description'),
    },
    {
      icon: TrendingUp,
      title: t('home.features.progress.title'),
      description: t('home.features.progress.description'),
    },
    {
      icon: Globe,
      title: t('home.features.multilingual.title'),
      description: t('home.features.multilingual.description'),
    },
  ];

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {t('home.title')}
            <span className="block text-primary-200">{t('home.subtitle')}</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-200 max-w-3xl mx-auto">
            {t('home.description')}
          </p>
          <div className="space-x-4">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-primary-900 hover:bg-primary-200 shadow-elegant"
            >
              {t('home.getStarted')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/quizzes')}
              className="border-white text-primary-900 hover:bg-primary-200"
            >
              {t('nav.quizzes')}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-subtle">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              {t('home.features.title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="gradient-card shadow-elegant border-0 transition-smooth hover:shadow-glow">
                <CardHeader className="text-center">
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              {t('plans.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('plans.subtitle')}
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="text-lg">{t('common.loading')}</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {plans?.map((plan, index) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isPopular={index === 2} // Make the "1 Month" plan popular
                  onSelect={() => navigate(`/payment/${plan.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-bg text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl mb-8 text-primary-200 max-w-2xl mx-auto">
            {t('home.cta.description')}
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="bg-white text-primary-900 hover:bg-primary-200 shadow-elegant"
          >
            {user ? t('nav.dashboard') : t('home.getStarted')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;