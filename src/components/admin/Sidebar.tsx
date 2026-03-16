import React from 'react';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, IconButton, Divider, Avatar,
} from '@mui/material';
import {
  Dashboard, People, ShoppingBag, ShoppingCart, Category,
  CloudUpload, Article, Notifications, Settings,
  ChevronLeft, ChevronRight, Logout, LocalOffer, CardMembership,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const DRAWER_WIDTH = 250;
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
  { text: 'Coupons', icon: <LocalOffer />, path: '/admin/content' },
  { text: 'Subscriptions', icon: <CardMembership />, path: '/admin/notifications' },
  { text: 'Media', icon: <CloudUpload />, path: '/admin/media' },
  { text: 'Settings', icon: <Settings />, path: '/admin/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

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
        transition: 'width 0.25s cubic-bezier(.4,0,.2,1)',
        '& .MuiDrawer-paper': {
          width: open ? DRAWER_WIDTH : DRAWER_COLLAPSED,
          overflowX: 'hidden',
          transition: 'width 0.25s cubic-bezier(.4,0,.2,1)',
          background: 'linear-gradient(180deg, #0B0B0F 0%, #0E0E16 100%)',
        },
      }}
    >
      {/* Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 2.5, minHeight: 64, gap: 1.5 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: 2,
          background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px rgba(124, 58, 237, 0.4)',
          fontSize: 14, fontWeight: 800, color: '#fff',
        }}>
          SI
        </Box>
        {open && (
          <Typography sx={{ fontSize: 17, fontWeight: 700, color: '#F1F5F9', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
            Souk IT
          </Typography>
        )}
        <IconButton onClick={onToggle} sx={{ ml: 'auto', color: '#64748B', '&:hover': { color: '#A78BFA' } }}>
          {open ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.06)', mx: 1.5 }} />

      {/* Menu */}
      <List sx={{ px: 1.5, py: 1.5, flex: 1 }}>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItemButton
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2.5,
                mb: 0.5,
                minHeight: 44,
                px: open ? 2 : 1.5,
                justifyContent: open ? 'initial' : 'center',
                bgcolor: active ? 'rgba(124, 58, 237, 0.12)' : 'transparent',
                color: active ? '#A78BFA' : '#64748B',
                boxShadow: active ? '0 0 12px rgba(124, 58, 237, 0.15), inset 0 0 0 1px rgba(124, 58, 237, 0.2)' : 'none',
                '&:hover': {
                  bgcolor: active ? 'rgba(124, 58, 237, 0.16)' : 'rgba(148, 163, 184, 0.06)',
                  color: active ? '#A78BFA' : '#CBD5E1',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon sx={{
                color: 'inherit', minWidth: 0,
                mr: open ? 2 : 0, justifyContent: 'center',
                '& .MuiSvgIcon-root': { fontSize: 20 },
              }}>
                {item.icon}
              </ListItemIcon>
              {open && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: active ? 600 : 400,
                    letterSpacing: '-0.01em',
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.06)', mx: 1.5 }} />

      {/* User + Logout */}
      <Box sx={{ px: 1.5, py: 1.5 }}>
        {open && (
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, px: 1.5, py: 1,
            borderRadius: 2, bgcolor: 'rgba(148, 163, 184, 0.04)',
          }}>
            <Avatar sx={{
              width: 34, height: 34,
              background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
              fontSize: 13, fontWeight: 600,
            }}>
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', lineHeight: 1.3 }}>
                Marcus Smith
              </Typography>
              <Typography sx={{ fontSize: 11, color: '#7C3AED', fontWeight: 500, lineHeight: 1.3 }}>
                SUPER ADMIN
              </Typography>
            </Box>
            <IconButton onClick={signOut} sx={{ ml: 'auto', color: '#64748B', '&:hover': { color: '#F43F5E' } }} size="small">
              <Logout sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        )}
        {!open && (
          <ListItemButton
            onClick={signOut}
            sx={{
              borderRadius: 2, minHeight: 44,
              justifyContent: 'center',
              color: '#F43F5E',
              '&:hover': { bgcolor: 'rgba(244, 63, 94, 0.08)' },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 0, justifyContent: 'center' }}>
              <Logout sx={{ fontSize: 20 }} />
            </ListItemIcon>
          </ListItemButton>
        )}
      </Box>
    </Drawer>
  );
};

export default Sidebar;
