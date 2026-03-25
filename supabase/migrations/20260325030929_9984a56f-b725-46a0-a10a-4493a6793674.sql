CREATE POLICY "Admins can insert access codes"
ON public.access_codes
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete access codes"
ON public.access_codes
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
