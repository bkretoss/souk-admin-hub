CREATE TABLE public.cms_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  slug text UNIQUE,
  content text DEFAULT '',
  status text DEFAULT 'draft' CHECK (status IS NULL OR status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;

-- Public can read published pages
CREATE POLICY "Public can read published cms pages"
ON public.cms_pages FOR SELECT
USING (status = 'published');

-- Admins can do everything
CREATE POLICY "Admins can manage cms pages"
ON public.cms_pages FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed default pages
INSERT INTO public.cms_pages (title, slug, content, status) VALUES
  ('About Us', 'about-us', '<h2>About Us</h2><p>Welcome to Souk IT — your trusted marketplace for buying and selling technology products.</p>', 'published'),
  ('Contact Us', 'contact-us', '<h2>Contact Us</h2><p>Have questions? Reach us at <a href="mailto:support@soukit.com">support@soukit.com</a>.</p>', 'published')
ON CONFLICT (slug) DO NOTHING;
