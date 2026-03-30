import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Box, CircularProgress, Container, Typography } from "@mui/material";

const CmsPageView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: page, isLoading, isError } = useQuery({
    queryKey: ["cms_page", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_pages")
        .select("*")
        .eq("slug", slug!)
        .eq("status", "published")
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
    retry: false,
  });

  if (isLoading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#0B0B0F" }}>
        <CircularProgress sx={{ color: "#7C3AED" }} />
      </Box>
    );
  }

  if (isError || !page) return <Navigate to="/404" replace />;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0B0B0F", py: 8 }}>
      <Container maxWidth="md">
        <Typography variant="h3" sx={{ color: "#F1F5F9", fontWeight: 700, mb: 4 }}>
          {page.title}
        </Typography>
        <Box
          sx={{
            color: "#94A3B8",
            fontSize: 16,
            lineHeight: 1.8,
            "& h1, & h2, & h3, & h4": { color: "#F1F5F9", mt: 3, mb: 1.5 },
            "& p": { mb: 2 },
            "& a": { color: "#A78BFA", textDecoration: "underline" },
            "& ul, & ol": { pl: 3, mb: 2 },
          }}
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </Container>
    </Box>
  );
};

export default CmsPageView;
