import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Skeleton,
} from "@mui/material";
import { Add, Visibility, Edit, Delete } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const contentApi = {
  getAll: async () => {
    const { data, error } = await supabase.from("content").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  create: async (payload: any) => {
    const { data, error } = await supabase.from("content").insert([payload]).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id: string, updates: any) => {
    const { data, error } = await supabase.from("content").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  delete: async (id: string) => {
    const { error } = await supabase.from("content").delete().eq("id", id);
    if (error) throw error;
  },
};

const statusColor: Record<string, string> = {
  published: "#10B981",
  draft: "#F59E0B",
  archived: "#64748B",
};

const EMPTY_FORM = { title: "", type: "page", status: "draft", body: "" };

const ContentPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState<{ mode: "add" | "edit" | "view"; data: any } | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: contents, isLoading } = useQuery({ queryKey: ["content"], queryFn: contentApi.getAll });

  const createMutation = useMutation({
    mutationFn: contentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      setDialog(null);
      toast.success("Content created successfully!");
    },
    onError: () => toast.error("Failed to create content"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => contentApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      setDialog(null);
      toast.success("Content updated successfully!");
    },
    onError: () => toast.error("Failed to update content"),
  });

  const deleteMutation = useMutation({
    mutationFn: contentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      setDeleteId(null);
      toast.success("Content deleted successfully!");
    },
    onError: () => toast.error("Failed to delete content"),
  });

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setDialog({ mode: "add", data: null });
  };
  const openEdit = (row: any) => {
    setForm({ title: row.title, type: row.type, status: row.status, body: row.body ?? "" });
    setDialog({ mode: "edit", data: row });
  };
  const openView = (row: any) => setDialog({ mode: "view", data: row });

  const handleSave = () => {
    if (dialog?.mode === "add") createMutation.mutate(form);
    else if (dialog?.mode === "edit") updateMutation.mutate({ id: dialog.data.id, updates: form });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "#F1F5F9", fontWeight: 700, mb: 0.5 }}>
            Content
          </Typography>
          <Typography sx={{ color: "#64748B", fontSize: 14 }}>Manage pages and posts</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openAdd}>
          Add Content
        </Button>
      </Box>

      <Card sx={{ bgcolor: "#151C2C", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {["Title", "Type", "Status", "Created Date", "Actions"].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        color: "#64748B",
                        fontWeight: 600,
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        borderColor: "rgba(255,255,255,0.06)",
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j} sx={{ borderColor: "rgba(255,255,255,0.06)" }}>
                          <Skeleton sx={{ bgcolor: "rgba(255,255,255,0.06)" }} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : contents && contents.length > 0 ? (
                  contents.map((row: any) => (
                    <TableRow
                      key={row.id}
                      sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.02)" }, "&:last-child td": { borderBottom: 0 } }}
                    >
                      <TableCell
                        sx={{ color: "#F1F5F9", fontSize: 14, fontWeight: 500, borderColor: "rgba(255,255,255,0.06)" }}
                      >
                        {row.title}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "#94A3B8",
                          fontSize: 13,
                          textTransform: "capitalize",
                          borderColor: "rgba(255,255,255,0.06)",
                        }}
                      >
                        {row.type}
                      </TableCell>
                      <TableCell sx={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        <Chip
                          label={row.status}
                          size="small"
                          sx={{
                            bgcolor: `${statusColor[row.status] ?? "#64748B"}22`,
                            color: statusColor[row.status] ?? "#64748B",
                            fontWeight: 600,
                            fontSize: 12,
                            textTransform: "capitalize",
                            border: `1px solid ${statusColor[row.status] ?? "#64748B"}44`,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: "#64748B", fontSize: 13, borderColor: "rgba(255,255,255,0.06)" }}>
                        {new Date(row.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        <IconButton size="small" onClick={() => openView(row)} sx={{ color: "#3B82F6", mr: 0.5 }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => openEdit(row)} sx={{ color: "#94A3B8", mr: 0.5 }}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => setDeleteId(row.id)} sx={{ color: "#EF4444" }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: "center", py: 6, color: "#64748B", borderBottom: 0 }}>
                      No content yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={!!dialog && dialog.mode !== "view"} onClose={() => setDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: "#F1F5F9" }}>{dialog?.mode === "add" ? "Add Content" : "Edit Content"}</DialogTitle>
        <DialogContent sx={{ pt: "16px !important", display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Title"
            fullWidth
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />
          <TextField
            label="Type"
            select
            fullWidth
            value={form.type}
            onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
          >
            {["page", "post", "announcement"].map((t) => (
              <MenuItem key={t} value={t} sx={{ textTransform: "capitalize" }}>
                {t}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Status"
            select
            fullWidth
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
          >
            {["draft", "published", "archived"].map((s) => (
              <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Body"
            fullWidth
            multiline
            rows={4}
            value={form.body}
            onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.title}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!dialog && dialog.mode === "view"} onClose={() => setDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: "#F1F5F9" }}>{dialog?.data?.title}</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#64748B", fontSize: 13, mb: 1 }}>
            Type: {dialog?.data?.type} · Status: {dialog?.data?.status}
          </Typography>
          <Typography sx={{ color: "#94A3B8", fontSize: 14 }}>{dialog?.data?.body || "No body content."}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialog(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ color: "#F1F5F9" }}>Delete Content</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#94A3B8" }}>Are you sure you want to delete this content?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContentPage;
