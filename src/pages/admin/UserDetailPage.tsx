import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, Avatar, Chip, Button,
  Skeleton, Divider, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tooltip, IconButton, TablePagination,
} from "@mui/material";
import {
  ArrowBack, Email, Phone, Person, CalendarToday, Badge,
  LocationOn, AccountCircle, Info, Home, Fingerprint, AccessTime, Visibility,
  ShoppingBag,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/lib/api/usersApi";
import { getOrdersByUser } from "@/lib/api/ordersApi";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/dateUtils";

const roleSx = (role: string) => ({
  bgcolor:
    role === "vendor"    ? "rgba(245,158,11,0.15)"  :
    role === "moderator" ? "rgba(16,185,129,0.15)"  :
                           "rgba(59,130,246,0.15)",
  color:
    role === "vendor"    ? "#FBBF24" :
    role === "moderator" ? "#34D399" :
                           "#60A5FA",
  fontWeight: 700,
  fontSize: 13,
  textTransform: "capitalize" as const,
  px: 1.5,
});

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography sx={{
    color: "#7C3AED", fontWeight: 700, fontSize: 11,
    letterSpacing: 1, textTransform: "uppercase", mb: 2, mt: 1,
  }}>
    {children}
  </Typography>
);

const Field: React.FC<{ icon?: React.ReactNode; label: string; value: React.ReactNode; wide?: boolean }> = ({
  icon, label, value, wide,
}) => {
  const isSimple = !value || typeof value === "string" || typeof value === "number";
  return (
    <Box sx={{ gridColumn: wide ? "1 / -1" : undefined }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.4 }}>
        {icon && <Box sx={{ color: "#7C3AED", display: "flex", fontSize: 15 }}>{icon}</Box>}
        <Typography sx={{ color: "#64748B", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>
          {label}
        </Typography>
      </Box>
      {isSimple ? (
        <Typography sx={{ color: value ? "#F1F5F9" : "#334155", fontSize: 14, pl: icon ? 2.75 : 0, wordBreak: "break-word" }}>
          {value || "—"}
        </Typography>
      ) : (
        <Box sx={{ fontSize: 14, color: "#F1F5F9", pl: icon ? 2.75 : 0 }}>{value}</Box>
      )}
    </Box>
  );
};

const ADDRESS_LABELS: Record<string, string> = {
  address:      "Address",
  town_city:    "Town / City",
  postcode:     "Postcode",
  email:        "Email",
  phone_number: "Phone",
};
const ADDRESS_ORDER = ["address", "town_city", "postcode", "email", "phone_number"];

const formatAddress = (addr: unknown): React.ReactNode => {
  if (!addr) return "";
  if (typeof addr === "string") return addr;
  if (typeof addr === "object") {
    const obj = addr as Record<string, unknown>;
    const keys = ADDRESS_ORDER.filter(k => obj[k]);
    if (!keys.length) return "";
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {keys.map(k => (
          <Box key={k} sx={{ display: "flex", gap: 0.75 }}>
            <Typography sx={{ color: "#64748B", fontSize: 12, minWidth: 80 }}>
              {ADDRESS_LABELS[k]}:
            </Typography>
            <Typography sx={{ color: "#F1F5F9", fontSize: 13 }}>{String(obj[k])}</Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return String(addr);
};

const STATUS_COLOR: Record<string, string> = {
  pending:    "#FBBF24",
  processing: "#60A5FA",
  shipped:    "#A78BFA",
  completed:  "#34D399",
  cancelled:  "#EF4444",
};

const ROWS_PER_PAGE = 10;

const BuyerOrdersTable: React.FC<{ buyerId: string }> = ({ buyerId }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const { data: ordersData, isLoading, isError } = useQuery({
    queryKey: ["buyer-orders", buyerId],
    queryFn: () => getOrdersByUser(buyerId, 1, 1000), // Get all orders for the user
    enabled: !!buyerId,
  });

  const orders = ordersData?.orders?.map((o: any) => ({
    id: o.id,
    status: o.status,
    created_at: o.created_at,
    delivery_price: o.delivery_price ?? 0,
    delivery_type: o.delivery_type,
    product_title: o.product?.name ?? "—",
    product_price: o.product?.price ?? 0,
    total: (o.product?.price ?? 0) + (o.delivery_price ?? 0),
  })) ?? [];

  const paginated = orders.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE);
  const COLS = 7;

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, mt: 1 }}>
        <ShoppingBag sx={{ color: "#7C3AED", fontSize: 16 }} />
        <Typography sx={{ color: "#7C3AED", fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>
          Buyer Orders
        </Typography>
        {!isLoading && !isError && (
          <Chip
            label={orders.length}
            size="small"
            sx={{ bgcolor: "rgba(124,58,237,0.15)", color: "#A78BFA", fontWeight: 700, fontSize: 11, height: 20 }}
          />
        )}
      </Box>

      <TableContainer sx={{ mb: 0.5, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "rgba(255,255,255,0.03)" }}>
              {["Order ID", "Order Date", "Product", "Total Amount", "Order Status", "Products Count", "Action"].map((h) => (
                <TableCell key={h} sx={{ color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, py: 1.5 }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: COLS }).map((_, j) => (
                    <TableCell key={j}><Skeleton variant="text" width="80%" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={COLS} sx={{ textAlign: "center", py: 4, color: "#EF4444" }}>
                  Failed to load orders. Please try again.
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLS} sx={{ textAlign: "center", py: 5, color: "#64748B" }}>
                  This user has not placed any orders yet.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((order) => (
                <TableRow key={order.id} sx={{ "&:hover": { bgcolor: "rgba(148,163,184,0.04)" } }}>
                  <TableCell sx={{ color: "#94A3B8", fontSize: 11, fontFamily: "monospace", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {order.id}
                  </TableCell>
                  <TableCell sx={{ color: "#94A3B8", fontSize: 13, whiteSpace: "nowrap" }}>
                    {formatDate(order.created_at)}
                  </TableCell>
                  <TableCell sx={{ color: "#F1F5F9", fontSize: 13, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {order.product_title}
                  </TableCell>
                  <TableCell sx={{ color: "#34D399", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
                    ${order.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      size="small"
                      sx={{
                        bgcolor: `${STATUS_COLOR[order.status] ?? "#94A3B8"}22`,
                        color: STATUS_COLOR[order.status] ?? "#94A3B8",
                        fontWeight: 600, fontSize: 11, textTransform: "capitalize",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: "#94A3B8", fontSize: 13, textAlign: "center" }}>1</TableCell>
                  <TableCell>
                    <Tooltip title="View Order">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        sx={{ color: "#60A5FA", "&:hover": { bgcolor: "rgba(96,165,250,0.1)" } }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {orders.length > ROWS_PER_PAGE && (
        <TablePagination
          component="div"
          count={orders.length}
          page={page}
          rowsPerPage={ROWS_PER_PAGE}
          rowsPerPageOptions={[ROWS_PER_PAGE]}
          onPageChange={(_, p) => setPage(p)}
          sx={{
            color: "#64748B",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": { color: "#64748B", fontSize: 13 },
            ".MuiIconButton-root": { color: "#64748B" },
            ".MuiIconButton-root.Mui-disabled": { color: "rgba(100,116,139,0.3)" },
          }}
        />
      )}
    </>
  );
};

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id!),
    enabled: !!id,
  });

  const backBtn = (
    <Button
      startIcon={<ArrowBack />}
      onClick={() => navigate("/admin/users")}
      sx={{ color: "#94A3B8", pl: 0, mb: 2, "&:hover": { color: "#F1F5F9", bgcolor: "transparent" } }}
    >
      Back to Users
    </Button>
  );

  if (isLoading) {
    return (
      <Box>
        {backBtn}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Skeleton variant="circular" width={88} height={88} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="45%" height={34} />
                <Skeleton variant="text" width="25%" height={24} sx={{ mt: 0.5 }} />
              </Box>
            </Box>
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} variant="text" height={44} sx={{ mb: 0.5 }} />
            ))}
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (isError || !user) {
    return (
      <Box>
        {backBtn}
        <Card>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography sx={{ color: "#EF4444", mb: 2 }}>Failed to load user details.</Typography>
            <Button variant="outlined" onClick={() => navigate("/admin/users")}>Return to Users List</Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
  const initials = `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <Box>
      {backBtn}

      {/* Page header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "#F8FAFC", fontWeight: 700 }}>User Details</Typography>
          <Typography variant="body2" sx={{ color: "#475569", mt: 0.25 }}>Profile ID: {user.id}</Typography>
        </Box>
        <Chip
          label={user.is_active ? "Active" : "Inactive"}
          sx={{
            bgcolor: user.is_active ? "rgba(16,185,129,0.12)" : "rgba(100,116,139,0.12)",
            color: user.is_active ? "#34D399" : "#64748B",
            fontWeight: 700, fontSize: 13, px: 1,
          }}
        />
      </Box>

      <Grid container spacing={3}>

        {/* ── Left column: avatar card ── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 2 }}>

              {/* Avatar */}
              <Avatar
                src={user.profile_image ?? undefined}
                sx={{ width: 96, height: 96, bgcolor: "#3B82F6", fontSize: 30, fontWeight: 700 }}
              >
                {initials || <Person />}
              </Avatar>

              {/* Name + username */}
              <Box>
                <Typography variant="h6" sx={{ color: "#F8FAFC", fontWeight: 700, lineHeight: 1.3 }}>
                  {fullName || "—"}
                </Typography>
                <Typography sx={{ color: "#64748B", fontSize: 13, mt: 0.25 }}>
                  {user.username ? `@${user.username}` : "No username"}
                </Typography>
              </Box>

              {/* Role chip */}
              <Chip label={user.role ?? "user"} sx={roleSx(user.role ?? "user")} />

              <Divider sx={{ width: "100%", borderColor: "rgba(255,255,255,0.06)" }} />

              {/* Quick stats */}
              <Box sx={{ width: "100%", textAlign: "left", display: "flex", flexDirection: "column", gap: 1.25 }}>
                <SectionLabel>Account</SectionLabel>

                {[
                  { label: "Status",   value: user.is_active ? "Active" : "Inactive", color: user.is_active ? "#34D399" : "#64748B" },
                  { label: "Role",     value: user.role ?? "user" },
                  { label: "Joined",   value: formatDate(user.created_at) },
                  { label: "Updated",  value: formatDate(user.updated_at) },
                ].map(({ label, value, color }) => (
                  <Box key={label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ color: "#64748B", fontSize: 13 }}>{label}</Typography>
                    <Typography sx={{ color: color ?? "#F1F5F9", fontSize: 13, fontWeight: 500, textTransform: "capitalize" }}>
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Profile image URL if present */}
              {user.profile_image && (
                <>
                  <Divider sx={{ width: "100%", borderColor: "rgba(255,255,255,0.06)" }} />
                  <Box
                    component="img"
                    src={user.profile_image}
                    alt="Profile"
                    onError={(e: any) => { e.currentTarget.style.display = "none"; }}
                    sx={{ width: "100%", borderRadius: 2, objectFit: "cover", maxHeight: 180 }}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Right column: all fields ── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>

              {/* Personal Information */}
              <SectionLabel>Personal Information</SectionLabel>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5, mb: 3 }}>
                <Field icon={<Person fontSize="inherit" />}        label="First Name"    value={user.first_name} />
                <Field icon={<Person fontSize="inherit" />}        label="Last Name"     value={user.last_name} />
                <Field icon={<AccountCircle fontSize="inherit" />} label="Full Name"     value={fullName} />
                <Field icon={<Badge fontSize="inherit" />}         label="Username"      value={user.username} />
                <Field icon={<Email fontSize="inherit" />}         label="Email"         value={user.email} />
                <Field icon={<Phone fontSize="inherit" />}         label="Phone Number"  value={user.phone_number} />
                <Field icon={<Info fontSize="inherit" />}          label="Gender"        value={user.gender} />
                <Field icon={<CalendarToday fontSize="inherit" />} label="Date of Birth" value={user.date_of_birth} />
                <Field icon={<LocationOn fontSize="inherit" />}    label="Country Code"  value={user.country_code} />
                <Field icon={<Fingerprint fontSize="inherit" />}   label="User ID (Auth)" value={user.user_id} />
              </Box>

              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 3 }} />

              {/* Account Details */}
              <SectionLabel>Account Details</SectionLabel>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5, mb: 3 }}>
                <Field icon={<Badge fontSize="inherit" />}        label="Role"      value={user.role} />
                <Field icon={<Info fontSize="inherit" />}         label="Status"    value={user.is_active ? "Active" : "Inactive"} />
                <Field icon={<AccessTime fontSize="inherit" />}   label="Created"   value={formatDate(user.created_at)} />
                <Field icon={<AccessTime fontSize="inherit" />}   label="Updated"   value={formatDate(user.updated_at)} />
              </Box>

              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 3 }} />

              {/* Addresses */}
              <SectionLabel>Addresses</SectionLabel>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5, mb: 3 }}>
                <Field
                  icon={<Home fontSize="inherit" />}
                  label="Delivery Address"
                  value={formatAddress(user.delivery_address)}
                />
                <Field
                  icon={<Home fontSize="inherit" />}
                  label="Collection Address"
                  value={formatAddress(user.collection_address)}
                />
              </Box>

              {/* Buyer Orders Section */}
              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 3 }} />
              <BuyerOrdersTable buyerId={user.user_id} />

              {/* About / Description */}
              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 3 }} />
              <SectionLabel>About</SectionLabel>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2.5 }}>
                <Field
                  icon={<Info fontSize="inherit" />}
                  label="User Description"
                  value={user.user_description}
                  wide
                />
                <Field
                  icon={<Fingerprint fontSize="inherit" />}
                  label="FCM Token"
                  value={user.fcm_token}
                  wide
                />
              </Box>

            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDetailPage;
