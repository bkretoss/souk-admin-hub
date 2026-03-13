import React from 'react';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, IconButton, Divider, Avatar,
} from '@mui/material';
import {
  Dashboard, People, ShoppingBag, ShoppingCart, Category,
  CloudUpload, Article, Notifications, Settings,
  ChevronLeft, ChevronRight, Logout,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const DRAWER_WIDTH = 260;
const DRAWER_COLLAPSED = 72;

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
  { text: 'Users', icon: <People />, path: '/admin/users' },
  { text: 'Products', icon: <ShoppingBag />, path: '/admin/products' },
  { text: 'Orders', icon: <ShoppingCart />, path: '/admin/orders' },
  { text: 'Categories', icon: <Category />, path: '/admin/categories' },
  { text: 'Media', icon: <CloudUpload />, path: '/admin/media' },
  { text: 'Content', icon: <Article />, path: '/admin/content' },
  { text: 'Notifications', icon: <Notifications />, path: '/admin/notifications' },
  { text: 'Settings', icon: <Settings />, path: '/admin/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? DRAWER_WIDTH : DRAWER_COLLAPSED,
        flexShrink: 0,
        transition: 'width 0.2s ease',
        '& .MuiDrawer-paper': {
          width: open ? DRAWER_WIDTH : DRAWER_COLLAPSED,
          overflowX: 'hidden',
          transition: 'width 0.2s ease',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 2, minHeight: 64, gap: 1.5 }}>
        <Avatar sx={{ bgcolor: '#3B82F6', width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
          SI
        </Avatar>
        {open && (
          <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', whiteSpace: 'nowrap' }}>
            Souk IT
          </Typography>
        )}
        <IconButton onClick={onToggle} sx={{ ml: 'auto', color: '#94A3B8' }}>
          {open ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.08)' }} />

      <List sx={{ px: 1, py: 1, flex: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              minHeight: 44,
              px: open ? 2 : 1.5,
              justifyContent: open ? 'initial' : 'center',
              bgcolor: isActive(item.path) ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
              color: isActive(item.path) ? '#3B82F6' : '#94A3B8',
              '&:hover': {
                bgcolor: isActive(item.path) ? 'rgba(59, 130, 246, 0.16)' : 'rgba(148, 163, 184, 0.08)',
                color: '#F8FAFC',
              },
              transition: 'all 0.15s ease',
            }}
          >
            <ListItemIcon sx={{ 
              color: 'inherit', minWidth: 0, 
              mr: open ? 2 : 0, justifyContent: 'center',
            }}>
              {item.icon}
            </ListItemIcon>
            {open && <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 14, fontWeight: isActive(item.path) ? 600 : 400 }} />}
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.08)' }} />
      <List sx={{ px: 1, py: 1 }}>
        <ListItemButton
          onClick={signOut}
          sx={{
            borderRadius: 2, minHeight: 44,
            px: open ? 2 : 1.5, justifyContent: open ? 'initial' : 'center',
            color: '#EF4444',
            '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.08)' },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 0, mr: open ? 2 : 0, justifyContent: 'center' }}>
            <Logout />
          </ListItemIcon>
          {open && <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />}
        </ListItemButton>
      </List>
    </Drawer>
  );
};

export default Sidebar;
