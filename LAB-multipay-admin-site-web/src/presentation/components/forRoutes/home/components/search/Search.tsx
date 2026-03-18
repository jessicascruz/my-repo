import React from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const SearchBox = () => {
  return (
    <TextField
      variant="outlined"
      size="small"
      placeholder="Pesquisar"
      sx={{
        backgroundColor: "white",
        borderRadius: 50,
        border: "1px solid #D1D1D1",
        marginLeft: "auto",
        marginRight: "16px",
        fontSize: 12,
        boxShadow: "none",
        "& .MuiOutlinedInput-root": {
          borderRadius: 50,
          boxShadow: "none",
        },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ fontSize: 16 }} />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchBox;
