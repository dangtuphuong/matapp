import { useEffect, useState } from "react";
import { Button, Typography, TextField } from "@mui/material";

const paginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "end",
  margin: "10px",
};

const Pagination = ({
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
      <Button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
      >
        Previous
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
  );
};

export default Pagination;
