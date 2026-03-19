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
  getLocations,
  createLocation,
  updateLocation,
  updateLocationStatus,
  deleteLocation,
} from "@/lib/api/locationsApi";
import LocationStatCards from "@/components/admin/LocationStatCards";
import { formatDate } from "@/lib/dateUtils";
import { toast } from "sonner";

const EMPTY_FORM = { name: "", country: "", is_active: true };

const LocationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [viewItem, setViewItem] = useState<any>(null);
  const [formDialog, setFormDialog] = useState<{ mode: "add" | "edit"; data?: any } | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const { data: locations, isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: getLocations,
  });

  const totalLocations    = locations?.length ?? 0;
  const activeLocations   = locations?.filter((l) => l.is_active).length ?? 0;
  const inactiveLocations = totalLocations - activeLocations;

  const createMutation = useMutation({
    mutationFn: () => createLocation({ name: form.name, country: form.country || null, is_active: form.is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setFormDialog(null);
      toast.success("Location created successfully!");
    },
    onError: (err: any) => toast.error(err?.message ?? "Failed to create location"),
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) =>
      updateLocation(id, { name: form.name, country: form.country || null, is_active: form.is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setFormDialog(null);
      toast.success("Location updated successfully!");
    },
    onError: (err: any) => toast.error(err?.message ?? "Failed to update location"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => updateLocationStatus(id, is_active),
    onMutate: ({ id }) => setUpdatingStatusId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast.success("Status updated successfully!");
    },
    onError: () => toast.error("Failed to update status"),
    onSettled: () => setUpdatingStatusId(null),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setDeleteId(null);
      toast.success("Location deleted successfully!");
    },
    onError: () => toast.error("Failed to delete location"),
  });

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormDialog({ mode: "add" });
  };
  const openEdit = (loc: any) => {
    setForm({ name: loc.name, country: loc.country ?? "", is_active: loc.is_active ?? true });
    setFormDialog({ mode: "edit", data: loc });
  };
  const handleSave = () => {
    if (formDialog?.mode === "add") createMutation.mutate();
    else if (formDialog?.mode === "edit") updateMutation.mutate(formDialog.data.id);
  };
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (locations ?? []).filter((loc) => {
      const matchSearch = !q || loc.name?.toLowerCase().includes(q) || loc.country?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || (statusFilter === "active" ? loc.is_active : !loc.is_active);
      return matchSearch && matchStatus;
    });
  }, [locations, search, statusFilter]);

  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage],
  );

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}
      >
        <Box>
          <Typography variant="h4" sx={{ color: "#F8FAFC", mb: 0.5 }}>
            Locations
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748B" }}>
            Manage locations · {locations?.length ?? 0} total
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openAdd}>
          Add Location
        </Button>
      </Box>

      {/* Summary Cards */}
      <LocationStatCards
        total={totalLocations}
        active={activeLocations}
        inactive={inactiveLocations}
        isLoading={isLoading}
      />

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Search by name or address…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
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
            onChange={(e) => {
              setStatusFilter(e.target.value as typeof statusFilter);
              setPage(0);
            }}
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
            <MenuItem value="active" sx={{ color: "#10B981" }}>
              Active
            </MenuItem>
            <MenuItem value="inactive" sx={{ color: "#64748B" }}>
              Inactive
            </MenuItem>
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
                  <TableCell>Location Name</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton variant="text" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : paginated.length > 0 ? (
                  paginated.map((loc) => (
                    <TableRow key={loc.id} sx={{ "&:hover": { bgcolor: "rgba(148,163,184,0.04)" } }}>
                      <TableCell sx={{ color: "#F8FAFC", fontSize: 14, fontWeight: 500 }}>{loc.name}</TableCell>
                      <TableCell sx={{ color: "#F8FAFC", fontSize: 13 }}>{loc.country || "—"}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Select
                            size="small"
                            value={loc.is_active ? "active" : "inactive"}
                            disabled={updatingStatusId === loc.id}
                            onChange={(e) =>
                              statusMutation.mutate({ id: loc.id, is_active: e.target.value === "active" })
                            }
                            sx={{
                              fontSize: 12,
                              fontWeight: 600,
                              minWidth: 110,
                              color: loc.is_active ? "#10B981" : "#64748B",
                              bgcolor: loc.is_active ? "rgba(16,185,129,0.08)" : "rgba(100,116,139,0.08)",
                              borderRadius: 2,
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: loc.is_active ? "#10B98133" : "#64748B33",
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: loc.is_active ? "#10B981" : "#64748B",
                              },
                              "& .MuiSelect-icon": { color: loc.is_active ? "#10B981" : "#64748B" },
                            }}
                          >
                            <MenuItem value="active" sx={{ fontSize: 13, color: "#10B981" }}>
                              Active
                            </MenuItem>
                            <MenuItem value="inactive" sx={{ fontSize: 13, color: "#64748B" }}>
                              Inactive
                            </MenuItem>
                          </Select>
                          {updatingStatusId === loc.id && <CircularProgress size={16} sx={{ color: "#7C3AED" }} />}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: "#F8FAFC", fontSize: 13 }}>{formatDate(loc.created_at)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => setViewItem(loc)} sx={{ color: "#60A5FA" }}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(loc)} sx={{ color: "#94A3B8" }}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => setDeleteId(loc.id)} sx={{ color: "#EF4444" }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: "center", py: 6, color: "#64748B" }}>
                      No locations found
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
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
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
      <Dialog open={!!viewItem} onClose={() => setViewItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Location Details
          <IconButton size="small" onClick={() => setViewItem(null)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "12px !important" }}>
          {[
            ["Location Name", viewItem?.name],
            ["Address", viewItem?.country || "—"],
            ["Status", viewItem?.is_active ? "Active" : "Inactive"],
            ["Created Date", formatDate(viewItem?.created_at)],
          ].map(([label, value]) => (
            <Box key={label}>
              <Typography sx={{ color: "#64748B", fontSize: 12, mb: 0.5 }}>{String(label).toUpperCase()}</Typography>
              <Typography sx={{ color: "#F1F5F9", fontSize: 14, fontWeight: 500 }}>{value}</Typography>
            </Box>
          ))}
        </DialogContent>
      </Dialog>

      {/* Add / Edit Dialog */}
      <Dialog open={!!formDialog} onClose={() => setFormDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{formDialog?.mode === "add" ? "Add Location" : "Edit Location"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField
            label="Location Name *"
            fullWidth
            size="small"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
          <TextField
            label="Country / Address"
            fullWidth
            size="small"
            value={form.country}
            onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
          />
          <Box>
            <Typography sx={{ color: "#94A3B8", fontSize: 12, mb: 0.5 }}>Status</Typography>
            <Select
              fullWidth
              size="small"
              value={form.is_active ? "active" : "inactive"}
              onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.value === "active" }))}
              sx={{
                color: form.is_active ? "#10B981" : "#64748B",
                bgcolor: form.is_active ? "rgba(16,185,129,0.08)" : "rgba(100,116,139,0.08)",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: form.is_active ? "#10B98133" : "#64748B33" },
                "& .MuiSelect-icon": { color: form.is_active ? "#10B981" : "#64748B" },
              }}
            >
              <MenuItem value="active" sx={{ color: "#10B981" }}>
                Active
              </MenuItem>
              <MenuItem value="inactive" sx={{ color: "#64748B" }}>
                Inactive
              </MenuItem>
            </Select>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFormDialog(null)}>Cancel</Button>
          <Button variant="contained" disabled={!form.name.trim() || isSaving} onClick={handleSave}>
            {isSaving ? "Saving…" : formDialog?.mode === "add" ? "Create" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Location</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#94A3B8" }}>
            Are you sure you want to delete this location? This action cannot be undone.
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

export default LocationsPage;
