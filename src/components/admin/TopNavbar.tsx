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
      <Toolbar sx={{ gap: 2 }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          bgcolor: 'rgba(148, 163, 184, 0.06)', borderRadius: 2.5,
          px: 2, py: 0.5, flex: 1, maxWidth: 480,
          border: '1px solid rgba(148, 163, 184, 0.08)',
        }}>
          <Search sx={{ color: '#94A3B8', fontSize: 20 }} />
          <InputBase
            placeholder="Search anything…"
            sx={{ flex: 1, color: '#F8FAFC', fontSize: 14, '& ::placeholder': { color: '#64748B' } }}
          />
          <Typography sx={{ color: '#64748B', fontSize: 12, bgcolor: 'rgba(148,163,184,0.1)', px: 1, py: 0.25, borderRadius: 1 }}>
            ⌘K
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        <IconButton sx={{ color: '#94A3B8' }}>
          <FullscreenOutlined />
        </IconButton>
        <IconButton sx={{ color: '#94A3B8' }}>
          <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 18, height: 18 } }}>
            <NotificationsOutlined />
          </Badge>
        </IconButton>

        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', ml: 1 }}
        >
          <Avatar sx={{ width: 34, height: 34, bgcolor: '#3B82F6', fontSize: 13, fontWeight: 600 }}>
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </Avatar>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC', lineHeight: 1.3 }}>
              Admin
            </Typography>
            <Typography sx={{ fontSize: 11, color: '#64748B', lineHeight: 1.3 }}>
              {user?.email || 'admin@soukit.com'}
            </Typography>
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{ sx: { mt: 1, minWidth: 180 } }}
        >
          <MenuItem sx={{ fontSize: 14 }}>Profile</MenuItem>
          <MenuItem sx={{ fontSize: 14 }}>Settings</MenuItem>
          <Divider />
          <MenuItem onClick={signOut} sx={{ fontSize: 14, color: '#EF4444' }}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavbar;
