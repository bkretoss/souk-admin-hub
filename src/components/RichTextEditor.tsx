import React, { useState, useMemo } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Box, ToggleButton, ToggleButtonGroup, TextField } from "@mui/material";
import { Code, Visibility } from "@mui/icons-material";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const [mode, setMode] = useState<"visual" | "html">("visual");

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "image"],
        [{ color: [] }, { background: [] }],
        ["blockquote", "code-block"],
        ["clean"],
      ],
    }),
    []
  );

  const formats = [
    "header", "bold", "italic", "underline", "strike",
    "list", "bullet", "align", "link", "image",
    "color", "background", "blockquote", "code-block",
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, v) => v && setMode(v)}
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              color: "#64748B",
              borderColor: "rgba(255,255,255,0.1)",
              "&.Mui-selected": { bgcolor: "#7C3AED", color: "#fff", "&:hover": { bgcolor: "#6D28D9" } },
            },
          }}
        >
          <ToggleButton value="visual">
            <Visibility sx={{ fontSize: 18, mr: 0.5 }} /> Visual
          </ToggleButton>
          <ToggleButton value="html">
            <Code sx={{ fontSize: 18, mr: 0.5 }} /> HTML
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {mode === "visual" ? (
        <Box
          sx={{
            "& .ql-container": {
              bgcolor: "#1E293B",
              color: "#F1F5F9",
              borderColor: "rgba(255,255,255,0.1)",
              borderRadius: "0 0 8px 8px",
              minHeight: 300,
              fontSize: 14,
            },
            "& .ql-toolbar": {
              bgcolor: "#0F172A",
              borderColor: "rgba(255,255,255,0.1)",
              borderRadius: "8px 8px 0 0",
            },
            "& .ql-stroke": { stroke: "#94A3B8" },
            "& .ql-fill": { fill: "#94A3B8" },
            "& .ql-picker-label": { color: "#94A3B8" },
            "& .ql-picker-options": { bgcolor: "#1E293B", borderColor: "rgba(255,255,255,0.1)" },
            "& .ql-editor.ql-blank::before": { color: "#64748B", fontStyle: "italic" },
            "& .ql-editor": { minHeight: 300 },
          }}
        >
          <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder || "Start writing..."}
          />
        </Box>
      ) : (
        <TextField
          fullWidth
          multiline
          rows={16}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="<h2>Your HTML here...</h2>"
          inputProps={{ style: { fontFamily: "monospace", fontSize: 13 } }}
          sx={{
            "& .MuiInputBase-root": {
              bgcolor: "#1E293B",
              color: "#F1F5F9",
              borderRadius: 2,
            },
          }}
        />
      )}
    </Box>
  );
};

export default RichTextEditor;
