import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Skeleton,
  IconButton,
  Tooltip,
  Modal,
  Paper,
} from "@mui/material";
import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import BubbleChart from "./BubbleChart";
import CloseIcon from "@mui/icons-material/Close";

import { getAllMaterials } from "../services/material-service";
import Pagination from "./Pagination";

const headerStyle = {
  backgroundColor: "#424242",
  color: "white",
  fontWeight: "bold",
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  height: "80%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 2,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const MaterialsTable = ({ searchCategories, searchProperties }) => {
  const [isLoading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [propsCol, setPropsCol] = useState(null);
  const [openChart, setOpenChart] = useState(false); // Modal state

  const fetchMaterials = useCallback((params) => {
    setLoading(true);
    setPropsCol(null);

    return getAllMaterials(params)
      .then((data) => {
        setMaterials(data.materials);
        setTotalCount(data.total_count);
        setPropsCol(
          params?.searchProperties?.filter(
            (p) => !!p?.property && !!p?.group
          ) || []
        );
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMaterials({
      page: currentPage,
      limit,
      searchTerm,
      searchCategories,
      searchProperties,
    });
  }, [currentPage, searchTerm, limit, searchCategories, searchProperties, fetchMaterials]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleOpenChart = () => {
    setOpenChart(true);
  };

  const handleCloseChart = () => {
    setOpenChart(false);
  };

  return (
    <>
      {/* Bubble Chart Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Tooltip title="Visualize data in Bubble Chart">
          <IconButton
            sx={{ "&:hover": { color: "primary.main" } }}
            size="small"
            onClick={handleOpenChart}
            disabled={materials.length === 0}
          >
            <BubbleChartIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Material Name Search */}
      <Box sx={{ mb: 1.5 }}>
        <TextField
          size="small"
          label="Search by Material Name"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      <Box sx={{ overflowX: "auto", width: "100%" }}>
        <Table
          sx={{ border: "1px solid #ccc", tableLayout: "fixed", width: "100%" }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={headerStyle}>Name</TableCell>
              <TableCell sx={headerStyle}>Category</TableCell>
              {!!propsCol?.length && (
                <TableCell sx={headerStyle}>Filtered Props</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: limit }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton variant="text" width="100%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width="60%" />
                    </TableCell>
                  </TableRow>
                ))
              : materials.map((material) => (
                  <TableRow key={material?._id}>
                    <TableCell>{material["Material Name"]}</TableCell>
                    <TableCell>{material.Categories?.join(", ")}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </Box>

      <Pagination
        limit={limit}
        handleLimitChange={setLimit}
        currentPage={currentPage}
        totalPages={Math.ceil(totalCount / limit)}
        handlePageChange={handlePageChange}
        isLoading={isLoading}
      />

      {/* Bubble Chart Modal */}
      <Modal open={openChart} onClose={handleCloseChart}>
        <Paper sx={modalStyle}>
          {/* Close Button */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
            <IconButton onClick={handleCloseChart} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Chart Container */}
          <Box
            sx={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
                padding: "10px",
                boxSizing: "border-box",
              }}
            >
              <BubbleChart materials={materials} currentPage={currentPage} onClose={handleCloseChart} />
            </Box>
          </Box>
        </Paper>
      </Modal>
    </>
  );
};

export default MaterialsTable;
