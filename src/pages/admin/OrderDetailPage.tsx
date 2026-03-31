import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, Chip, Button, Skeleton,
  Divider, Grid, Avatar,
} from "@mui/material";
import {
  ArrowBack, Person, Email, Phone, Fingerprint, CalendarToday,
  CheckCircle, Cancel, OpenInNew,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "@/lib/api/ordersApi";
import { formatDate } from "@/lib/dateUtils";

// ── helpers ──────────────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography sx={{
    color: "#7C3AED", fontWeight: 700, fontSize: 11,
    letterSpacing: 1, textTransform: "uppercase", mb: 2,
  }}>
    {children}
  </Typography>
);

const Field: React.FC<{ icon?: React.ReactNode; label: string; value: React.ReactNode }> = ({
  icon, label, value,
}) => (
  <Box>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.4 }}>
      {icon && <Box sx={{ color: "#7C3AED", display: "flex", fontSize: 15 }}>{icon}</Box>}
      <Typography sx={{ color: "#64748B", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>
        {label}
      </Typography>
    </Box>
    <Typography sx={{ color: value ? "#F1F5F9" : "#334155", fontSize: 14, pl: icon ? 2.75 : 0, wordBreak: "break-word" }}>
      {value || "—"}
    </Typography>
  </Box>
);

const statusChipSx = (s: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    delivered:  { bg: "rgba(16,185,129,0.12)",  color: "#34D399" },
    completed:  { bg: "rgba(16,185,129,0.12)",  color: "#34D399" },
    pending:    { bg: "rgba(245,158,11,0.12)",   color: "#FBBF24" },
    processing: { bg: "rgba(59,130,246,0.12)",   color: "#60A5FA" },
    shipped:    { bg: "rgba(139,92,246,0.12)",   color: "#A78BFA" },
    cancelled:  { bg: "rgba(239,68,68,0.12)",    color: "#F87171" },
    paid:       { bg: "rgba(16,185,129,0.12)",   color: "#34D399" },
    unpaid:     { bg: "rgba(239,68,68,0.12)",    color: "#F87171" },
  };
  const s_ = map[s?.toLowerCase()] ?? { bg: "rgba(100,116,139,0.12)", color: "#94A3B8" };
  return { bgcolor: s_.bg, color: s_.color, fontWeight: 700, fontSize: 12, textTransform: "capitalize" as const };
};

