
-- Questions table
CREATE TABLE public.questions (
  id SERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT,
  option_e TEXT,
  correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('a','b','c','d','e')),
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Questions are readable by everyone" ON public.questions FOR SELECT USING (true);

-- Access codes table
CREATE TABLE public.access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  candidate_name TEXT,
  candidate_email TEXT NOT NULL,
  exam_duration_minutes INTEGER NOT NULL DEFAULT 45,
  is_used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access codes readable by code" ON public.access_codes FOR SELECT USING (true);
CREATE POLICY "Access codes updatable" ON public.access_codes FOR UPDATE USING (true);

-- Exam sessions table
CREATE TABLE public.exam_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_code_id UUID NOT NULL REFERENCES public.access_codes(id),
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  score INTEGER,
  total_questions INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed','timed_out')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sessions insertable by anyone" ON public.exam_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Sessions readable by anyone" ON public.exam_sessions FOR SELECT USING (true);
CREATE POLICY "Sessions updatable by anyone" ON public.exam_sessions FOR UPDATE USING (true);

-- Answers table  
CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.exam_sessions(id),
  question_id INTEGER NOT NULL REFERENCES public.questions(id),
  selected_option CHAR(1) NOT NULL CHECK (selected_option IN ('a','b','c','d','e')),
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, question_id)
);

ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Answers insertable by anyone" ON public.answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Answers readable by anyone" ON public.answers FOR SELECT USING (true);
CREATE POLICY "Answers updatable by anyone" ON public.answers FOR UPDATE USING (true);
