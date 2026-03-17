import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, TextField, Skeleton,
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  Avatar, Tooltip, Grid, MenuItem, TablePagination,
} from '@mui/material';
import { Add, Edit, Delete, Search, Visibility, Close } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/api/usersApi';
import { formatDate } from '@/lib/dateUtils';
import { toast } from 'sonner';

const ROLES = ['user', 'admin'];

const emptyForm = { first_name: '', last_name: '', email: '', phone_number: '', username: '', role: 'user', gender: '' };

const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewUser, setViewUser] = useState<any>(null);
  const [formDialog, setFormDialog] = useState<{ mode: 'add' | 'edit'; data?: any } | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: getUsers });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); setFormDialog(null); toast.success('User created successfully'); },
    onError: (e: any) => toast.error(e?.message ?? 'Failed to create user'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Record<string, unknown> }) => updateUser(id, updates),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); setFormDialog(null); toast.success('User updated successfully'); },
    onError: (e: any) => toast.error(e?.message ?? 'Failed to update user'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); setDeleteId(null); toast.success('User deleted successfully'); },
    onError: () => toast.error('Failed to delete user'),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (users ?? []).filter((u: any) =>
      !q || `${u.first_name} ${u.last_name} ${u.email} ${u.username ?? ''}`.toLowerCase().includes(q)
    );
  }, [users, search]);

  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage],
  );

  const openAdd = () => { setForm(emptyForm); setFormDialog({ mode: 'add' }); };
  const openEdit = (user: any) => {
    setForm({ first_name: user.first_name ?? '', last_name: user.last_name ?? '', email: user.email ?? '', phone_number: user.phone_number ?? '', username: user.username ?? '', role: user.role ?? 'user', gender: user.gender ?? '' });
    setFormDialog({ mode: 'edit', data: user });
  };

  const handleSave = () => {
    if (!form.first_name || !form.last_name || !form.email) { toast.error('Name and email are required'); return; }
    if (formDialog?.mode === 'add') {
      createMutation.mutate({ ...form, date_of_birth: '2000-01-01', country_code: '+1' });
    } else {
      updateMutation.mutate({ id: formDialog!.data.id, updates: { first_name: form.first_name, last_name: form.last_name, phone_number: form.phone_number, username: form.username, role: form.role, gender: form.gender } });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const roleSx = (role: string) => ({
    bgcolor: role === 'admin' ? 'rgba(124,58,237,0.15)' : 'rgba(59,130,246,0.12)',
    color: role === 'admin' ? '#A78BFA' : '#60A5FA',
    fontWeight: 600, fontSize: 12, textTransform: 'capitalize' as const,
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#F8FAFC', mb: 0.5 }}>Users</Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>Manage user accounts · {users?.length ?? 0} total</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openAdd}>Add User</Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          size="small" placeholder="Search users…" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: '#94A3B8', fontSize: 18 }} /></InputAdornment> }}
          sx={{
            width: '25%',
            '& .MuiOutlinedInput-root': { color: '#F1F5F9', bgcolor: 'rgba(255,255,255,0.05)', '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' }, '&.Mui-focused fieldset': { borderColor: '#7C3AED' } },
            '& input::placeholder': { color: '#64748B', opacity: 1 },
          }}
        />
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
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
                    <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton variant="text" /></TableCell>)}</TableRow>
                  ))
                ) : paginated.length > 0 ? (
                  paginated.map((user: any) => (
                    <TableRow key={user.id} sx={{ '&:hover': { bgcolor: 'rgba(148,163,184,0.04)' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar src={user.profile_image ?? undefined} sx={{ width: 36, height: 36, bgcolor: '#3B82F6', fontSize: 13, fontWeight: 600 }}>
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </Avatar>
                          <Box>
                            <Typography sx={{ color: '#F8FAFC', fontSize: 14, fontWeight: 500 }}>{user.first_name} {user.last_name}</Typography>
                            <Typography sx={{ color: '#64748B', fontSize: 12 }}>{user.username || 'No username'}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#94A3B8', fontSize: 13 }}>{user.email}</TableCell>
                      <TableCell><Chip label={user.role ?? 'user'} size="small" sx={roleSx(user.role)} /></TableCell>
                      <TableCell sx={{ color: '#94A3B8', fontSize: 13 }}>{formatDate(user.created_at)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="View"><IconButton size="small" onClick={() => setViewUser(user)} sx={{ color: '#60A5FA' }}><Visibility fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(user)} sx={{ color: '#94A3B8' }}><Edit fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" onClick={() => setDeleteId(user.id)} sx={{ color: '#EF4444' }}><Delete fontSize="small" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: '#64748B' }}>No Data Found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div" count={filtered.length} page={page} rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            sx={{
              color: '#64748B', borderTop: '1px solid rgba(255,255,255,0.06)',
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { color: '#64748B', fontSize: 13 },
              '.MuiTablePagination-select, .MuiTablePagination-selectIcon': { color: '#94A3B8' },
              '.MuiIconButton-root': { color: '#64748B' },
              '.MuiIconButton-root.Mui-disabled': { color: 'rgba(100,116,139,0.3)' },
            }}
          />
        </CardContent>
      </Card>

      {/* View Modal */}
      <Dialog open={!!viewUser} onClose={() => setViewUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          User Details
          <IconButton size="small" onClick={() => setViewUser(null)}><Close /></IconButton>
        </DialogTitle>
        {viewUser && (
          <DialogContent dividers sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar src={viewUser.profile_image ?? undefined} sx={{ width: 64, height: 64, bgcolor: '#3B82F6', fontSize: 22, fontWeight: 700 }}>
                {viewUser.first_name?.[0]}{viewUser.last_name?.[0]}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ color: '#F8FAFC' }}>{viewUser.first_name} {viewUser.last_name}</Typography>
                <Chip label={viewUser.role ?? 'user'} size="small" sx={{ ...roleSx(viewUser.role), mt: 0.5 }} />
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: '#7C3AED', fontWeight: 700, letterSpacing: 1 }}>USER INFO</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
              {[['Email', viewUser.email], ['Phone', viewUser.phone_number || '—'], ['Username', viewUser.username || '—'], ['Gender', viewUser.gender || '—'], ['Date of Birth', viewUser.date_of_birth || '—'], ['Joined', formatDate(viewUser.created_at)]].map(([label, value]) => (
                <Box key={label}>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>{label}</Typography>
                  <Typography sx={{ color: '#F1F5F9', fontSize: 13 }}>{value}</Typography>
                </Box>
              ))}
            </Box>
          </DialogContent>
        )}
      </Dialog>

      {/* Add / Edit Modal */}
      <Dialog open={!!formDialog} onClose={() => setFormDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{formDialog?.mode === 'add' ? 'Add User' : 'Edit User'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField label="First Name *" fullWidth size="small" value={form.first_name} onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))} />
              </Grid>
              <Grid size={6}>
                <TextField label="Last Name *" fullWidth size="small" value={form.last_name} onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))} />
              </Grid>
            </Grid>
            <TextField label="Email *" fullWidth size="small" value={form.email} disabled={formDialog?.mode === 'edit'} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            <TextField label="Phone" fullWidth size="small" value={form.phone_number} onChange={(e) => setForm((p) => ({ ...p, phone_number: e.target.value }))} />
            <TextField label="Username" fullWidth size="small" value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} />
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField label="Role" fullWidth size="small" select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
                  {ROLES.map((r) => <MenuItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={6}>
                <TextField label="Gender" fullWidth size="small" select value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}>
                  {['male', 'female', 'other'].map((g) => <MenuItem key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFormDialog(null)}>Cancel</Button>
          <Button variant="contained" disabled={isSaving} onClick={handleSave}>
            {isSaving ? 'Saving…' : formDialog?.mode === 'add' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#94A3B8' }}>Are you sure you want to delete this user? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="contained" color="error" disabled={deleteMutation.isPending} onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;
