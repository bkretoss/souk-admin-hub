import React, { useState, useMemo } from "react";
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
  IconButton,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Select,
  MenuItem,
  CircularProgress,
  TablePagination,
} from "@mui/material";
import { Add, Visibility, Edit, Delete, Close, Search } from "@mui/icons-material";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getContents,
  createContent,
  updateContent,
  updateContentStatus,
  deleteContent,
} from "@/lib/api/contentApi";
import { formatDate } from "@/lib/dateUtils";
import { toast } from "sonner";
import RichTextEditor from "@/components/RichTextEditor";

const EMPTY_FORM = { title: "", slug: "", content: "", status: "draft" };

const toSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const STATUS_COLORS: Record<string, string> = {
  published: "#10B981",
  draft: "#F59E0B",
};

const ContentPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [viewItem, setViewItem] = useState<any>(null);
  const [formDialog, setFormDialog] = useState<{ mode: "add" | "edit"; data?: any } | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  const { data: contents, isLoading } = useQuery({
    queryKey: ["contents"],
    queryFn: getContents,
    staleTime: 0,
  });

  const totalContents     = contents?.length ?? 0;
  const publishedContents = contents?.filter((c: any) => c.status === "published").length ?? 0;
  const draftContents     = totalContents - publishedContents;

  const isTitleTaken = (title: string, excludeId?: string) =>
    (contents ?? []).some(
      (c: any) => c.title?.trim().toLowerCase() === title.trim().toLowerCase() && c.id !== excludeId,
    );

  const isSlugTaken = (slug: string, excludeId?: string) =>
    (contents ?? []).some(
      (c: any) => c.slug?.trim().toLowerCase() === slug.trim().toLowerCase() && c.id !== excludeId,
    );

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["contents"], refetchType: "active" });

  const createMutation = useMutation({
    mutationFn: (payload: typeof form) => createContent(payload),
    onSuccess: () => {
      invalidate();
      setFormDialog(null);
      toast.success("Content created successfully!");
    },
    onError: (err: any) => {
      const msg = err?.message ?? "Failed to create content";
      if (msg.toLowerCase().includes("title")) setTitleError(msg);
      else if (msg.toLowerCase().includes("slug")) setSlugError(msg);
      else toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: typeof form }) => updateContent(id, payload),
    onSuccess: () => {
      invalidate();
      setFormDialog(null);
      toast.success("Content updated successfully!");
    },
    onError: (err: any) => {
      const msg = err?.message ?? "Failed to update content";
      if (msg.toLowerCase().includes("title")) setTitleError(msg);
      else if (msg.toLowerCase().includes("slug")) setSlugError(msg);
      else toast.error(msg);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateContentStatus(id, status),
    onMutate: ({ id }) => setUpdatingStatusId(id),
    onSuccess: () => {
      invalidate();
      toast.success("Status updated successfully!");
    },
    onError: () => toast.error("Failed to update status"),
    onSettled: () => setUpdatingStatusId(null),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContent,
    onSuccess: () => {
      invalidate();
      setDeleteId(null);
      toast.success("Content deleted successfully!");
    },
    onError: () => toast.error("Failed to delete content"),
  });

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setTitleError(null);
    setSlugError(null);
    setFormDialog({ mode: "add" });
  };

  const openEdit = (item: any) => {
    setForm({ title: item.title, slug: item.slug, content: item.content ?? "", status: item.status ?? "draft" });
    setTitleError(null);
    setSlugError(null);
    setFormDialog({ mode: "edit", data: item });
  };

  const handleTitleChange = (title: string) => {
    const excludeId = formDialog?.mode === "edit" ? formDialog.data.id : undefined;
    const newSlug = formDialog?.mode === "add" ? toSlug(title) : undefined;
    setForm((p) => ({ ...p, title, ...(newSlug !== undefined ? { slug: newSlug } : {}) }));
    if (!title.trim()) setTitleError("Title is required");
    else if (isTitleTaken(title, excludeId)) setTitleError("Content with this title already exists");
    else setTitleError(null);
    if (newSlug !== undefined) {
      if (!newSlug) setSlugError("Slug is required");
      else if (isSlugTaken(newSlug, excludeId)) setSlugError("Slug already exists");
      else setSlugError(null);
    }
  };

  const handleSlugChange = (slug: string) => {
    setForm((p) => ({ ...p, slug }));
    const excludeId = formDialog?.mode === "edit" ? formDialog.data.id : undefined;
    if (!slug.trim()) setSlugError("Slug is required");
    else if (isSlugTaken(slug, excludeId)) setSlugError("Slug already exists");
    else setSlugError(null);
  };

  const handleSave = () => {
    const excludeId = formDialog?.mode === "edit" ? formDialog.data.id : undefined;
    if (!form.title.trim()) { setTitleError("Title is required"); return; }
    if (isTitleTaken(form.title, excludeId)) { setTitleError("Content with this title already exists"); return; }
    if (!form.slug.trim()) { setSlugError("Slug is required"); return; }
    if (isSlugTaken(form.slug, excludeId)) { setSlugError("Slug already exists"); return; }
    const payload = { title: form.title, slug: form.slug, content: form.content, status: form.status };
    if (formDialog?.mode === "add") createMutation.mutate(payload);
    else if (formDialog?.mode === "edit") updateMutation.mutate({ id: formDialog.data.id, payload });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (contents ?? []).filter((item: any) => {
      const matchSearch = !q || item.title?.toLowerCase().includes(q) || item.slug?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [contents, search, statusFilter]);

  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage],
  );

  const statusSx = (status: string) => ({
    fontSize: 12,
    fontWeight: 600,
    minWidth: 120,
    color: STATUS_COLORS[status] ?? "#64748B",
    bgcolor: `${STATUS_COLORS[status] ?? "#64748B"}14`,
    borderRadius: 2,
    "& .MuiOutlinedInput-notchedOutline": { borderColor: `${STATUS_COLORS[status] ?? "#64748B"}33` },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: STATUS_COLORS[status] ?? "#64748B" },
    "& .MuiSelect-icon": { color: STATUS_COLORS[status] ?? "#64748B" },
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "#F8FAFC", mb: 0.5 }}>Content</Typography>
          <Typography variant="body2" sx={{ color: "#64748B" }}>
            Manage CMS pages · {totalContents} total
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openAdd}>Add Content</Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Search by title or slug…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: "#94A3B8", fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: "25%",
            "& .MuiOutlinedInput-root": {
              color: "#F1F5F9",
              bgcolor: "rgba(255,255,255,0.05)",
              "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
              "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
              "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
            },
            "& input::placeholder": { color: "#64748B", opacity: 1 },
          }}
        />
        <FormControl size="small" sx={{ width: "15%" }}>
          <InputLabel sx={{ color: "#94A3B8", "&.Mui-focused": { color: "#7C3AED" } }}>Status</InputLabel>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(0); }}
            sx={{
              color: "#F1F5F9",
              bgcolor: "rgba(255,255,255,0.05)",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#7C3AED" },
              "& .MuiSelect-icon": { color: "#94A3B8" },
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="published" sx={{ color: "#10B981" }}>Published</MenuItem>
            <MenuItem value="draft" sx={{ color: "#F59E0B" }}>Draft</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table Card */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Slug (URL)</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Updated</TableCell>
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
                ) : paginated.length > 0 ? (
                  paginated.map((item: any) => (
                    <TableRow key={item.id} sx={{ "&:hover": { bgcolor: "rgba(148,163,184,0.04)" } }}>
                      <TableCell sx={{ color: "#F8FAFC", fontSize: 14, fontWeight: 500 }}>{item.title}</TableCell>
                      <TableCell sx={{ color: "#94A3B8", fontSize: 13, fontFamily: "monospace", whiteSpace: "nowrap" }}>
                        {`${window.location.origin}/pages/${item.slug}`}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Select
                            size="small"
                            value={item.status ?? "draft"}
                            disabled={updatingStatusId === item.id}
                            onChange={(e) => statusMutation.mutate({ id: item.id, status: e.target.value })}
                            sx={statusSx(item.status)}
                          >
                            <MenuItem value="published" sx={{ fontSize: 13, color: "#10B981" }}>Published</MenuItem>
                            <MenuItem value="draft" sx={{ fontSize: 13, color: "#F59E0B" }}>Draft</MenuItem>
                          </Select>
                          {updatingStatusId === item.id && <CircularProgress size={16} sx={{ color: "#7C3AED" }} />}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: "#F8FAFC", fontSize: 13 }}>
                        {formatDate(item.updated_at ?? item.created_at)}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => setViewItem(item)} sx={{ color: "#60A5FA" }}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(item)} sx={{ color: "#94A3B8" }}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => setDeleteId(item.id)} sx={{ color: "#EF4444" }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: "center", py: 6, color: "#64748B" }}>
                      No content found
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
              color: "#64748B",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": { color: "#64748B", fontSize: 13 },
              ".MuiTablePagination-select, .MuiTablePagination-selectIcon": { color: "#94A3B8" },
              ".MuiIconButton-root": { color: "#64748B" },
              ".MuiIconButton-root.Mui-disabled": { color: "rgba(100,116,139,0.3)" },
            }}
          />
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={!!viewItem} onClose={() => setViewItem(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {viewItem?.title}
          <IconButton size="small" onClick={() => setViewItem(null)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "12px !important" }}>
          {[
            ["Slug (URL)", `/pages/${viewItem?.slug}`],
            ["Status", viewItem?.status],
            ["Created", formatDate(viewItem?.created_at)],
            ["Last Updated", formatDate(viewItem?.updated_at)],
          ].map(([label, value]) => (
            <Box key={label}>
              <Typography sx={{ color: "#64748B", fontSize: 12, mb: 0.5 }}>{String(label).toUpperCase()}</Typography>
              <Typography sx={{ color: "#F1F5F9", fontSize: 14, fontWeight: 500, textTransform: "capitalize" }}>{value}</Typography>
            </Box>
          ))}
          <Box>
            <Typography sx={{ color: "#64748B", fontSize: 12, mb: 1 }}>CONTENT</Typography>
            <Box
              sx={{ color: "#94A3B8", fontSize: 14, "& h1,& h2,& h3": { color: "#F1F5F9" }, "& a": { color: "#A78BFA" } }}
              dangerouslySetInnerHTML={{ __html: viewItem?.content || "<em>No content.</em>" }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setViewItem(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add / Edit Dialog */}
      <Dialog open={!!formDialog} onClose={() => setFormDialog(null)} maxWidth="lg" fullWidth>
        <DialogTitle>{formDialog?.mode === "add" ? "Add Content" : "Edit Content"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField
            label="Title *"
            fullWidth
            size="small"
            value={form.title}
            error={!!titleError}
            helperText={titleError ?? ""}
            onChange={(e) => handleTitleChange(e.target.value)}
          />
          <TextField
            label="Slug *"
            fullWidth
            size="small"
            value={form.slug}
            error={!!slugError}
            helperText={slugError ?? `Public URL: /pages/${form.slug || "your-slug"}`}
            FormHelperTextProps={{ sx: { color: slugError ? undefined : "#64748B" } }}
            InputProps={{
              startAdornment: (
                <Typography sx={{ color: "#64748B", mr: 0.5, fontSize: 14 }}>/pages/</Typography>
              ),
            }}
            onChange={(e) => handleSlugChange(e.target.value)}
          />
          <Box>
            <Typography sx={{ color: "#94A3B8", fontSize: 12, mb: 0.5 }}>Status</Typography>
            <Select
              fullWidth
              size="small"
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              sx={{
                color: STATUS_COLORS[form.status] ?? "#64748B",
                bgcolor: `${STATUS_COLORS[form.status] ?? "#64748B"}14`,
                "& .MuiOutlinedInput-notchedOutline": { borderColor: `${STATUS_COLORS[form.status] ?? "#64748B"}33` },
                "& .MuiSelect-icon": { color: STATUS_COLORS[form.status] ?? "#64748B" },
              }}
            >
              <MenuItem value="draft" sx={{ color: "#F59E0B" }}>Draft</MenuItem>
              <MenuItem value="published" sx={{ color: "#10B981" }}>Published</MenuItem>
            </Select>
          </Box>
          <Box>
            <Typography sx={{ color: "#94A3B8", fontSize: 13, mb: 1, fontWeight: 500 }}>Content (HTML)</Typography>
            <RichTextEditor
              key={formDialog?.data?.id ?? "new"}
              value={form.content}
              onChange={(content) => setForm((p) => ({ ...p, content }))}
              placeholder="Start writing your page content..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFormDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!form.title.trim() || !form.slug.trim() || !!titleError || !!slugError || isSaving}
            onClick={handleSave}
          >
            {isSaving ? "Saving…" : formDialog?.mode === "add" ? "Create" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Content</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#94A3B8" }}>
            Are you sure you want to delete this page? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending}
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
          >
            {deleteMutation.isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContentPage;
