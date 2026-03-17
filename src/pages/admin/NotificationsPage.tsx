import React from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Skeleton, Tooltip,
} from '@mui/material';
import { DoneAll } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationRead } from '@/lib/api/notificationsApi';
import { toast } from 'sonner';

const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notifications'] }); toast.success('Marked as read'); },
    onError: () => toast.error('Failed to update'),
  });

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#F1F5F9', fontWeight: 700, mb: 0.5 }}>Notifications</Typography>
        <Typography sx={{ color: '#64748B', fontSize: 14 }}>Activity logs and alerts</Typography>
      </Box>

      <Card sx={{ bgcolor: '#151C2C', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['Title', 'Message', 'Date', 'Status', 'Actions'].map((h) => (
                    <TableCell key={h} sx={{ color: '#64748B', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', borderColor: 'rgba(255,255,255,0.06)' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j} sx={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                          <Skeleton sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : notifications && notifications.length > 0 ? (
                  notifications.map((n: any) => (
                    <TableRow
                      key={n.id}
                      sx={{
                        bgcolor: n.is_read ? 'transparent' : 'rgba(59,130,246,0.03)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                        '&:last-child td': { borderBottom: 0 },
                      }}
                    >
                      <TableCell sx={{ color: '#F1F5F9', fontSize: 14, fontWeight: n.is_read ? 400 : 600, borderColor: 'rgba(255,255,255,0.06)' }}>
                        {n.title}
                      </TableCell>
                      <TableCell sx={{ color: '#94A3B8', fontSize: 13, maxWidth: 300, borderColor: 'rgba(255,255,255,0.06)' }}>
                        {n.message}
                      </TableCell>
                      <TableCell sx={{ color: '#64748B', fontSize: 13, whiteSpace: 'nowrap', borderColor: 'rgba(255,255,255,0.06)' }}>
                        {new Date(n.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <Chip
                          label={n.is_read ? 'Read' : 'Unread'}
                          size="small"
                          sx={{
                            bgcolor: n.is_read ? 'rgba(100,116,139,0.15)' : 'rgba(59,130,246,0.15)',
                            color: n.is_read ? '#64748B' : '#3B82F6',
                            fontWeight: 600, fontSize: 12,
                            border: `1px solid ${n.is_read ? '#64748B' : '#3B82F6'}44`,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        {!n.is_read && (
                          <Tooltip title="Mark as read">
                            <IconButton size="small" onClick={() => markReadMutation.mutate(n.id)} sx={{ color: '#10B981' }}>
                              <DoneAll fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: '#64748B', borderBottom: 0 }}>
                      No notifications yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NotificationsPage;
