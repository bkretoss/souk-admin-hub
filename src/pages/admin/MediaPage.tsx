import React, { useState, useCallback } from 'react';
import { Box, Typography, Card, CardContent, Button, CircularProgress } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const MediaPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: files, isLoading } = useQuery({
    queryKey: ['media-files'],
    queryFn: async () => {
      const { data, error } = await supabase.storage.from('product-images').list('', { limit: 50, sortBy: { column: 'created_at', order: 'desc' } });
      if (error) throw error;
      return data;
    },
  });

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('product-images').upload(fileName, file);
      if (error) throw error;
      toast.success('File uploaded');
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }, [queryClient]);

  const getPublicUrl = (name: string) => {
    const { data } = supabase.storage.from('product-images').getPublicUrl(name);
    return data.publicUrl;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#F8FAFC', mb: 0.5 }}>Media</Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>Upload and manage files</Typography>
        </Box>
        <Button variant="contained" component="label" startIcon={uploading ? <CircularProgress size={18} /> : <CloudUpload />} disabled={uploading}>
          Upload
          <input type="file" hidden accept="image/*" onChange={handleUpload} />
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(6, 1fr)' }, gap: 2 }}>
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} sx={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </Card>
          ))
        ) : files && files.length > 0 ? (
          files.filter(f => f.name !== '.emptyFolderPlaceholder').map((file) => (
            <Card key={file.name} sx={{ overflow: 'hidden', cursor: 'pointer' }}>
              <Box sx={{
                aspectRatio: '1', backgroundImage: `url(${getPublicUrl(file.name)})`,
                backgroundSize: 'cover', backgroundPosition: 'center', bgcolor: 'rgba(148,163,184,0.1)',
              }} />
              <CardContent sx={{ p: 1.5 }}>
                <Typography sx={{ fontSize: 12, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card sx={{ gridColumn: '1 / -1' }}>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <CloudUpload sx={{ fontSize: 48, color: '#64748B', mb: 2 }} />
              <Typography sx={{ color: '#64748B' }}>No media files yet. Upload your first file.</Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default MediaPage;
