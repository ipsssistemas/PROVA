-- Reusable exam types and configurable composition
CREATE TABLE IF NOT EXISTS public.exam_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 45 CHECK (duration_minutes BETWEEN 1 AND 600),
  question_count INTEGER NOT NULL DEFAULT 30 CHECK (question_count BETWEEN 1 AND 500),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.exam_type_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_type_id UUID NOT NULL REFERENCES public.exam_types(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (exam_type_id, category)
);

ALTER TABLE public.access_codes
  ADD COLUMN IF NOT EXISTS exam_type_id UUID REFERENCES public.exam_types(id),
  ADD COLUMN IF NOT EXISTS exam_question_count INTEGER;

ALTER TABLE public.exam_sessions
  ADD COLUMN IF NOT EXISTS exam_type_id UUID REFERENCES public.exam_types(id);

ALTER TABLE public.exam_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_type_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Exam types readable by everyone"
  ON public.exam_types FOR SELECT USING (true);
CREATE POLICY "Admins manage exam types"
  ON public.exam_types FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Exam type categories readable by everyone"
  ON public.exam_type_categories FOR SELECT USING (true);
CREATE POLICY "Admins manage exam type categories"
  ON public.exam_type_categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Initial editable types. Durations and counts are starting values, not fixed rules.
INSERT INTO public.exam_types (name, description, duration_minutes, question_count)
VALUES
 ('Iluminação', 'Instalação, configuração e diagnóstico de iluminação inteligente.', 45, 30),
 ('Segurança', 'Dispositivos, sensores e sistemas de segurança residencial.', 60, 30),
 ('Redes', 'Conectividade, protocolos, gateways e infraestrutura de rede.', 50, 30),
 ('Automação', 'Integrações, cenas, controladores e automações residenciais.', 45, 30)
ON CONFLICT (name) DO NOTHING;

-- Initial classification by existing question categories.
-- Categories may belong to more than one exam type.
WITH mapping(exam_name, category) AS (
  VALUES
  ('Iluminação','Interruptor Wi-Fi'),
  ('Iluminação','Interruptor Zigbee'),
  ('Iluminação','Fita de LED'),
  ('Iluminação','Lâmpada Inteligente'),
  ('Iluminação','Sensor de Presença'),
  ('Iluminação','Sensor de Movimento'),
  ('Segurança','Fechadura Digital'),
  ('Segurança','Interfone Inteligente'),
  ('Segurança','Câmera de Segurança'),
  ('Segurança','Sirene Inteligente'),
  ('Segurança','Detector de Fumaça'),
  ('Segurança','Sensor Porta/Janela'),
  ('Segurança','Sensor de Presença'),
  ('Segurança','Sensor de Movimento'),
  ('Redes','Interruptor Wi-Fi'),
  ('Redes','Interruptor Zigbee'),
  ('Redes','Interfone Inteligente'),
  ('Redes','Câmera de Segurança'),
  ('Redes','Gateway/Hub'),
  ('Redes','Roteador Mesh'),
  ('Redes','Assistente de Voz'),
  ('Automação','Interruptor Wi-Fi'),
  ('Automação','Interruptor Zigbee'),
  ('Automação','Controlador Universal'),
  ('Automação','Fita de LED'),
  ('Automação','Sensor de Presença'),
  ('Automação','Sensor de Movimento'),
  ('Automação','Tomada Inteligente'),
  ('Automação','Assistente de Voz'),
  ('Automação','Lâmpada Inteligente'),
  ('Automação','Cortina Motorizada'),
  ('Automação','Gateway/Hub'),
  ('Automação','Sensor Porta/Janela')
)
INSERT INTO public.exam_type_categories (exam_type_id, category)
SELECT et.id, m.category
FROM mapping m
JOIN public.exam_types et ON et.name = m.exam_name
ON CONFLICT (exam_type_id, category) DO NOTHING;
