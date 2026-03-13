import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Tabs, Tab, TextField, Button, Switch, FormControlLabel, Divider } from '@mui/material';

const SettingsPage: React.FC = () => {
  const [tab, setTab] = useState(0);

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
              <TextField label="App Name" fullWidth defaultValue="Souk IT" />
              <TextField label="Support Email" fullWidth defaultValue="support@soukit.com" />
              <TextField label="Default Currency" fullWidth defaultValue="USD" />
              <TextField label="Service Fee (%)" fullWidth defaultValue="12.5" type="number" />
              <Box sx={{ gridColumn: '1 / -1' }}>
                <FormControlLabel control={<Switch defaultChecked />} label="Enable notifications" />
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <FormControlLabel control={<Switch defaultChecked />} label="Maintenance mode" />
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Button variant="contained">Save Settings</Button>
              </Box>
            </Box>
          )}
          {tab === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography sx={{ color: '#F8FAFC', fontWeight: 600 }}>Security Settings</Typography>
              <FormControlLabel control={<Switch defaultChecked />} label="Two-factor authentication" />
              <FormControlLabel control={<Switch defaultChecked />} label="Force password change every 90 days" />
              <TextField label="Session timeout (minutes)" defaultValue="30" type="number" sx={{ maxWidth: 300 }} />
            </Box>
          )}
          {tab === 2 && (
            <Box>
              <Typography sx={{ color: '#F8FAFC', fontWeight: 600, mb: 2 }}>API Configuration</Typography>
              <TextField label="API Base URL" fullWidth defaultValue={import.meta.env.VITE_SUPABASE_URL} sx={{ mb: 2 }} InputProps={{ readOnly: true }} />
              <TextField label="Anon Key" fullWidth defaultValue="••••••••••••••••" sx={{ mb: 2 }} InputProps={{ readOnly: true }} />
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
