
-- Allow admins to insert questions
CREATE POLICY "Admins can insert questions"
ON public.questions
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update questions
CREATE POLICY "Admins can update questions"
ON public.questions
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete questions
CREATE POLICY "Admins can delete questions"
ON public.questions
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create table to track which questions belong to each exam session
CREATE TABLE public.exam_session_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
  question_id integer NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  question_order integer NOT NULL,
  UNIQUE(session_id, question_id)
);

ALTER TABLE public.exam_session_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Session questions readable by anyone"
ON public.exam_session_questions FOR SELECT TO public USING (true);

CREATE POLICY "Session questions insertable by anyone"
ON public.exam_session_questions FOR INSERT TO public WITH CHECK (true);