// ── page ─────────────────────────────────────────────────────────────────────

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id!),
    enabled: !!id,
  });

  const backBtn = (
    <Button
      startIcon={<ArrowBack />}
      onClick={() => navigate("/admin/orders")}
      sx={{ color: "#94A3B8", pl: 0, mb: 2, "&:hover": { color: "#F1F5F9", bgcolor: "transparent" } }}
    >
      Back to Orders
    </Button>
  );

  if (isLoading) {
    return (
      <Box>
        {backBtn}
        <Card>
          <CardContent sx={{ p: 3 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="text" height={44} sx={{ mb: 0.5 }} />
            ))}
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (isError || !order) {
    return (
      <Box>
        {backBtn}
        <Card>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography sx={{ color: "#EF4444", mb: 2 }}>Failed to load order details.</Typography>
            <Button variant="outlined" onClick={() => navigate("/admin/orders")}>Return to Orders</Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const user = order.user;
  const fullName = user ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() : null;
  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
    : "?";
  const total = ((order.product?.price ?? 0) + (order.delivery_price ?? 0)).toFixed(2);

  return (
    <Box>
      {backBtn}

      {/* Page header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "#F8FAFC", fontWeight: 700 }}>Order Details</Typography>
          <Typography variant="body2" sx={{ color: "#475569", mt: 0.25, fontFamily: "monospace" }}>
            #{order.id}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          {order.status && <Chip label={order.status} sx={statusChipSx(order.status)} />}
          {order.payment_status && <Chip label={order.payment_status} sx={statusChipSx(order.payment_status)} />}
        </Box>
      </Box>

      <Grid container spacing={3}>

        {/* ── Left: User Info card ── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <SectionLabel>Customer Information</SectionLabel>

              {!user ? (
                <Typography sx={{ color: "#64748B", fontSize: 13 }}>User information not available.</Typography>
              ) : (
                <>
                  {/* Avatar + name */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                    <Avatar sx={{ width: 52, height: 52, bgcolor: "#3B82F6", fontWeight: 700, fontSize: 18 }}>
                      {initials || <Person />}
                    </Avatar>
                    <Box>
                      <Typography sx={{ color: "#F8FAFC", fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>
                        {fullName || "—"}
                      </Typography>
                      <Chip
                        size="small"
                        icon={user.is_active ? <CheckCircle sx={{ fontSize: "14px !important" }} /> : <Cancel sx={{ fontSize: "14px !important" }} />}
                        label={user.is_active ? "Active" : "Inactive"}
                        sx={{
                          mt: 0.5,
                          bgcolor: user.is_active ? "rgba(16,185,129,0.12)" : "rgba(100,116,139,0.12)",
                          color: user.is_active ? "#34D399" : "#64748B",
                          fontWeight: 600, fontSize: 11,
                          "& .MuiChip-icon": { color: "inherit" },
                        }}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 2.5 }} />

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Field icon={<Email fontSize="inherit" />}        label="Email"        value={user.email} />
                    <Field icon={<Phone fontSize="inherit" />}        label="Phone"        value={user.phone_number} />
                    <Field icon={<Fingerprint fontSize="inherit" />}  label="User ID"      value={user.user_id} />
                    <Field icon={<CalendarToday fontSize="inherit" />} label="Member Since" value={formatDate(user.created_at)} />
                  </Box>

                  <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", my: 2.5 }} />

                  <Button
                    fullWidth
                    variant="outlined"
                    endIcon={<OpenInNew fontSize="small" />}
                    onClick={() => navigate(`/admin/users/${user.id ?? user.user_id}`)}
                    sx={{
                      borderColor: "rgba(124,58,237,0.4)",
                      color: "#A78BFA",
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": { borderColor: "#7C3AED", bgcolor: "rgba(124,58,237,0.08)" },
                    }}
                  >
                    View User Profile
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Right: Order Details ── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>

              {/* Order Info */}
              <SectionLabel>Order Information</SectionLabel>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5, mb: 3 }}>
                <Field label="Order ID"      value={<Typography sx={{ fontFamily: "monospace", fontSize: 13, color: "#F1F5F9", wordBreak: "break-all" }}>{order.id}</Typography>} />
                <Field label="Order Date"    value={formatDate(order.created_at)} />
                <Field label="Order Status"  value={order.status ? <Chip label={order.status} size="small" sx={statusChipSx(order.status)} /> : "—"} />
                <Field label="Payment Status" value={order.payment_status ? <Chip label={order.payment_status} size="small" sx={statusChipSx(order.payment_status)} /> : "—"} />
                <Field label="Delivery Type" value={order.delivery_type} />
                <Field label="Shipping Address" value={
                  typeof order.shipping_address === "object" && order.shipping_address
                    ? Object.values(order.shipping_address as Record<string, unknown>).filter(Boolean).join(", ")
                    : order.shipping_address
                } />
              </Box>

              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 3 }} />

              {/* Product Info */}
              <SectionLabel>Product Information</SectionLabel>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5, mb: 3 }}>
                <Field label="Product Name"   value={order.product?.name} />
                <Field label="Product Price"  value={order.product?.price != null ? `₹${order.product.price}` : "—"} />
                <Field label="Delivery Price" value={order.delivery_price != null ? `₹${order.delivery_price}` : "—"} />
                <Box>
                  <Typography sx={{ color: "#64748B", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", mb: 0.4 }}>
                    Total Amount
                  </Typography>
                  <Typography sx={{ color: "#34D399", fontSize: 20, fontWeight: 700 }}>
                    ₹{total}
                  </Typography>
                </Box>
              </Box>

            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderDetailPage;
