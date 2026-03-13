import React from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Skeleton,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/lib/api';

const CategoriesPage: React.FC = () => {
  const { data: categories, isLoading } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.getAll });

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#F8FAFC', mb: 0.5 }}>Categories</Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>Product categories and subcategories</Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>{Array.from({ length: 3 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
                  ))
                ) : categories && categories.length > 0 ? (
                  categories.map((cat) => (
                    <TableRow key={cat.id} sx={{ '&:hover': { bgcolor: 'rgba(148,163,184,0.04)' } }}>
                      <TableCell>
                        <Chip label={cat.name} sx={{ bgcolor: 'rgba(59,130,246,0.12)', color: '#60A5FA', fontWeight: 500 }} />
                      </TableCell>
                      <TableCell sx={{ color: '#94A3B8', fontSize: 13 }}>{new Date(cat.created_at).toLocaleDateString()}</TableCell>
                      <TableCell sx={{ color: '#64748B', fontFamily: 'monospace', fontSize: 12 }}>{cat.id.slice(0, 12)}…</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ textAlign: 'center', py: 6, color: '#64748B' }}>No categories found</TableCell>
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

export default CategoriesPage;
