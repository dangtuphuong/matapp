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
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [propsCol, setPropsCol] = useState(null);
  const [openChart, setOpenChart] = useState(false);

  // Fetch materials from API
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

  // Handle page change
  const handlePageChange = (newPage) => {
    if (!isLoading) {
      setCurrentPage(newPage);
    }
  };

  // Load data on component mount and page change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchMaterials({
        page: currentPage,
        limit,
        searchTerm,
        searchCategories,
        searchProperties,
      });
    }, 300);

    return () => {
      clearTimeout(delayDebounce);
    };
  }, [currentPage, searchTerm, limit, searchCategories, searchProperties]);

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / limit);

  const onRowClick = (id) => navigate(`/material/${id}`);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <>
      {/* Material Name */}
      <Box sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
        <TextField
          size="small"
          label="Search by Material Name"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {/* Bubble Chart Button */}
        <Box sx={{ h: 40, w: 40 }}>
          <Tooltip title="Visualize data in Bubble Chart">
            <IconButton
              sx={{ "&:hover": { color: "primary.main" } }}
              size="small"
              onClick={() => setOpenChart(true)}
              disabled={materials.length === 0}
            >
              <BubbleChartIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Box sx={{ overflowX: "auto", width: "100%" }}>
        <Table
          sx={{ border: "1px solid #ccc", tableLayout: "fixed", width: "100%" }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headerStyle, flex: 1 }}>Name</TableCell>
              <TableCell sx={{ ...headerStyle, width: "30%" }}>
                Category
              </TableCell>
              {!!propsCol?.length && (
                <TableCell sx={{ ...headerStyle, width: "20%" }}>
                  Filtered Props
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: limit }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton variant="text" width="100%" />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width="60%" />
                  </TableCell>
                </TableRow>
              ))
            ) : materials?.length > 0 ? (
              materials?.map((material) => (
                <TableRow
                  key={material?._id}
                  onClick={() => onRowClick(material?.matGUID)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell
                    sx={{
                      flex: 1,
                      maxWidth: "10px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "normal",
                    }}
                  >
                    {material?.["Material Name"]}
                  </TableCell>

                  <TableCell
                    sx={{
                      width: "30%",
                      maxWidth: "150px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "normal",
                    }}
                  >
                    {material?.Categories?.join(", ")}
                  </TableCell>

                  {!!propsCol?.length && (
                    <TableCell sx={{ width: "20%" }}>
                      {propsCol?.map(({ group, property, unit }) => {
                        const items =
                          material?.["Properties"]?.[group]?.[property];
                        const item = items?.[items.length - 1] || {};
                        return (
                          <p key={property}>
                            {`${property}: ${
                              item?.English
                                ? item?.English?.includes(unit)
                                  ? item?.English
                                  : item.Metric
                                : item
                            }`}
                          </p>
                        );
                      })}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell>No results found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {totalPages > 0 && (
        <Pagination
          limit={limit}
          handleLimitChange={setLimit}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          isLoading={isLoading}
        />
      )}

      {/* Bubble Chart Modal */}
      <Modal open={openChart} onClose={() => setOpenChart(false)}>
        <Paper sx={modalStyle}>
          {/* Close Button */}
          <IconButton
            sx={{ position: "absolute", top: 10, right: 10 }}
            onClick={() => setOpenChart(false)}
            size="small"
          >
            <CloseIcon />
          </IconButton>

          {/* Chart Container */}

          <Box
            sx={{
              width: "100%",
              height: "100%",
              overflow: "hidden",
              padding: "10px",
            }}
          >
            <BubbleChart
              materials={materials}
              currentPage={currentPage}
              onClose={() => setOpenChart(false)}
            />
          </Box>
        </Paper>
      </Modal>
    </>
  );
};

export default MaterialsTable;
