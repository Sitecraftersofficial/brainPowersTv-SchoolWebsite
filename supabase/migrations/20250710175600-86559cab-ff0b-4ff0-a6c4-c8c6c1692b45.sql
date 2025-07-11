-- Create ENUMs first
CREATE TYPE public.plan_status AS ENUM ('active', 'expired', 'cancelled');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE public.payment_method AS ENUM ('mtn_mobile_money', 'airtel_money', 'card');
CREATE TYPE public.difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE public.lesson_type AS ENUM ('markdown', 'video', 'pdf');
CREATE TYPE public.lesson_category AS ENUM ('road_signs', 'traffic_rules', 'safety', 'vehicle_control', 'emergency_procedures');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  language TEXT NOT NULL DEFAULT 'en',
  is_admin BOOLEAN NOT NULL DEFAULT false,
  current_plan_id UUID,
  plan_expires_at TIMESTAMP WITH TIME ZONE,
  attempts_left INTEGER,
  total_attempts_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create plans table
CREATE TABLE public.plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  name_rw TEXT NOT NULL,
  description_en TEXT,
  description_fr TEXT,
  description_rw TEXT,
  price_rwf INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  attempts_included INTEGER, -- NULL means unlimited
  features_en JSONB NOT NULL DEFAULT '[]',
  features_fr JSONB NOT NULL DEFAULT '[]',
  features_rw JSONB NOT NULL DEFAULT '[]',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_plans table
CREATE TABLE public.user_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  status plan_status NOT NULL DEFAULT 'active',
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts_remaining INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  amount_rwf INTEGER NOT NULL,
  payment_method payment_method NOT NULL,
  phone_number TEXT,
  status payment_status NOT NULL DEFAULT 'pending',
  transaction_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  title_rw TEXT NOT NULL,
  description_en TEXT,
  description_fr TEXT,
  description_rw TEXT,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  difficulty difficulty_level NOT NULL DEFAULT 'medium',
  category TEXT NOT NULL,
  pass_percentage INTEGER NOT NULL DEFAULT 70,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  text_en TEXT NOT NULL,
  text_fr TEXT NOT NULL,
  text_rw TEXT NOT NULL,
  options_en JSONB NOT NULL,
  options_fr JSONB NOT NULL,
  options_rw JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation_en TEXT,
  explanation_fr TEXT,
  explanation_rw TEXT,
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_attempts table
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  time_taken_seconds INTEGER NOT NULL,
  submitted_answers JSONB NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  title_rw TEXT NOT NULL,
  description_en TEXT,
  description_fr TEXT,
  description_rw TEXT,
  content_en TEXT,
  content_fr TEXT,
  content_rw TEXT,
  lesson_type lesson_type NOT NULL DEFAULT 'markdown',
  category lesson_category NOT NULL,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  file_url TEXT,
  video_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lesson_progress table
CREATE TABLE public.lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Create contact_messages table
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  admin_response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraint for current_plan_id
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_current_plan 
FOREIGN KEY (current_plan_id) REFERENCES public.plans(id) ON DELETE SET NULL;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_plans_updated_at BEFORE UPDATE ON public.user_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON public.quizzes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON public.lesson_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contact_messages_updated_at BEFORE UPDATE ON public.contact_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'language', 'en')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-creating profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- RLS Policies for user_plans
CREATE POLICY "Users can view their own plans" ON public.user_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own plans" ON public.user_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all plans" ON public.user_plans FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all payments" ON public.payments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- RLS Policies for quiz_attempts
CREATE POLICY "Users can view their own attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all attempts" ON public.quiz_attempts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- RLS Policies for lesson_progress
CREATE POLICY "Users can manage their own progress" ON public.lesson_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all progress" ON public.lesson_progress FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- RLS Policies for contact_messages
CREATE POLICY "Users can view their own messages" ON public.contact_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage all messages" ON public.contact_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- Public read access for plans, quizzes, questions, and lessons
CREATE POLICY "Anyone can view plans" ON public.plans FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view quizzes" ON public.quizzes FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (is_active = true);

