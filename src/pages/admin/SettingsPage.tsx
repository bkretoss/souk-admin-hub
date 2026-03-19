import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Tabs, Tab,
  TextField, Button, Switch, FormControlLabel, Divider, CircularProgress,
} from '@mui/material';
import { fetchSettings, upsertSettings, GeneralSettings, SecuritySettings } from '@/lib/api/settingsApi';
import { toast } from '@/components/ui/sonner';

const DEFAULT_GENERAL: GeneralSettings = {
  appName: 'Souk IT',
  supportEmail: 'support@soukit.com',
  currency: 'USD',
  serviceFee: 12.5,
  enableNotifications: true,
  maintenanceMode: false,
};

const DEFAULT_SECURITY: SecuritySettings = {
  twoFactorAuth: true,
  forcePasswordChange: true,
  sessionTimeout: 30,
};

const SettingsPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [general, setGeneral] = useState<GeneralSettings>(DEFAULT_GENERAL);
  const [security, setSecurity] = useState<SecuritySettings>(DEFAULT_SECURITY);

  useEffect(() => {
    const load = async () => {
      try {
        const [g, s] = await Promise.all([
          fetchSettings<GeneralSettings>('general'),
          fetchSettings<SecuritySettings>('security'),
        ]);
        if (g) setGeneral(g);
        if (s) setSecurity(s);
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveGeneral = async () => {
    setSaving(true);
    try {
      const saved = await upsertSettings('general', general as Record<string, unknown>);
      setGeneral(saved as GeneralSettings);
      toast.success('General settings saved');
    } catch (err) {
      console.error('saveGeneral failed:', err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const saveSecurity = async () => {
    setSaving(true);
    try {
      const saved = await upsertSettings('security', security as Record<string, unknown>);
      setSecurity(saved as SecuritySettings);
      toast.success('Security settings saved');
    } catch (err) {
      console.error('saveSecurity failed:', err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#F8FAFC', mb: 0.5 }}>Settings</Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>Application configuration</Typography>
      </Box>

      <Card>
        <Box sx={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}
            sx={{ px: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, fontSize: 14 } }}>
            <Tab label="General" />
            <Tab label="Security" />
            <Tab label="API" />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {tab === 0 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <TextField label="App Name" fullWidth value={general.appName}
                onChange={(e) => setGeneral({ ...general, appName: e.target.value })} />
              <TextField label="Support Email" fullWidth value={general.supportEmail}
                onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })} />
              <TextField label="Default Currency" fullWidth value={general.currency}
                onChange={(e) => setGeneral({ ...general, currency: e.target.value })} />
              <TextField label="Service Fee (%)" fullWidth value={general.serviceFee} type="number"
                onChange={(e) => setGeneral({ ...general, serviceFee: Number(e.target.value) })} />
              <Box sx={{ gridColumn: '1 / -1' }}>
                <FormControlLabel
                  control={<Switch checked={general.enableNotifications}
                    onChange={(e) => setGeneral({ ...general, enableNotifications: e.target.checked })} />}
                  label="Enable notifications" />
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <FormControlLabel
                  control={<Switch checked={general.maintenanceMode}
                    onChange={(e) => setGeneral({ ...general, maintenanceMode: e.target.checked })} />}
                  label="Maintenance mode" />
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Button variant="contained" onClick={saveGeneral} disabled={saving}>
                  {saving ? 'Saving…' : 'Save Settings'}
                </Button>
              </Box>
            </Box>
          )}

          {tab === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography sx={{ color: '#F8FAFC', fontWeight: 600 }}>Security Settings</Typography>
              <FormControlLabel
                control={<Switch checked={security.twoFactorAuth}
                  onChange={(e) => setSecurity({ ...security, twoFactorAuth: e.target.checked })} />}
                label="Two-factor authentication" />
              <FormControlLabel
                control={<Switch checked={security.forcePasswordChange}
                  onChange={(e) => setSecurity({ ...security, forcePasswordChange: e.target.checked })} />}
                label="Force password change every 90 days" />
              <TextField label="Session timeout (minutes)" value={security.sessionTimeout} type="number"
                sx={{ maxWidth: 300 }}
                onChange={(e) => setSecurity({ ...security, sessionTimeout: Number(e.target.value) })} />
              <Box>
                <Button variant="contained" onClick={saveSecurity} disabled={saving}>
                  {saving ? 'Saving…' : 'Save Settings'}
                </Button>
              </Box>
            </Box>
          )}

          {tab === 2 && (
            <Box>
              <Typography sx={{ color: '#F8FAFC', fontWeight: 600, mb: 2 }}>API Configuration</Typography>
              <TextField label="API Base URL" fullWidth defaultValue={import.meta.env.VITE_SUPABASE_URL}
                sx={{ mb: 2 }} InputProps={{ readOnly: true }} />
              <TextField label="Anon Key" fullWidth defaultValue="••••••••••••••••"
                sx={{ mb: 2 }} InputProps={{ readOnly: true }} />
              <Divider sx={{ my: 2, borderColor: 'rgba(148,163,184,0.08)' }} />
              <Typography sx={{ color: '#94A3B8', fontSize: 13 }}>
                API endpoints are automatically generated from Supabase. Manage them from the Supabase dashboard.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage;
