import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, TextField, Skeleton,
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  Avatar, Tooltip, Stack, Grid,
} from '@mui/material';
import { Add, Edit, Delete, Search, Visibility, Close } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, updateUser } from '@/lib/api/usersApi';
import { formatDate } from '@/lib/dateUtils';
import { toast } from 'sonner';

const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [viewUser, setViewUser] = useState<any>(null);
  const [editUser, setEditUser] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', phone_number: '', username: '' });

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Record<string, unknown> }) =>
      updateUser(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditUser(null);
      toast.success('User updated successfully');
    },
    onError: () => toast.error('Failed to update user'),
  });

  const filtered = users?.filter((u) =>
    `${u.first_name} ${u.last_name} ${u.email} ${u.username ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenEdit = (user: any) => {
    setEditForm({
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      phone_number: user.phone_number ?? '',
      username: user.username ?? '',
    });
    setEditUser(user);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#F8FAFC', mb: 0.5 }}>Users</Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Manage user accounts · {users?.length ?? 0} total
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />}>Add User</Button>
      </Box>

      {/* Table Card */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
            <TextField
              size="small" placeholder="Search users…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#64748B', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: '100%', sm: 320 } }}
            />
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}><Skeleton variant="text" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered && filtered.length > 0 ? (
                  filtered.map((user) => (
                    <TableRow key={user.id} sx={{ '&:hover': { bgcolor: 'rgba(148,163,184,0.04)' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            src={(user as any).profile_image ?? undefined}
                            sx={{ width: 36, height: 36, bgcolor: '#3B82F6', fontSize: 13, fontWeight: 600 }}
                          >
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </Avatar>
                          <Box>
                            <Typography sx={{ color: '#F8FAFC', fontSize: 14, fontWeight: 500 }}>
                              {user.first_name} {user.last_name}
                            </Typography>
                            <Typography sx={{ color: '#64748B', fontSize: 12 }}>
                              {(user as any).username || 'No username'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#94A3B8', fontSize: 13 }}>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={(user as any).role ?? 'user'}
                          size="small"
                          sx={{
                            bgcolor: (user as any).role === 'admin' ? 'rgba(124,58,237,0.15)' : 'rgba(59,130,246,0.12)',
                            color: (user as any).role === 'admin' ? '#A78BFA' : '#60A5FA',
                            fontWeight: 600, fontSize: 12, textTransform: 'capitalize',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#94A3B8', fontSize: 13 }}>
                        {formatDate(user.created_at)}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => setViewUser(user)} sx={{ color: '#60A5FA' }}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleOpenEdit(user)} sx={{ color: '#94A3B8' }}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => setDeleteId(user.id)} sx={{ color: '#EF4444' }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: '#64748B' }}>
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* View User Modal */}
      <Dialog open={!!viewUser} onClose={() => setViewUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          User Details
          <IconButton size="small" onClick={() => setViewUser(null)}><Close /></IconButton>
        </DialogTitle>
        {viewUser && (
          <DialogContent dividers>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar
                src={viewUser.profile_image ?? undefined}
                sx={{ width: 64, height: 64, bgcolor: '#3B82F6', fontSize: 22, fontWeight: 700 }}
              >
                {viewUser.first_name?.[0]}{viewUser.last_name?.[0]}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ color: '#F8FAFC' }}>
                  {viewUser.first_name} {viewUser.last_name}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                  <Chip
                    label={viewUser.role ?? 'user'}
                    size="small"
                    sx={{
                      bgcolor: viewUser.role === 'admin' ? 'rgba(124,58,237,0.15)' : 'rgba(59,130,246,0.12)',
                      color: viewUser.role === 'admin' ? '#A78BFA' : '#60A5FA',
                      fontWeight: 600, textTransform: 'capitalize',
                    }}
                  />
                </Stack>
              </Box>
            </Box>
            <Grid container spacing={2}>
              {[
                ['Email', viewUser.email],
                ['Phone', viewUser.phone_number || '—'],
                ['Username', viewUser.username || '—'],
                ['Gender', viewUser.gender || '—'],
                ['Date of Birth', viewUser.date_of_birth || '—'],
                ['Joined', formatDate(viewUser.created_at)],
              ].map(([label, value]) => (
                <Grid size={6} key={label}>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>{label}</Typography>
                  <Typography variant="body2" sx={{ color: '#F8FAFC' }}>{value}</Typography>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
        )}
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField label="First Name" fullWidth size="small" value={editForm.first_name}
                  onChange={(e) => setEditForm((p) => ({ ...p, first_name: e.target.value }))} />
              </Grid>
              <Grid size={6}>
                <TextField label="Last Name" fullWidth size="small" value={editForm.last_name}
                  onChange={(e) => setEditForm((p) => ({ ...p, last_name: e.target.value }))} />
              </Grid>
            </Grid>
            <TextField label="Phone" fullWidth size="small" value={editForm.phone_number}
              onChange={(e) => setEditForm((p) => ({ ...p, phone_number: e.target.value }))} />
            <TextField label="Username" fullWidth size="small" value={editForm.username}
              onChange={(e) => setEditForm((p) => ({ ...p, username: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditUser(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={updateMutation.isPending}
            onClick={() => editUser && updateMutation.mutate({ id: editUser.id, updates: editForm })}
          >
            {updateMutation.isPending ? 'Saving…' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#94A3B8' }}>
            Are you sure you want to delete this user? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => setDeleteId(null)}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;