-- Insert sample plans
INSERT INTO public.plans (name_en, name_fr, name_rw, description_en, description_fr, description_rw, price_rwf, duration_days, attempts_included, features_en, features_fr, features_rw, display_order) VALUES
('5 Exams', '5 Examens', '5 Ubugeni', 'Take up to 5 practice exams', 'Passez jusqu''à 5 examens pratiques', 'Kora ubugeni 5', 1000, 7, 5, '["5 practice exams", "Instant results", "Basic explanations"]', '["5 examens pratiques", "Résultats instantanés", "Explications de base"]', '["Ubugeni 5", "Ibisubizo byihuse", "Ibisobanuro by''ibanze"]', 1),
('1 Week', '1 Semaine', 'Icyumweru 1', 'One week full access', 'Accès complet d''une semaine', 'Kwinjira byose icyumweru kimwe', 6000, 7, NULL, '["Unlimited practice exams", "All lessons", "Detailed explanations", "Progress tracking"]', '["Examens pratiques illimités", "Toutes les leçons", "Explications détaillées", "Suivi des progrès"]', '["Ubugeni butagira ingano", "Amasomo yose", "Ibisobanuro birambuye", "Gukurikirana iterambere"]', 2),
('1 Month', '1 Mois', 'Ukwezi 1', 'One month full access', 'Accès complet d''un mois', 'Kwinjira byose ukwezi kumwe', 15000, 30, NULL, '["Unlimited practice exams", "All lessons", "Detailed explanations", "Progress tracking", "Certificate download"]', '["Examens pratiques illimités", "Toutes les leçons", "Explications détaillées", "Suivi des progrès", "Téléchargement de certificat"]', '["Ubugeni butagira ingano", "Amasomo yose", "Ibisobanuro birambuye", "Gukurikirana iterambere", "Gufata impamyabumenyi"]', 3),
('3 Months', '3 Mois', 'Amezi 3', 'Three months full access', 'Accès complet de trois mois', 'Kwinjira byose amezi atatu', 35000, 90, NULL, '["Unlimited practice exams", "All lessons", "Detailed explanations", "Progress tracking", "Certificate download", "Priority support"]', '["Examens pratiques illimités", "Toutes les leçons", "Explications détaillées", "Suivi des progrès", "Téléchargement de certificat", "Support prioritaire"]', '["Ubugeni butagira ingano", "Amasomo yose", "Ibisobanuro birambuye", "Gukurikirana iterambere", "Gufata impamyabumenyi", "Ubufasha bwihuse"]', 4);

-- Insert sample quiz data
INSERT INTO public.quizzes (title_en, title_fr, title_rw, description_en, description_fr, description_rw, is_premium, duration_minutes, difficulty, category, display_order) VALUES
('Basic Road Signs', 'Panneaux de Signalisation de Base', 'Ibimenyetso by''Umuhanda by''Ibanze', 'Learn the most common road signs in Rwanda', 'Apprenez les panneaux de signalisation les plus courants au Rwanda', 'Wige ibimenyetso by''umuhanda bikunze kugaragara mu Rwanda', false, 15, 'easy', 'road_signs', 1),
('Traffic Rules Quiz', 'Quiz sur les Règles de Circulation', 'Ubugeni bw''Amategeko y''Uruhando', 'Test your knowledge of basic traffic rules', 'Testez vos connaissances des règles de circulation de base', 'Gerageza ubumenyi bwawe bw''amategeko y''uruhando', false, 20, 'medium', 'traffic_rules', 2),
('Advanced Driving Test', 'Test de Conduite Avancé', 'Ubugeni bwo Gutwara Ibinyabiziga bw''Inyongera', 'Comprehensive driving test for experienced drivers', 'Test de conduite complet pour conducteurs expérimentés', 'Ubugeni bukomeye bwo gutwara ibinyabiziga ku bashobora', true, 45, 'hard', 'vehicle_control', 3);

-- Insert sample questions for the basic road signs quiz
INSERT INTO public.questions (quiz_id, text_en, text_fr, text_rw, options_en, options_fr, options_rw, correct_answer, explanation_en, explanation_fr, explanation_rw, display_order) VALUES
((SELECT id FROM public.quizzes WHERE title_en = 'Basic Road Signs'), 
 'What does a red octagonal sign mean?', 
 'Que signifie un panneau octogonal rouge?', 
 'Ikimenyetso gicyo munani gitukura bisobanura iki?',
 '["Stop", "Yield", "Speed limit", "No entry"]',
 '["Arrêt", "Céder le passage", "Limitation de vitesse", "Interdiction d''entrer"]',
 '["Hagarara", "Tanga inzira", "Umuvuduko mwemewe", "Ntukinjire"]',
 0,
 'A red octagonal sign universally means STOP. You must come to a complete stop.',
 'Un panneau octogonal rouge signifie universellement ARRÊT. Vous devez vous arrêter complètement.',
 'Ikimenyetso gicyo munani gitukura cyose bisobanura HAGARARA. Ugomba guhagarara burundu.',
 1);

