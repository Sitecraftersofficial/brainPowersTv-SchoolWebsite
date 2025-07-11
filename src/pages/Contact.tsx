import React from 'react';
import { useForm } from 'react-hook-form';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Mail, Phone, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

const Contact = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactForm>({
    defaultValues: {
      name: '',
      email: user?.email || '',
      message: ''
    }
  });

  const onSubmit = async (data: ContactForm) => {
    try {
      const response = await fetch('https://formspree.io/f/xdknkkqz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          message: data.message,
          _subject: 'New Contact Form Submission - Road Law Learning Rwanda'
        }),
      });

      if (response.ok) {
        toast({
          title: t('contact.success'),
          description: t('contact.success_message'),
        });
        reset();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t('common.error'),
        description: t('contact.error_message'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t('contact.title')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                {t('contact.send_message')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('contact.name')} *</Label>
                  <Input
                    id="name"
                    {...register('name', { required: t('contact.name_required') })}
                    placeholder={t('contact.name_placeholder')}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('contact.email')} *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email', { 
                      required: t('contact.email_required'),
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: t('contact.email_invalid')
                      }
                    })}
                    placeholder={t('contact.email_placeholder')}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">{t('contact.message')} *</Label>
                  <Textarea
                    id="message"
                    {...register('message', { required: t('contact.message_required') })}
                    placeholder={t('contact.message_placeholder')}
                    rows={6}
                    className={errors.message ? 'border-destructive' : ''}
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive">{errors.message.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      {t('contact.sending')}
                    </>
                  ) : (
                    t('contact.send_message')
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {t('contact.get_in_touch')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{t('contact.address')}</p>
                    <p className="text-sm text-muted-foreground">
                      Kigali, Rwanda<br />
                      {t('contact.address_details')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{t('contact.email_us')}</p>
                    <p className="text-sm text-muted-foreground">
                      support@roadlawrwanda.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{t('contact.call_us')}</p>
                    <p className="text-sm text-muted-foreground">
                      +250 788 123 456
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{t('contact.business_hours')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('contact.hours_weekdays')}<br />
                      {t('contact.hours_weekend')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle>{t('contact.faq_title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-1">{t('contact.faq_1_q')}</h4>
                  <p className="text-sm text-muted-foreground">{t('contact.faq_1_a')}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">{t('contact.faq_2_q')}</h4>
                  <p className="text-sm text-muted-foreground">{t('contact.faq_2_a')}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">{t('contact.faq_3_q')}</h4>
                  <p className="text-sm text-muted-foreground">{t('contact.faq_3_a')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Kigali Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t('contact.find_us')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64 sm:h-96 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127641.38037948966!2d30.013486550000003!3d-1.9436096!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca4258ed8e797%3A0xf32b36a5411d0bc8!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1642442842865!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t('contact.kigali_map')}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;