import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar, Chip, IconButton, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Skeleton, InputAdornment,
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { toast } from 'sonner';

const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editDialog, setEditDialog] = useState<any>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Record<string, unknown> }) =>
      usersApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditDialog(null);
      toast.success('User updated successfully');
    },
    onError: () => toast.error('Failed to update user'),
  });

  const filteredUsers = users?.filter((u) =>
    `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#F8FAFC', mb: 0.5 }}>Users</Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>Manage user accounts</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />}>Add User</Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
            <TextField
              size="small" placeholder="Search users…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: '#64748B', fontSize: 20 }} /></InputAdornment> }}
              sx={{ width: 320 }}
            />
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
                  ))
                ) : filteredUsers && filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} sx={{ '&:hover': { bgcolor: 'rgba(148,163,184,0.04)' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#3B82F6', fontSize: 13 }}>
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </Avatar>
                          <Typography sx={{ color: '#F8FAFC', fontSize: 14, fontWeight: 500 }}>
                            {user.first_name} {user.last_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#94A3B8', fontSize: 13 }}>{user.email}</TableCell>
                      <TableCell sx={{ color: '#94A3B8', fontSize: 13 }}>{user.phone_number || '—'}</TableCell>
                      <TableCell sx={{ color: '#94A3B8', fontSize: 13 }}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => setEditDialog(user)} sx={{ color: '#94A3B8' }}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: '#64748B' }}>No users found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={!!editDialog} onClose={() => setEditDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField label="First Name" fullWidth margin="dense" defaultValue={editDialog?.first_name}
            onChange={(e) => setEditDialog((prev: any) => prev ? { ...prev, first_name: e.target.value } : null)} />
          <TextField label="Last Name" fullWidth margin="dense" defaultValue={editDialog?.last_name}
            onChange={(e) => setEditDialog((prev: any) => prev ? { ...prev, last_name: e.target.value } : null)} />
          <TextField label="Phone" fullWidth margin="dense" defaultValue={editDialog?.phone_number}
            onChange={(e) => setEditDialog((prev: any) => prev ? { ...prev, phone_number: e.target.value } : null)} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            if (editDialog) updateMutation.mutate({ id: editDialog.id, updates: { first_name: editDialog.first_name, last_name: editDialog.last_name, phone_number: editDialog.phone_number } });
          }}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;
