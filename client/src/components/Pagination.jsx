import { useEffect, useState } from "react";
import { Button, Typography, TextField, Select, MenuItem } from "@mui/material";

const paginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  margin: "10px 0",
};

const Pagination = ({
  limit,
  handleLimitChange,
  currentPage,
  totalPages,
  handlePageChange,
  isLoading,
}) => {
  const [inputPage, setInputPage] = useState(currentPage);

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

  return (
    <div style={paginationStyle}>
      <div>
        <span style={{ marginRight: "10px" }}>Rows per page:</span>
        <Select
          size="small"
          value={limit ?? 10}
          onChange={(event) => handleLimitChange(event?.target?.value ?? 10)}
        >
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={50}>20</MenuItem>
          <MenuItem value={100}>50</MenuItem>
        </Select>
      </div>
      <div style={paginationStyle}>
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
        >
          Prev
        </Button>

        <TextField
          value={inputPage}
          onChange={handleInputChange}
          onKeyDown={handleInputSubmit}
          size="small"
          type="number"
          sx={{ width: 80, marginLeft: 2, marginRight: 1 }}
          disabled={isLoading}
          inputProps={{ min: 1, max: totalPages }}
        />

        <Typography variant="body2" sx={{ marginRight: 2 }}>
          of {totalPages}
        </Typography>

        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
