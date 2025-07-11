import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const hasActivePlan = profile?.current_plan_id && profile?.plan_expires_at && new Date(profile.plan_expires_at) > new Date();
  const isAdmin = profile?.is_admin;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.welcome')} {profile?.full_name || user.email}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Current Plan Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.currentPlan')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isAdmin ? (
              <Badge variant="secondary" className="mb-4">Admin Access</Badge>
            ) : hasActivePlan ? (
              <div>
                <Badge variant="default" className="mb-2">Active Plan</Badge>
                <p className="text-sm text-muted-foreground">
                  {t('dashboard.planExpiry')}: {new Date(profile.plan_expires_at).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div>
                <p className="mb-2">{t('dashboard.noPlan')}</p>
                <Button size="sm" onClick={() => navigate('/')}>
                  {t('dashboard.upgradeNow')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quiz Attempts Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.attemptsRemaining')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isAdmin ? (
              <p className="text-2xl font-bold">{t('dashboard.unlimited')}</p>
            ) : (
              <div>
                <p className="text-2xl font-bold">{profile?.attempts_left || 0}</p>
                <p className="text-sm text-muted-foreground">
                  {t('dashboard.totalAttempts')}: {profile?.total_attempts_used || 0}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" onClick={() => navigate('/quizzes')}>
              {t('nav.quizzes')}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/lessons')}>
              {t('nav.lessons')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;