import React from 'react';
import {
  Box, Typography, Card, CardContent, List, ListItem, ListItemText, ListItemIcon,
  Chip, Skeleton, Divider,
} from '@mui/material';
import { NotificationsActive, Info, Warning, CheckCircle } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';

const typeIcons: Record<string, React.ReactNode> = {
  info: <Info sx={{ color: '#3B82F6' }} />,
  warning: <Warning sx={{ color: '#F59E0B' }} />,
  success: <CheckCircle sx={{ color: '#10B981' }} />,
};

const NotificationsPage: React.FC = () => {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getAll,
  });

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#F8FAFC', mb: 0.5 }}>Notifications</Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>Activity logs and alerts</Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Box key={i} sx={{ px: 3, py: 2 }}><Skeleton height={40} /></Box>
            ))
          ) : notifications && notifications.length > 0 ? (
            <List disablePadding>
              {notifications.map((n, idx) => (
                <React.Fragment key={n.id}>
                  <ListItem sx={{
                    px: 3, py: 2,
                    bgcolor: n.is_read ? 'transparent' : 'rgba(59,130,246,0.04)',
                    '&:hover': { bgcolor: 'rgba(148,163,184,0.04)' },
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {typeIcons[n.type] ?? <NotificationsActive sx={{ color: '#94A3B8' }} />}
                    </ListItemIcon>
                    <ListItemText
                      primary={n.title}
                      secondary={n.message}
                      primaryTypographyProps={{ fontSize: 14, fontWeight: n.is_read ? 400 : 600, color: '#F8FAFC' }}
                      secondaryTypographyProps={{ fontSize: 13, color: '#94A3B8' }}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                      <Typography sx={{ fontSize: 12, color: '#64748B', whiteSpace: 'nowrap' }}>
                        {new Date(n.created_at).toLocaleDateString()}
                      </Typography>
                      {!n.is_read && <Chip label="New" size="small" color="primary" sx={{ height: 20, fontSize: 10 }} />}
                    </Box>
                  </ListItem>
                  {idx < notifications.length - 1 && <Divider sx={{ borderColor: 'rgba(148,163,184,0.06)' }} />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <NotificationsActive sx={{ fontSize: 48, color: '#64748B', mb: 2 }} />
              <Typography sx={{ color: '#64748B' }}>No notifications yet</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default NotificationsPage;
