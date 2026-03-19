import React from 'react';
import { Box, Typography } from '@mui/material';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:    { label: 'Pending',    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)'  },
  processing: { label: 'Processing', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)'  },
  shipped:    { label: 'Shipped',    color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.3)'  },
  completed:  { label: 'Completed',  color: '#10B981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)'  },
  cancelled:  { label: 'Cancelled',  color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)'   },
};

const FALLBACK = { label: '', color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)' };

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const s = STATUS_MAP[status?.toLowerCase()] ?? { ...FALLBACK, label: status ?? '—' };
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.25,
        py: 0.4,
        borderRadius: '6px',
        bgcolor: s.bg,
        border: `1px solid ${s.border}`,
      }}
    >
      {/* dot indicator */}
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: s.color, flexShrink: 0 }} />
      <Typography sx={{ color: s.color, fontSize: 12, fontWeight: 600, lineHeight: 1, whiteSpace: 'nowrap' }}>
        {s.label}
      </Typography>
    </Box>
  );
};

export default StatusBadge;
