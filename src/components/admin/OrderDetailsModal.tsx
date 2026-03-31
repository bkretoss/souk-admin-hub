import React from "react";
import {
  Dialog, DialogTitle, DialogContent, IconButton,
  Typography, Box, Chip, CircularProgress,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "@/lib/api/ordersApi";
import { formatDate } from "@/lib/dateUtils";

const statusColor: Record<string, "warning" | "info" | "primary" | "success" | "error"> = {
  pending: "warning", processing: "info", shipped: "primary", completed: "success", cancelled: "error",
};

interface Props {
  orderId: string | null;
  onClose: () => void;
}

const InfoField: React.FC<{ label: string; value: React.ReactNode; green?: boolean }> = ({ label, value, green }) => (
  <Box>
    <Typography variant="caption" sx={{ color: "#64748B" }}>{label}</Typography>
    <Typography sx={{ color: green ? "#34D399" : "#F1F5F9", fontSize: 13, fontWeight: green ? 700 : 400, wordBreak: "break-all" }}>
      {value ?? "—"}
    </Typography>
  </Box>
);

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography variant="caption" sx={{ color: "#7C3AED", fontWeight: 700, letterSpacing: 1 }}>
    {children}
  </Typography>
);

const OrderDetailsModal: React.FC<Props> = ({ orderId, onClose }) => {
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrderById(orderId!),
    enabled: !!orderId,
  });

  return (
    <Dialog open={!!orderId} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        Order Details
        <IconButton size="small" onClick={onClose}><Close /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={32} sx={{ color: "#7C3AED" }} />
          </Box>
        ) : order ? (
          <>
            {/* Order Info */}
            <SectionLabel>ORDER INFO</SectionLabel>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mt: 1, mb: 3 }}>
              <InfoField label="Order ID" value={<span style={{ fontFamily: "monospace", fontSize: 12 }}>{order.id}</span>} />
              <InfoField label="Order Date" value={formatDate(order.created_at)} />
              <Box>
                <Typography variant="caption" sx={{ color: "#64748B" }}>Status</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : "—"}
                    size="small"
                    color={statusColor[order.status] ?? "default"}
                  />
                </Box>
              </Box>
              <InfoField label="Delivery Type" value={order.delivery_type} />
            </Box>

            {/* Product Info */}
            <SectionLabel>PRODUCT INFO</SectionLabel>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mt: 1, mb: 3 }}>
              <InfoField label="Product Name" value={order.product?.name} />
              <InfoField label="Price per Item" value={order.product?.price != null ? `$${order.product.price}` : "—"} />
              <InfoField label="Delivery Price" value={order.delivery_price != null ? `$${order.delivery_price}` : "—"} />
              <InfoField
                label="Total Amount"
                value={`$${((order.product?.price ?? 0) + (order.delivery_price ?? 0)).toFixed(2)}`}
                green
              />
            </Box>

            {/* User Info */}
            {/* <SectionLabel>USER INFO</SectionLabel>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mt: 1 }}>
              <InfoField
                label="User Name"
                value={order.user ? `${order.user.first_name ?? ""} ${order.user.last_name ?? ""}`.trim() || "—" : "—"}
              />
              <InfoField label="User Email" value={order.user?.email} />
            </Box> */}
          </>
        ) : (
          <Typography sx={{ color: "#EF4444", textAlign: "center", py: 4 }}>
            Failed to load order details.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
