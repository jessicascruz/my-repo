"use client";

import { useState } from "react";
import { IconButton, Badge, Drawer, Box, Typography } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { AiOutlineClose } from "react-icons/ai";

export default function NotificationDrawer() {
  const [open, setOpen] = useState(false);

  const handleToggleDrawer = () => {
    setOpen((prev) => !prev);
  };

  const notifications = [
    { id: 1, message: "Pedido #00001 aprovado", date: "25/07/2024" },
    { id: 2, message: "Pedido #00785 rejeitado", date: "22/07/2024" },
  ];

  return (
    <>
      {/* Botão de Notificação */}
      <IconButton color="inherit" onClick={handleToggleDrawer}>
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon sx={{ color: "#0050D7", fontSize: 30 }} />
        </Badge>
      </IconButton>

      {/* Drawer de Notificações */}
      <Drawer anchor="right" open={open} onClose={handleToggleDrawer}>
        <Box sx={{ width: 300, p: 2 }}>
          {/* Cabeçalho */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5">Alertas</Typography>
            <IconButton onClick={handleToggleDrawer}>
              <AiOutlineClose size={20} />
            </IconButton>
          </Box>

          {/* Lista de Notificações */}
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Box
                key={notification.id}
                sx={{
                  p: 2,
                  my: 1,
                  borderRadius: 1,
                  backgroundColor: "#f5f5f5",
                }}
              >
                <Typography variant="body2">{notification.message}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {notification.date}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
              Nenhuma notificação
            </Typography>
          )}
        </Box>
      </Drawer>
    </>
  );
}
