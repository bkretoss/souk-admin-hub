CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

INSERT INTO public.settings (key, value) VALUES
  ('general', '{"appName":"Souk IT","supportEmail":"support@soukit.com","currency":"USD","serviceFee":12.5,"enableNotifications":true,"maintenanceMode":false}')
  -- ('security', '{"twoFactorAuth":true,"forcePasswordChange":true,"sessionTimeout":30}')
ON CONFLICT (key) DO NOTHING;
