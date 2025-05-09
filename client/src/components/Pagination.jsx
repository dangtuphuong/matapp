import { useEffect, useState } from "react";
import {
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

const Pagination = ({
  limit,
  handleLimitChange,
  currentPage,
  totalPages,
  handlePageChange,
  isLoading,
}) => {
  const [inputPage, setInputPage] = useState(currentPage);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // md = 900px

  const handleInputChange = (e) => {
    setInputPage(e.target.value);
  };

  const handleInputSubmit = (e) => {
    if (e.key === "Enter") {
      const page = Number(inputPage);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        handlePageChange(page);
      }
    }
  };

  useEffect(() => setInputPage(currentPage), [currentPage]);

  const containerStyle = {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    alignItems: isMobile ? "stretch" : "center",
    justifyContent: "space-between",
    gap: isMobile ? "10px" : "0px",
    margin: "10px 0",
  };

  const navStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: isMobile ? "center" : "space-between",
    flexWrap: isMobile ? "wrap" : "nowrap",
    gap: isMobile ? "5px" : "10px",
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          style={{
            marginRight: "10px",
            fontSize: isMobile ? "0.9rem" : "1rem",
          }}
        >
          Rows per page:
        </span>
        <Select
          size="small"
          value={limit ?? 10}
          onChange={(event) => handleLimitChange(event?.target?.value ?? 10)}
          sx={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
        >
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
        </Select>
      </div>

      <div style={navStyle}>
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          size={isMobile ? "small" : "medium"}
        >
          Prev
        </Button>

        <TextField
          value={inputPage}
          onChange={handleInputChange}
          onKeyDown={handleInputSubmit}
          size="small"
          type="number"
          sx={{
            width: isMobile ? 60 : 80,
            fontSize: isMobile ? "0.8rem" : "1rem",
            mx: 1,
          }}
          disabled={isLoading}
          inputProps={{ min: 1, max: totalPages }}
        />

        <Typography
          variant="body2"
          sx={{ fontSize: isMobile ? "0.8rem" : "1rem", mr: 1 }}
        >
          of {totalPages}
        </Typography>

        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          size={isMobile ? "small" : "medium"}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