-- Insert sample lessons
INSERT INTO public.lessons (title_en, title_fr, title_rw, description_en, description_fr, description_rw, content_en, content_fr, content_rw, category, is_premium, display_order) VALUES
('Understanding Road Signs', 'Comprendre les Panneaux de Signalisation', 'Gusobanukirwa Ibimenyetso by''Umuhanda', 'Learn to identify and understand common road signs', 'Apprenez à identifier et comprendre les panneaux de signalisation courants', 'Wige kumenya no gusobanukirwa ibimenyetso by''umuhanda bikunze kugaragara',
'# Road Signs in Rwanda

Road signs are essential for safe driving. They provide important information about:

- **Warning signs**: Alert you to potential hazards
- **Regulatory signs**: Tell you what you must or must not do
- **Information signs**: Provide helpful information about services and destinations

## Common Warning Signs
- **Curve ahead**: Prepares you for upcoming turns
- **School zone**: Alerts you to reduce speed near schools
- **Construction**: Indicates road work ahead

Always pay attention to road signs for your safety and the safety of others.',

'# Panneaux de Signalisation au Rwanda

Les panneaux de signalisation sont essentiels pour une conduite sûre. Ils fournissent des informations importantes sur:

- **Panneaux d''avertissement**: Vous alertent sur les dangers potentiels
- **Panneaux de réglementation**: Vous disent ce que vous devez ou ne devez pas faire
- **Panneaux d''information**: Fournissent des informations utiles sur les services et destinations

## Panneaux d''Avertissement Courants
- **Virage à venir**: Vous prépare aux virages à venir
- **Zone scolaire**: Vous alerte de réduire la vitesse près des écoles
- **Construction**: Indique des travaux routiers à venir

Faites toujours attention aux panneaux de signalisation pour votre sécurité et celle des autres.',

'# Ibimenyetso by''Umuhanda mu Rwanda

Ibimenyetso by''umuhanda ni byingenzi mu gutwara neza. Bitanga amakuru y''ingenzi yerekeye:

- **Ibimenyetso by''iburira**: Bikubwira ingaruka zishobora kugaragara
- **Ibimenyetso by''amategeko**: Bikubwira icyo ugomba gukora cyangwa utagomba gukora
- **Ibimenyetso by''amakuru**: Bitanga amakuru y''akagaro yerekeye serivisi n''aho ujya

## Ibimenyetso by''Iburira Bikunze Kugaragara
- **Impinduka iri imbere**: Bikwitegura ku mpinduka ziri imbere
- **Agace k''ishuri**: Bikubwira ko ugomba kugabanya umuvuduko hafi y''amashuri
- **Ubwubatsi**: Bwerekana ko hari imirimo y''umuhanda iri imbere

Buri gihe witondere ibimenyetso by''umuhanda ku mutekano wawe n''uw''abandi.',

'road_signs', false, 1),

('Traffic Laws and Regulations', 'Lois et Réglementations de la Circulation', 'Amategeko n''Ibigenga by''Uruhando', 'Complete guide to Rwandan traffic laws', 'Guide complet des lois de circulation rwandaises', 'Ubuyobozi busesuye bw''amategeko y''uruhando mu Rwanda',
'# Traffic Laws in Rwanda

Understanding traffic laws is crucial for safe and legal driving. Key areas include:

## Speed Limits
- **Urban areas**: 50 km/h
- **Rural roads**: 90 km/h  
- **Highways**: 120 km/h

## Right of Way
- Traffic from the right has priority at unmarked intersections
- Pedestrians have right of way at crosswalks
- Emergency vehicles always have priority

## Required Documents
- Valid driving license
- Vehicle registration
- Insurance certificate
- Vehicle inspection certificate

## Prohibited Actions
- Driving under influence of alcohol or drugs
- Using mobile phone while driving (except hands-free)
- Not wearing seatbelts
- Parking in prohibited areas

Always follow traffic laws to ensure your safety and avoid penalties.',

'# Lois de Circulation au Rwanda

Comprendre les lois de circulation est crucial pour une conduite sûre et légale. Les domaines clés incluent:

## Limitations de Vitesse
- **Zones urbaines**: 50 km/h
- **Routes rurales**: 90 km/h
- **Autoroutes**: 120 km/h

## Priorité de Passage
- Le trafic venant de droite a priorité aux intersections non marquées
- Les piétons ont priorité aux passages piétons
- Les véhicules d''urgence ont toujours priorité

## Documents Requis
- Permis de conduire valide
- Immatriculation du véhicule
- Certificat d''assurance
- Certificat d''inspection du véhicule

## Actions Interdites
- Conduire sous influence d''alcool ou de drogues
- Utiliser le téléphone portable en conduisant (sauf mains libres)
- Ne pas porter la ceinture de sécurité
- Se garer dans les zones interdites

Respectez toujours les lois de circulation pour assurer votre sécurité et éviter les sanctions.',

'# Amategeko y''Uruhando mu Rwanda

Gusobanukirwa amategeko y''uruhando ni ngombwa mu gutwara neza kandi mu buryo bwemewe. Ibintu by''ingenzi bikubiyemo:

## Umuvuduko Wemewe
- **Mu mijyi**: 50 km/h
- **Mu cyaro**: 90 km/h
- **Imiryango myinshi**: 120 km/h

## Uburenganzira bwo Kwambuka
- Imodoka ziva iburyo zifite uburenganzira mu mahuriro adasanzwe
- Abagenzi bagenda n''amaguru bafite uburenganzira mu nzira z''kwambuka
- Imodoka z''ubufasha buri gihe zifite uburenganzira

## Inyandiko Zikenewe
- Uruhushya rwo gutwara rwemewe
- Kwandikisha imodoka
- Icyemezo cy''ubwishingizi
- Icyemezo cyo gusuzuma imodoka

## Ibikorwa Bibujijwe
- Gutwara imodoka umeze nabi kubera inzoga cyangwa ibiyobyabwenge
- Gukoresha telefoni ubwo utwara (usibye udafata mu ntoki)
- Kudambara mukandara w''umutekano
- Guhagara aho bibujijwe

Buri gihe ubahirize amategeko y''uruhando kugira ngo urinde ubwoba kandi wirinde ibihano.',

'traffic_rules', true, 2);