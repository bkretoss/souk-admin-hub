import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Skeleton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Tooltip,
  TablePagination, MenuItem,
} from '@mui/material';
import { Add, Visibility, Edit, Delete, Close, Search } from '@mui/icons-material';
import InputAdornment from '@mui/material/InputAdornment';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories } from '@/lib/api/categoriesApi';
import { getSubCategories, createSubCategory, updateSubCategory, deleteSubCategory, SubCategoryPayload } from '@/lib/api/subCategoriesApi';
import { formatDate } from '@/lib/dateUtils';
import { toast } from 'sonner';

const emptyForm = (): SubCategoryPayload => ({ name: '', category_id: '' });

const SubCategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [viewItem, setViewItem] = useState<any>(null);
  const [formDialog, setFormDialog] = useState<{ mode: 'add' | 'edit'; data?: any } | null>(null);
  const [form, setForm] = useState<SubCategoryPayload>(emptyForm());
  const [errors, setErrors] = useState<Partial<Record<keyof SubCategoryPayload, string>>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const { data: subCategories = [], isLoading } = useQuery({ queryKey: ['sub-categories'], queryFn: getSubCategories });

  const createMutation = useMutation({
    mutationFn: () => createSubCategory(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sub-categories'] }); setFormDialog(null); toast.success('Sub-category created successfully!'); },
    onError: (err: any) => toast.error(err?.message ?? 'Failed to create sub-category'),
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) => updateSubCategory(id, form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sub-categories'] }); setFormDialog(null); toast.success('Sub-category updated successfully!'); },
    onError: (err: any) => toast.error(err?.message ?? 'Failed to update sub-category'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSubCategory,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sub-categories'] }); setDeleteId(null); toast.success('Sub-category deleted successfully!'); },
    onError: (err: any) => toast.error(err?.message ?? 'Failed to delete sub-category'),
  });

  const isDupName = (name: string, categoryId: string, excludeId?: string) =>
    (subCategories as any[]).some(
      (s) => s.name?.trim().toLowerCase() === name.trim().toLowerCase() &&
        s.category_id === categoryId && s.id !== excludeId,
    );

  const validate = (f: SubCategoryPayload, excludeId?: string) => {
    const e: typeof errors = {};
    if (!f.name.trim()) e.name = 'Name is required';
    else if (isDupName(f.name, f.category_id, excludeId)) e.name = 'Sub-category name already exists under this category';
    if (!f.category_id) e.category_id = 'Category is required';
    return e;
  };

  const openAdd = () => { setForm(emptyForm()); setErrors({}); setFormDialog({ mode: 'add' }); };
  const openEdit = (item: any) => {
    setForm({ name: item.name, category_id: item.category_id });
    setErrors({});
    setFormDialog({ mode: 'edit', data: item });
  };

  const handleFieldChange = (field: keyof SubCategoryPayload, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    const excludeId = formDialog?.mode === 'edit' ? formDialog.data.id : undefined;
    const e = validate(updated, excludeId);
    setErrors((prev) => ({ ...prev, [field]: e[field] ?? undefined }));
  };

  const handleSave = () => {
    const excludeId = formDialog?.mode === 'edit' ? formDialog.data.id : undefined;
    const e = validate(form, excludeId);
    if (Object.keys(e).length) { setErrors(e); return; }
    if (formDialog?.mode === 'add') createMutation.mutate();
    else if (formDialog?.mode === 'edit') updateMutation.mutate(formDialog.data.id);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (subCategories as any[]).filter((s) =>
      !q || s.name?.toLowerCase().includes(q) || s.categories?.name?.toLowerCase().includes(q),
    );
  }, [subCategories, search]);

  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage],
  );

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      color: '#F1F5F9',
      '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
      '&.Mui-focused fieldset': { borderColor: '#7C3AED' },
    },
    '& .MuiInputLabel-root': { color: '#64748B' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#A78BFA' },
    '& .MuiFormHelperText-root': { color: '#EF4444' },
    '& .MuiSelect-icon': { color: '#94A3B8' },
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#F8FAFC', mb: 0.5 }}>Sub-Categories</Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Manage sub-categories · {(subCategories as any[]).length} total
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openAdd}>Add Sub-Category</Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search by name or category…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#94A3B8', fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: '30%',
            '& .MuiOutlinedInput-root': {
              color: '#F1F5F9',
              bgcolor: 'rgba(255,255,255,0.05)',
              '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
              '&.Mui-focused fieldset': { borderColor: '#7C3AED' },
            },
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
                  <TableCell>Sub-Category Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}><Skeleton variant="text" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : paginated.length > 0 ? (
                  paginated.map((item: any) => (
                    <TableRow key={item.id} sx={{ '&:hover': { bgcolor: 'rgba(148,163,184,0.04)' } }}>
                      <TableCell sx={{ color: '#F8FAFC', fontSize: 14, fontWeight: 500 }}>{item.name}</TableCell>
                      <TableCell sx={{ color: '#94A3B8', fontSize: 13 }}>{item.categories?.name ?? '—'}</TableCell>
                      <TableCell sx={{ color: '#94A3B8', fontSize: 13 }}>{formatDate(item.created_at)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => setViewItem(item)} sx={{ color: '#60A5FA' }}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(item)} sx={{ color: '#94A3B8' }}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => setDeleteId(item.id)} sx={{ color: '#EF4444' }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', py: 6, color: '#64748B' }}>
                      No sub-categories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            sx={{
              color: '#64748B',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { color: '#64748B', fontSize: 13 },
              '.MuiTablePagination-select, .MuiTablePagination-selectIcon': { color: '#94A3B8' },
              '.MuiIconButton-root': { color: '#64748B' },
              '.MuiIconButton-root.Mui-disabled': { color: 'rgba(100,116,139,0.3)' },
            }}
          />
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={!!viewItem} onClose={() => setViewItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Sub-Category Details
          <IconButton size="small" onClick={() => setViewItem(null)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
          {[
            ['Category', viewItem?.categories?.name],
            ['Sub-Category Name', viewItem?.name],
            ['Created Date', formatDate(viewItem?.created_at)],
          ].map(([label, value]) => (
            <Box key={label as string}>
              <Typography sx={{ color: '#64748B', fontSize: 12, mb: 0.5 }}>{String(label).toUpperCase()}</Typography>
              <Typography sx={{ color: '#F1F5F9', fontSize: 14, fontWeight: 500 }}>{value ?? '—'}</Typography>
            </Box>
          ))}
        </DialogContent>
      </Dialog>

      {/* Add / Edit Dialog */}
      <Dialog open={!!formDialog} onClose={() => setFormDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{formDialog?.mode === 'add' ? 'Add Sub-Category' : 'Edit Sub-Category'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            select
            label="Category *"
            fullWidth
            size="small"
            value={form.category_id}
            error={!!errors.category_id}
            helperText={errors.category_id ?? ''}
            onChange={(e) => handleFieldChange('category_id', e.target.value)}
            sx={inputSx}
            SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: '#1E1E2E' } } } }}
          >
            {(categories as any[]).map((cat: any) => (
              <MenuItem key={cat.id} value={cat.id} sx={{ color: '#F1F5F9' }}>{cat.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Sub-Category Name *"
            fullWidth
            size="small"
            value={form.name}
            error={!!errors.name}
            helperText={errors.name ?? ''}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            sx={inputSx}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFormDialog(null)}>Cancel</Button>
          <Button variant="contained" disabled={isSaving} onClick={handleSave}>
            {isSaving ? 'Saving…' : formDialog?.mode === 'add' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Sub-Category</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#94A3B8' }}>Are you sure you want to delete this sub-category? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="contained" color="error" disabled={deleteMutation.isPending}
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubCategoriesPage;
