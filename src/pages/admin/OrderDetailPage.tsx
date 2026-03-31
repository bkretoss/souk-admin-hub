import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, Chip, Button, Skeleton,
  Divider, Grid, Avatar, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
} from "@mui/material";
import {
  ArrowBack, Person, Email, Phone, Fingerprint, CalendarToday,
  CheckCircle, Cancel, OpenInNew, ShoppingBag, LocationOn, CreditCard, LocalShipping,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "@/lib/api/ordersApi";
import { formatDate } from "@/lib/dateUtils";

// ── Shipping Address Component ──────────────────────────────────────────────

const ShippingAddressDisplay: React.FC<{ address: unknown }> = ({ address }) => {
  if (!address) return <Typography sx={{ color: "#64748B" }}>No shipping address provided.</Typography>;
  
  if (typeof address === "string") return <Typography sx={{ color: "#F1F5F9" }}>{address}</Typography>;
  
  if (typeof address === "object") {
    const addr = address as Record<string, unknown>;
    const fields = [
      { key: "address", label: "Address" },
      { key: "town_city", label: "City" },
      { key: "postcode", label: "Postal Code" },
      { key: "phone_number", label: "Phone" },
      { key: "email", label: "Email" },
    ];
    
    const filledFields = fields.filter(f => addr[f.key]);
    if (filledFields.length === 0) return <Typography sx={{ color: "#64748B" }}>No address details available.</Typography>;
    
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {filledFields.map(f => (
          <Box key={f.key} sx={{ display: "flex", gap: 1 }}>
            <Typography sx={{ color: "#64748B", fontSize: 12, fontWeight: 600, minWidth: 90 }}>
              {f.label}:
            </Typography>
            <Typography sx={{ color: "#F1F5F9", fontSize: 13 }}>
              {String(addr[f.key])}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }
  
  return <Typography sx={{ color: "#64748B" }}>Invalid address format.</Typography>;
};

// ── Helper Components ───────────────────────────────────────────────────────

const SectionLabel: React.FC<{ children: React.ReactNode; icon?: React.ReactNode }> = ({ children, icon }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
    {icon && <Box sx={{ color: "#7C3AED", display: "flex", fontSize: 18 }}>{icon}</Box>}
    <Typography sx={{
      color: "#7C3AED", fontWeight: 700, fontSize: 11,
      letterSpacing: 1, textTransform: "uppercase",
    }}>
      {children}
    </Typography>
  </Box>
);

const Field: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode }> = ({
  label, value, icon,
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

const statusChipSx = (s: string | null) => {
  if (!s) return {};
  const map: Record<string, { bg: string; color: string }> = {
    delivered:  { bg: "rgba(16,185,129,0.12)",  color: "#34D399" },
    pending:    { bg: "rgba(245,158,11,0.12)",   color: "#FBBF24" },
    processing: { bg: "rgba(59,130,246,0.12)",   color: "#60A5FA" },
    approved:   { bg: "rgba(59,130,246,0.12)",   color: "#60A5FA" },
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
            <Typography sx={{ color: "#EF4444", mb: 2 }}>Order not found or failed to load order details.</Typography>
            <Button variant="outlined" onClick={() => navigate("/admin/orders")}>Return to Orders</Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const buyer = order.buyer;
  const fullName = buyer ? `${buyer.first_name ?? ""} ${buyer.last_name ?? ""}`.trim() : null;
  const initials = buyer
    ? `${buyer.first_name?.[0] ?? ""}${buyer.last_name?.[0] ?? ""}`.toUpperCase()
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
            Order #{order.id}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          {order.status && <Chip label={order.status} sx={statusChipSx(order.status)} />}
          {/* Payment status chip can be added here if payment info is tracked */}
        </Box>
      </Box>

      {/* Main content grid */}
      <Grid container spacing={3}>

        {/* ── Top: Order & Buyer Information ── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <SectionLabel icon={<ShoppingBag />}>Order Information</SectionLabel>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
                <Field label="Order ID" value={
                  <Typography sx={{ fontFamily: "monospace", fontSize: 12, color: "#F1F5F9", wordBreak: "break-all" }}>
                    {order.id}
                  </Typography>
                } />
                <Field label="Order Date" value={formatDate(order.created_at)} icon={<CalendarToday fontSize="inherit" />} />
                <Field label="Last Updated" value={formatDate(order.updated_at)} />
                <Field label="Status" value={
                  order.status ? <Chip label={order.status} size="small" sx={statusChipSx(order.status)} /> : "—"
                } />
                <Field label="Delivery Type" value={order.delivery_type ?? "—"} icon={<LocalShipping fontSize="inherit" />} />
              </Box>

              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", my: 2.5 }} />

              <SectionLabel icon={<Person />}>Buyer Information</SectionLabel>
              {!buyer ? (
                <Typography sx={{ color: "#64748B", fontSize: 13 }}>Buyer information not available.</Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                    <Avatar sx={{ width: 44, height: 44, bgcolor: "#3B82F6", fontWeight: 700, fontSize: 16 }}>
                      {initials}
                    </Avatar>
                    <Box>
                      <Typography sx={{ color: "#F8FAFC", fontWeight: 600, fontSize: 14 }}>
                        {fullName || "—"}
                      </Typography>
                      <Chip
                        size="small"
                        icon={buyer.is_active ? <CheckCircle sx={{ fontSize: "12px !important" }} /> : <Cancel sx={{ fontSize: "12px !important" }} />}
                        label={buyer.is_active ? "Active" : "Inactive"}
                        sx={{
                          mt: 0.5,
                          bgcolor: buyer.is_active ? "rgba(16,185,129,0.12)" : "rgba(100,116,139,0.12)",
                          color: buyer.is_active ? "#34D399" : "#64748B",
                          fontWeight: 600, fontSize: 10,
                          "& .MuiChip-icon": { color: "inherit" },
                        }}
                      />
                    </Box>
                  </Box>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", my: 1 }} />
                  <Field label="Email" value={buyer.email} icon={<Email fontSize="inherit" />} />
                  <Field label="Phone" value={buyer.phone_number ?? "—"} icon={<Phone fontSize="inherit" />} />
                  <Field label="User ID" value={
                    <Typography sx={{ fontFamily: "monospace", fontSize: 11, color: "#F1F5F9" }}>
                      {buyer.user_id}
                    </Typography>
                  } icon={<Fingerprint fontSize="inherit" />} />
                  <Field label="Member Since" value={formatDate(buyer.created_at)} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Top Right: Product & Amount ── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <SectionLabel icon={<ShoppingBag />}>Product Information</SectionLabel>
              {!order.product ? (
                <Typography sx={{ color: "#64748B", fontSize: 13 }}>Product information not available.</Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mb: 3 }}>
                  <Field label="Product Name" value={order.product.name} />
                  <Field label="Product ID" value={
                    <Typography sx={{ fontFamily: "monospace", fontSize: 11, color: "#F1F5F9" }}>
                      {order.product.id}
                    </Typography>
                  } />
                  <Field label="Product Price" value={
                    order.product.price != null ? `₹${order.product.price.toFixed(2)}` : "—"
                  } />
                  <Field label="Product Description" value={
                    order.product.description ? (
                      <Typography sx={{ color: "#F1F5F9", fontSize: 13, maxHeight: 120, overflow: "auto" }}>
                        {order.product.description}
                      </Typography>
                    ) : "—"
                  } />
                </Box>
              )}

              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", my: 2.5 }} />

              <SectionLabel icon={<CreditCard />}>Order Amount</SectionLabel>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
                  <Typography sx={{ color: "#64748B", fontSize: 13, fontWeight: 600 }}>Product Price:</Typography>
                  <Typography sx={{ color: "#F1F5F9", fontSize: 14, fontWeight: 600 }}>
                    ₹{(order.product?.price ?? 0).toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
                  <Typography sx={{ color: "#64748B", fontSize: 13, fontWeight: 600 }}>Delivery Price:</Typography>
                  <Typography sx={{ color: "#F1F5F9", fontSize: 14, fontWeight: 600 }}>
                    ₹{(order.delivery_price ?? 0).toFixed(2)}
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1 }}>
                  <Typography sx={{ color: "#7C3AED", fontSize: 14, fontWeight: 700 }}>Total Amount:</Typography>
                  <Typography sx={{ color: "#34D399", fontSize: 18, fontWeight: 700 }}>₹{total}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Bottom: Shipping Information ── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <SectionLabel icon={<LocationOn />}>Shipping Information</SectionLabel>
              <ShippingAddressDisplay address={order.shipping_address} />
            </CardContent>
          </Card>
        </Grid>

        {/* ── Bottom Right: Additional Details ── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <SectionLabel icon={<CreditCard />}>Order Details</SectionLabel>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Field label="Buyer ID" value={
                  <Typography sx={{ fontFamily: "monospace", fontSize: 11, color: "#F1F5F9" }}>
                    {order.buyer_id}
                  </Typography>
                } />
                <Field label="Seller ID" value={
                  <Typography sx={{ fontFamily: "monospace", fontSize: 11, color: "#F1F5F9" }}>
                    {order.seller_id}
                  </Typography>
                } />
                <Field label="Product ID" value={
                  <Typography sx={{ fontFamily: "monospace", fontSize: 11, color: "#F1F5F9" }}>
                    {order.product_id}
                  </Typography>
                } />
                {buyer && (
                  <Button
                    fullWidth
                    variant="outlined"
                    endIcon={<OpenInNew fontSize="small" />}
                    onClick={() => navigate(`/admin/users/${buyer.user_id}`)}
                    sx={{
                      borderColor: "rgba(124,58,237,0.4)",
                      color: "#A78BFA",
                      textTransform: "none",
                      fontWeight: 600,
                      mt: 1,
                      "&:hover": { borderColor: "#7C3AED", bgcolor: "rgba(124,58,237,0.08)" },
                    }}
                  >
                    View Buyer Profile
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderDetailPage;
