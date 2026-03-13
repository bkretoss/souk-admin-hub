import React, { useState } from 'react';
import {
import { Box, Typography, Card, CardContent, Tabs, Tab, TextField, Button, Switch, FormControlLabel, Divider } from '@mui/material';
import Grid from '@mui/material/Grid2';
} from '@mui/material';

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
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="App Name" fullWidth defaultValue="Souk IT" />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Support Email" fullWidth defaultValue="support@soukit.com" />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Default Currency" fullWidth defaultValue="USD" />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Service Fee (%)" fullWidth defaultValue="12.5" type="number" />
              </Grid>
              <Grid size={12}>
                <FormControlLabel control={<Switch defaultChecked />} label="Enable notifications" />
              </Grid>
              <Grid size={12}>
                <FormControlLabel control={<Switch defaultChecked />} label="Maintenance mode" />
              </Grid>
              <Grid size={12}>
                <Button variant="contained">Save Settings</Button>
              </Grid>
            </Grid>
          )}
          {tab === 1 && (
            <Box>
              <Typography sx={{ color: '#F8FAFC', fontWeight: 600, mb: 2 }}>Security Settings</Typography>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <FormControlLabel control={<Switch defaultChecked />} label="Two-factor authentication" />
                </Grid>
                <Grid size={12}>
                  <FormControlLabel control={<Switch defaultChecked />} label="Force password change every 90 days" />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField label="Session timeout (minutes)" fullWidth defaultValue="30" type="number" />
                </Grid>
              </Grid>
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
