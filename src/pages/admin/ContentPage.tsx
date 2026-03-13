import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Article } from '@mui/icons-material';

const ContentPage: React.FC = () => (
  <Box>
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" sx={{ color: '#F8FAFC', mb: 0.5 }}>Content Management</Typography>
      <Typography variant="body2" sx={{ color: '#64748B' }}>Manage pages and posts</Typography>
    </Box>
    <Card>
      <CardContent sx={{ textAlign: 'center', py: 8 }}>
        <Article sx={{ fontSize: 48, color: '#64748B', mb: 2 }} />
        <Typography sx={{ color: '#94A3B8', mb: 1 }}>Content management coming soon</Typography>
        <Typography sx={{ color: '#64748B', fontSize: 13 }}>This module will allow you to create and manage pages and blog posts.</Typography>
      </CardContent>
    </Card>
  </Box>
);

export default ContentPage;
