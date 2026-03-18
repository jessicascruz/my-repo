"use client";

import { Box, Container, Typography, useMediaQuery } from "@mui/material";

const Footer = () => {
  const isMobile = useMediaQuery("(max-width:600px)");

  if (isMobile) return null;

  return (
    <Box
      component="footer"
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        backgroundColor: "#fff",
        py: 2,
        borderTop: "1px solid #E7E7E7",
        textAlign: "center",
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="textSecondary">
          ® 1987-2024 GRUPO MULTI - Todos os direitos reservados | Versão do
          sistema: 1.1.1
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
