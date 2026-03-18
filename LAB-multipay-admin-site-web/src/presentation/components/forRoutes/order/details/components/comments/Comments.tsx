import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";

const comments = [
  {
    id: 1,
    name: "Você",
    message:
      "Lorem ipsum dolor sit amet consectetur. Turpis mus cras massa interdum malesuada dui bibendum nulla etiam. Pretium sagittis tristique varius nam tempus cras libero duis. Faucibus est neque vulputate ac cras sed. Metus amet consectetur ut pulvinar purus aliquet vitae.",
    date: "06/08/2024 - 16:55",
    isUser: true,
  },
  {
    id: 2,
    name: "Laura Rodrigues dos Santos",
    message:
      "Lorem ipsum dolor sit amet consectetur. Turpis mus cras massa interdum malesuada dui bibendum nulla etiam. Pretium sagittis tristique varius nam tempus cras libero duis. Faucibus est neque vulputate ac cras sed. Metus amet consectetur ut pulvinar purus aliquet vitae.",
    date: "05/08/2024 - 14:21",
    isUser: false,
  },
];

export default function CommentsSection() {
  return (
    <Box
      sx={{
        maxWidth: "100vw",
        mx: "auto",
        p: 2,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: "none",
      }}
    >
      {comments.map((comment) => (
        <Paper
          key={comment.id}
          sx={{
            p: 2,
            mb: 1,
            bgcolor: comment.isUser ? "#F6F6F6" : "#E7E7E7",
            color: "#5D5D5D",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            {comment.name}
          </Typography>

          <Typography variant="body2" sx={{ mt: 1 }}>
            {comment.message}
          </Typography>

          <Typography
            variant="caption"
            sx={{ display: "block", mt: 1, textAlign: "right" }}
          >
            {comment.date}
          </Typography>
        </Paper>
      ))}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mt: 2,
          p: 1,
          borderTop: "1px solid #ddd",
        }}
      >
        <IconButton
          component="label"
          sx={{ background: "#0050D7", color: "#fff" }}
        >
          <AttachFileIcon />
          <input type="file" hidden />
        </IconButton>

        <TextField
          fullWidth
          placeholder="Insira aqui a sua mensagem..."
          variant="outlined"
          size="medium"
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="contained"
          color="success"
          sx={{ background: "#14C850" }}
        >
          Enviar
        </Button>
      </Box>
    </Box>
  );
}
