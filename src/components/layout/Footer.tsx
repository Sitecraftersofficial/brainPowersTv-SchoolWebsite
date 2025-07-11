import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-muted/50 border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 text-primary font-bold text-xl mb-4">
              <BookOpen className="h-8 w-8" />
              <span>{t('home.title')}</span>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-md">
              {t('home.description')}
            </p>
            <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Kigali, Rwanda</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:support@roadlawrwanda.com" className='text-muted-foreground hover:text-primary-900 transition-colors'>support@roadlawrwanda.com</a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+250788123456" className='text-muted-foreground hover:text-primary-900 transition-colors'>+250 788 123 456</a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <div className="flex flex-col space-y-2 text-sm">
              <Link to="/quizzes" className="text-muted-foreground hover:text-primary transition-colors">
                {t('nav.quizzes')}
              </Link>
              <Link to="/lessons" className="text-muted-foreground hover:text-primary transition-colors">
                {t('nav.lessons')}
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                {t('nav.contact')}
              </Link>
              <Link to="/#plans" className="text-muted-foreground hover:text-primary transition-colors">
                {t('plans.title')}
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.support')}</h3>
            <div className="flex flex-col space-y-2 text-sm">
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                {t('footer.helpCenter')}
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                {t('footer.privacyPolicy')}
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                {t('footer.termsOfService')}
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {t('footer.copyright')}
            </p>
            <p className="text-sm text-muted-foreground mt-2 md:mt-0">
              {t('footer.tagline')} <a href="https://sitecraftersz.netlify.app/" className="hover:text-primary-900 underline">SiteCrafters</a> team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};