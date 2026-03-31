import React, { useState, useMemo } from "react";
import {
  Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Skeleton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Tooltip,
  Select, MenuItem, CircularProgress, TablePagination, Chip, Avatar,
} from "@mui/material";
import { Add, Visibility, Edit, Delete, Close, Search } from "@mui/icons-material";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, createProduct, updateProduct, deleteProduct, type Product } from "@/lib/api/productsApi";
import ProductStatCards from "@/components/admin/ProductStatCards";
import { getCategories } from "@/lib/api/categoriesApi";
import { getSubCategories } from "@/lib/api/subCategoriesApi";
import { getLocations } from "@/lib/api/locationsApi";
import { formatDate } from "@/lib/dateUtils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const CONDITIONS = ["new", "like new", "good", "fair", "poor"] as const;

const EMPTY_FORM = {
  title: "",
  brand: "",
  price: "",
  condition: "new",
  category_id: "",
  sub_category_id: "",
  location: "",
  images: "",
  description: "",
  size: "",
  color: "",
  material: "",
  is_sold: false,
};

const selectSx = {
  color: "#F1F5F9",
  bgcolor: "rgba(255,255,255,0.05)",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#7C3AED" },
  "& .MuiSelect-icon": { color: "#94A3B8" },
};

const filterSx = { ...selectSx, "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" } };

const ProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [viewItem, setViewItem] = useState<Product | null>(null);
  const [formDialog, setFormDialog] = useState<{ mode: "add" | "edit"; data?: Product } | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [updatingSoldId, setUpdatingSoldId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [soldFilter, setSoldFilter] = useState<"all" | "available" | "sold">("all");

  const { data: products, isLoading } = useQuery({ queryKey: ["products"], queryFn: getProducts });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const { data: subCategories } = useQuery({ queryKey: ["sub-categories"], queryFn: getSubCategories });
  const { data: locations } = useQuery({ queryKey: ["locations"], queryFn: getLocations });

  const totalProducts  = products?.length ?? 0;
  const soldProducts   = products?.filter((p) => p.is_sold).length ?? 0;
  const activeProducts = totalProducts - soldProducts;

  const createMutation = useMutation({
    mutationFn: () => createProduct({
      title: form.title, brand: form.brand || null, price: parseFloat(form.price),
      condition: form.condition, category_id: form.category_id,
      sub_category_id: form.sub_category_id || null,
      location: form.location || null,
      images: parseImages(form.images),
      description: form.description || null,
      size: form.size || null, color: form.color || null, material: form.material || null,
      is_sold: form.is_sold, seller_id: user!.id,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["products"] }); setFormDialog(null); toast.success("Product created successfully!"); },
    onError: (err: any) => toast.error(err?.message ?? "Failed to create product"),
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) => updateProduct(id, {
      title: form.title, brand: form.brand || null, price: parseFloat(form.price),
      condition: form.condition, category_id: form.category_id,
      sub_category_id: form.sub_category_id || null,
      location: form.location || null,
      images: parseImages(form.images),
      description: form.description || null,
      size: form.size || null, color: form.color || null, material: form.material || null,
      is_sold: form.is_sold,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["products"] }); setFormDialog(null); toast.success("Product updated successfully!"); },
    onError: (err: any) => toast.error(err?.message ?? "Failed to update product"),
  });

  const soldMutation = useMutation({
    mutationFn: ({ id, is_sold }: { id: string; is_sold: boolean }) => updateProduct(id, { is_sold }),
    onMutate: ({ id }) => setUpdatingSoldId(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["products"] }); toast.success("Status updated!"); },
    onError: () => toast.error("Failed to update status"),
    onSettled: () => setUpdatingSoldId(null),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["products"] }); setDeleteId(null); toast.success("Product deleted successfully!"); },
    onError: () => toast.error("Failed to delete product"),
  });

  const validate = (f: typeof form) => {
    const errs: Record<string, string> = {};
    if (!f.title.trim()) errs.title = "Product name is required";
    else if (f.title.trim().length < 2) errs.title = "Product name must be at least 2 characters";
    if (!f.category_id) errs.category_id = "Category is required";
    if (!f.price) errs.price = "Price is required";
    else if (isNaN(Number(f.price)) || Number(f.price) <= 0) errs.price = "Price must be a valid positive number";
    return errs;
  };

  const parseImages = (raw: string): string[] | null => {
    const arr = raw.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
    return arr.length > 0 ? arr : null;
  };

  const touchField = (field: string, f = form) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFormErrors(validate(f));
  };

  const openAdd = () => { setForm(EMPTY_FORM); setFormErrors({}); setTouched({}); setFormDialog({ mode: "add" }); };

  const openEdit = (product: Product) => {
    setFormErrors({}); setTouched({});
    setForm({
      title: product.title, brand: product.brand ?? "", price: String(product.price),
      condition: product.condition ?? "new", category_id: product.category_id,
      sub_category_id: product.sub_category_id ?? "",
      location: product.location ?? "",
      images: (product.images ?? []).join(", "),
      description: product.description ?? "",
      size: product.size ?? "", color: product.color ?? "", material: product.material ?? "",
      is_sold: product.is_sold,
    });
    setFormDialog({ mode: "edit", data: product });
  };

  const handleSave = () => {
    const errs = validate(form);
    setFormErrors(errs);
    setTouched({ title: true, category_id: true, price: true });
    if (Object.keys(errs).length > 0) return;
    if (formDialog?.mode === "add") createMutation.mutate();
    else if (formDialog?.mode === "edit") updateMutation.mutate(formDialog.data!.id);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (products ?? []).filter((p) => {
      const matchSearch = !q || p.title?.toLowerCase().includes(q) || (p.brand?.toLowerCase() ?? "").includes(q);
      const matchCategory = categoryFilter === "all" || p.category_id === categoryFilter;
      const matchCondition = conditionFilter === "all" || p.condition === conditionFilter;
      const matchSold = soldFilter === "all" || (soldFilter === "available" ? !p.is_sold : p.is_sold);
      return matchSearch && matchCategory && matchCondition && matchSold;
    });
  }, [products, search, categoryFilter, conditionFilter, soldFilter]);

  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage],
  );

  const filteredSubCats = useMemo(
    () => (subCategories as any[] ?? []).filter((sc: any) => !form.category_id || sc.category_id === form.category_id),
    [subCategories, form.category_id],
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "#F8FAFC", mb: 0.5 }}>Products</Typography>
          <Typography variant="body2" sx={{ color: "#64748B" }}>
            Manage product listings · {totalProducts} total
          </Typography>
        </Box>

      </Box>

      <ProductStatCards total={totalProducts} active={activeProducts} sold={soldProducts} isLoading={isLoading} />

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, mt: 2, alignItems: "center", flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder="Search by name or brand…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: "#94A3B8", fontSize: 18 }} /></InputAdornment> }}
          sx={{
            width: "25%",
            "& .MuiOutlinedInput-root": {
              color: "#F1F5F9", bgcolor: "rgba(255,255,255,0.05)",
              "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
              "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
              "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
            },
            "& input::placeholder": { color: "#64748B", opacity: 1 },
          }}
        />
        <FormControl size="small" sx={{ width: "15%" }}>
          <InputLabel sx={{ color: "#94A3B8", "&.Mui-focused": { color: "#7C3AED" } }}>Category</InputLabel>
          <Select label="Category" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }} sx={filterSx}>
            <MenuItem value="all">All Categories</MenuItem>
            {(categories ?? []).map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ width: "13%" }}>
          <InputLabel sx={{ color: "#94A3B8", "&.Mui-focused": { color: "#7C3AED" } }}>Condition</InputLabel>
          <Select label="Condition" value={conditionFilter} onChange={(e) => { setConditionFilter(e.target.value); setPage(0); }} sx={filterSx}>
            <MenuItem value="all">All Conditions</MenuItem>
            {CONDITIONS.map((c) => <MenuItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ width: "12%" }}>
          <InputLabel sx={{ color: "#94A3B8", "&.Mui-focused": { color: "#7C3AED" } }}>Status</InputLabel>
          <Select label="Status" value={soldFilter} onChange={(e) => { setSoldFilter(e.target.value as typeof soldFilter); setPage(0); }} sx={filterSx}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="available" sx={{ color: "#10B981" }}>Available</MenuItem>
            <MenuItem value="sold" sx={{ color: "#EF4444" }}>Sold</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Sub-Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Condition</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>{Array.from({ length: 8 }).map((_, j) => <TableCell key={j}><Skeleton variant="text" /></TableCell>)}</TableRow>
                  ))
                ) : paginated.length > 0 ? (
                  paginated.map((product) => (
                    <TableRow key={product.id} sx={{ "&:hover": { bgcolor: "rgba(148,163,184,0.04)" } }}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar variant="rounded" src={product.images?.[0] ?? undefined} sx={{ width: 40, height: 40, bgcolor: "rgba(148,163,184,0.1)", borderRadius: 1.5, fontSize: 14 }}>
                            {product.title?.[0] ?? "?"}
                          </Avatar>
                          <Box>
                            <Typography sx={{ color: "#F8FAFC", fontSize: 14, fontWeight: 500 }}>{product.title}</Typography>
                            <Typography sx={{ color: "#64748B", fontSize: 12 }}>{product.brand || "No brand"}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: "#94A3B8", fontSize: 13 }}>{product.categories?.name ?? "—"}</TableCell>
                      <TableCell sx={{ color: "#94A3B8", fontSize: 13 }}>{product.sub_categories?.name ?? "—"}</TableCell>
                      <TableCell sx={{ color: "#34D399", fontWeight: 600, fontSize: 14 }}>${Number(product.price).toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip label={product.condition ?? "new"} size="small" sx={{ bgcolor: "rgba(124,58,237,0.12)", color: "#A78BFA", fontSize: 12, fontWeight: 500 }} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Select
                            size="small"
                            value={product.is_sold ? "sold" : "available"}
                            disabled={updatingSoldId === product.id}
                            onChange={(e) => soldMutation.mutate({ id: product.id, is_sold: e.target.value === "sold" })}
                            sx={{
                              fontSize: 12, fontWeight: 600, minWidth: 110,
                              color: product.is_sold ? "#EF4444" : "#10B981",
                              bgcolor: product.is_sold ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)",
                              borderRadius: 2,
                              "& .MuiOutlinedInput-notchedOutline": { borderColor: product.is_sold ? "#EF444433" : "#10B98133" },
                              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: product.is_sold ? "#EF4444" : "#10B981" },
                              "& .MuiSelect-icon": { color: product.is_sold ? "#EF4444" : "#10B981" },
                            }}
                          >
                            <MenuItem value="available" sx={{ fontSize: 13, color: "#10B981" }}>Available</MenuItem>
                            <MenuItem value="sold" sx={{ fontSize: 13, color: "#EF4444" }}>Sold</MenuItem>
                          </Select>
                          {updatingSoldId === product.id && <CircularProgress size={16} sx={{ color: "#7C3AED" }} />}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: "#94A3B8", fontSize: 13 }}>{formatDate(product.created_at)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="View"><IconButton size="small" onClick={() => setViewItem(product)} sx={{ color: "#60A5FA" }}><Visibility fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" onClick={() => setDeleteId(product.id)} sx={{ color: "#EF4444" }}><Delete fontSize="small" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: "center", py: 6, color: "#64748B" }}>No products found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div" count={filtered.length} page={page} rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            sx={{
              color: "#64748B", borderTop: "1px solid rgba(255,255,255,0.06)",
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
          Product Details
          <IconButton size="small" onClick={() => setViewItem(null)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "12px !important" }}>
          {viewItem && [
            ["Product Name", viewItem.title],
            ["Brand", viewItem.brand || "—"],
            ["Category", viewItem.categories?.name ?? "—"],
            ["Sub-Category", viewItem.sub_categories?.name ?? "—"],
            ["Price", `$${Number(viewItem.price).toFixed(2)}`],
            ["Condition", viewItem.condition ?? "—"],
            ["Status", viewItem.is_sold ? "Sold" : "Available"],
            ["Images", viewItem.images?.join(", ") || "—"],
            ["Location", viewItem.location || "—"],
            ["Size", viewItem.size || "—"],
            ["Color", viewItem.color || "—"],
            ["Material", viewItem.material || "—"],
            ["Created Date", formatDate(viewItem.created_at)],
          ].map(([label, value]) => (
            <Box key={label as string}>
              <Typography sx={{ color: "#64748B", fontSize: 12, mb: 0.5 }}>{String(label).toUpperCase()}</Typography>
              <Typography sx={{ color: "#F1F5F9", fontSize: 14, fontWeight: 500 }}>{value}</Typography>
            </Box>
          ))}
        </DialogContent>
      </Dialog>

      {/* Add / Edit Dialog */}
      <Dialog open={!!formDialog} onClose={() => setFormDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{formDialog?.mode === "add" ? "Add Product" : "Edit Product"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          {/* Row 1: Product Name */}
          <TextField
            label="Product Name *" fullWidth size="small" value={form.title}
            error={touched.title && !!formErrors.title} helperText={touched.title ? formErrors.title : ""}
            onChange={(e) => { const u = { ...form, title: e.target.value }; setForm(u); if (touched.title) touchField("title", u); }}
            onBlur={() => touchField("title")}
          />
          {/* Row 1b: Images */}
          <Box>
            <TextField
              label="Image URLs (comma-separated)" fullWidth size="small" multiline rows={2}
              value={form.images}
              placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
              helperText="Separate multiple URLs with a comma"
              onChange={(e) => setForm((p) => ({ ...p, images: e.target.value }))}
            />
            {(() => {
              const previews = parseImages(form.images) ?? [];
              return previews.length > 0 ? (
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 1, mt: 1 }}>
                  {previews.map((url, i) => (
                    <Box key={i} sx={{ position: "relative", borderRadius: 1, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", bgcolor: "rgba(0,0,0,0.2)", aspectRatio: "1" }}>
                      <Box
                        component="img"
                        src={url}
                        alt={`Image ${i + 1}`}
                        onError={(e: any) => { e.currentTarget.style.display = "none"; }}
                        sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                      {i === 0 && (
                        <Chip label="Main" size="small" sx={{ position: "absolute", top: 4, left: 4, height: 18, fontSize: 10, bgcolor: "rgba(124,58,237,0.85)", color: "#fff" }} />
                      )}
                    </Box>
                  ))}
                </Box>
              ) : null;
            })()}
          </Box>
          {/* Row 2: Brand + Price */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="Brand" fullWidth size="small" value={form.brand}
              onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
            />
            <TextField
              label="Price *" fullWidth size="small" type="number" value={form.price}
              error={touched.price && !!formErrors.price} helperText={touched.price ? formErrors.price : ""}
              onChange={(e) => { const u = { ...form, price: e.target.value }; setForm(u); if (touched.price) touchField("price", u); }}
              onBlur={() => touchField("price")}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            />
          </Box>
          {/* Row 3: Category + Sub-Category */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <FormControl fullWidth size="small" error={touched.category_id && !!formErrors.category_id}>
              <InputLabel sx={{ color: "#94A3B8", "&.Mui-focused": { color: "#7C3AED" } }}>Category *</InputLabel>
              <Select
                label="Category *" value={form.category_id}
                onChange={(e) => { const u = { ...form, category_id: e.target.value, sub_category_id: "" }; setForm(u); touchField("category_id", u); }}
                sx={selectSx}
              >
                {(categories ?? []).map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
              {touched.category_id && formErrors.category_id && (
                <Typography sx={{ color: "#f44336", fontSize: "0.75rem", mt: 0.5, ml: 1.75 }}>{formErrors.category_id}</Typography>
              )}
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: "#94A3B8", "&.Mui-focused": { color: "#7C3AED" } }}>Sub-Category</InputLabel>
              <Select
                label="Sub-Category" value={form.sub_category_id}
                onChange={(e) => setForm((p) => ({ ...p, sub_category_id: e.target.value }))}
                sx={selectSx}
              >
                <MenuItem value="">None</MenuItem>
                {filteredSubCats.map((sc: any) => <MenuItem key={sc.id} value={sc.id}>{sc.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          {/* Row 4: Location */}
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: "#94A3B8", "&.Mui-focused": { color: "#7C3AED" } }}>Location</InputLabel>
            <Select
              label="Location" value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              sx={selectSx}
            >
              <MenuItem value="">None</MenuItem>
              {(locations ?? []).filter((l: any) => l.is_active !== false).map((l: any) => (
                <MenuItem key={l.id} value={l.name}>{l.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* Row 5: Condition + Status */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: "#94A3B8", "&.Mui-focused": { color: "#7C3AED" } }}>Condition</InputLabel>
              <Select label="Condition" value={form.condition} onChange={(e) => setForm((p) => ({ ...p, condition: e.target.value }))} sx={selectSx}>
                {CONDITIONS.map((c) => <MenuItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: "#94A3B8", "&.Mui-focused": { color: "#7C3AED" } }}>Status</InputLabel>
              <Select
                label="Status" value={form.is_sold ? "sold" : "available"}
                onChange={(e) => setForm((p) => ({ ...p, is_sold: e.target.value === "sold" }))}
                sx={{
                  ...selectSx,
                  color: form.is_sold ? "#EF4444" : "#10B981",
                  bgcolor: form.is_sold ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: form.is_sold ? "#EF444433" : "#10B98133" },
                  "& .MuiSelect-icon": { color: form.is_sold ? "#EF4444" : "#10B981" },
                }}
              >
                <MenuItem value="available" sx={{ color: "#10B981" }}>Available</MenuItem>
                <MenuItem value="sold" sx={{ color: "#EF4444" }}>Sold</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {/* Row 6: Size + Color + Material */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
            <TextField label="Size" fullWidth size="small" value={form.size} onChange={(e) => setForm((p) => ({ ...p, size: e.target.value }))} />
            <TextField label="Color" fullWidth size="small" value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))} />
            <TextField label="Material" fullWidth size="small" value={form.material} onChange={(e) => setForm((p) => ({ ...p, material: e.target.value }))} />
          </Box>
          {/* Row 7: Description */}
          <TextField
            label="Description" fullWidth size="small" multiline rows={3} value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFormDialog(null)}>Cancel</Button>
          <Button variant="contained" disabled={isSaving} onClick={handleSave}>
            {isSaving ? "Saving…" : formDialog?.mode === "add" ? "Create" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#94A3B8" }}>Are you sure you want to delete this product? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="contained" color="error" disabled={deleteMutation.isPending}
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
            {deleteMutation.isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsPage;
