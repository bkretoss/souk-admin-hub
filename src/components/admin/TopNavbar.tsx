import React, { useState } from 'react';
import {
  AppBar, Toolbar, InputBase, IconButton, Badge, Avatar,
  Box, Menu, MenuItem, Typography, Divider,
} from '@mui/material';
import { Search, NotificationsOutlined, FullscreenOutlined } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

const TopNavbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ gap: 2, minHeight: '64px !important' }}>
        <Box sx={{ flex: 1 }} />

        <IconButton sx={{ color: '#64748B', '&:hover': { color: '#A78BFA' } }}>
          <FullscreenOutlined />
        </IconButton>
        <IconButton sx={{ color: '#64748B', '&:hover': { color: '#A78BFA' } }}>
          <Badge badgeContent={3} sx={{
            '& .MuiBadge-badge': {
              fontSize: 10, minWidth: 18, height: 18,
              bgcolor: '#7C3AED', color: '#fff',
            },
          }}>
            <NotificationsOutlined />
          </Badge>
        </IconButton>

        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', ml: 1,
            px: 1.5, py: 0.75, borderRadius: 2,
            '&:hover': { bgcolor: 'rgba(148, 163, 184, 0.06)' },
            transition: 'background 0.2s',
          }}
        >
          <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'right' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', lineHeight: 1.3 }}>
              Marcus Smith
            </Typography>
            <Typography sx={{ fontSize: 11, color: '#7C3AED', fontWeight: 500, lineHeight: 1.3, letterSpacing: '0.03em' }}>
              SUPER ADMIN
            </Typography>
          </Box>
          <Avatar sx={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
            fontSize: 13, fontWeight: 600,
            border: '2px solid rgba(124, 58, 237, 0.3)',
          }}>
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </Avatar>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              mt: 1, minWidth: 180,
              bgcolor: '#12121A',
              border: '1px solid rgba(124, 58, 237, 0.15)',
              boxShadow: '0 0 30px rgba(124, 58, 237, 0.1)',
            },
          }}
        >
          <MenuItem sx={{ fontSize: 14, color: '#CBD5E1', '&:hover': { bgcolor: 'rgba(124, 58, 237, 0.08)' } }}>Profile</MenuItem>
          <MenuItem sx={{ fontSize: 14, color: '#CBD5E1', '&:hover': { bgcolor: 'rgba(124, 58, 237, 0.08)' } }}>Settings</MenuItem>
          <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.06)' }} />
          <MenuItem onClick={signOut} sx={{ fontSize: 14, color: '#F43F5E', '&:hover': { bgcolor: 'rgba(244, 63, 94, 0.08)' } }}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavbar;
