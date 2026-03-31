import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent,
  TextField, Button, CircularProgress,
} from '@mui/material';
import { fetchSettings, upsertSettings, GeneralSettings } from '@/lib/api/settingsApi';
import { toast } from '@/components/ui/sonner';

const DEFAULT_GENERAL: GeneralSettings = {
  serviceFee: 12.5,
};

const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [general, setGeneral] = useState<GeneralSettings>(DEFAULT_GENERAL);
  const [feeError, setFeeError] = useState('');

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
    if (general.serviceFee < 0) {
      setFeeError('Service Fee cannot be a negative value.');
      return;
    }
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
            <TextField
              label="Service Fee (%)"
              fullWidth
              value={general.serviceFee}
              type="number"
              inputProps={{ min: 0 }}
              error={!!feeError}
              helperText={feeError}
              onChange={(e) => {
                const val = Number(e.target.value);
                setGeneral({ ...general, serviceFee: val });
                setFeeError(val < 0 ? 'Service Fee cannot be a negative value.' : '');
              }}
            />
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
