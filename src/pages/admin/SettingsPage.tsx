import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent,
  TextField, Button, CircularProgress,
} from '@mui/material';
import { fetchSettings, upsertSettings, GeneralSettings } from '@/lib/api/settingsApi';
import { toast } from '@/components/ui/sonner';

const DEFAULT_GENERAL: GeneralSettings = {
  supportEmail: 'support@soukit.com',
  serviceFee: 12.5,
};

const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [general, setGeneral] = useState<GeneralSettings>(DEFAULT_GENERAL);

  useEffect(() => {
    const load = async () => {
      try {
        const g = await fetchSettings<GeneralSettings>('general');
        if (g) setGeneral(g);
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
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <TextField label="Support Email" fullWidth value={general.supportEmail}
              onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })} />
            <TextField label="Service Fee (%)" fullWidth value={general.serviceFee} type="number"
              onChange={(e) => setGeneral({ ...general, serviceFee: Number(e.target.value) })} />
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Button variant="contained" onClick={saveGeneral} disabled={saving}>
                {saving ? 'Saving…' : 'Save Settings'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage;
