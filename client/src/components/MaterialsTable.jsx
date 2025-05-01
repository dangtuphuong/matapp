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
} from "@mui/material";

import { getAllMaterials } from "../services/material-service";
import Pagination from "./Pagination";

const headerStyle = {
  backgroundColor: "#424242",
  color: "white",
  fontWeight: "bold",
};

const MaterialsTable = ({ searchCategories, searchProperties }) => {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch materials from API
  const fetchMaterials = useCallback((params) => {
    setLoading(true);
    return getAllMaterials(params)
      .then((data) => {
        setMaterials(data.materials);
        setTotalCount(data.total_count);
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
      <Box sx={{ mb: 1.5 }}>
        <TextField
          size="small"
          label="Search Material Name"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </Box>
      <Table sx={{ border: "1px solid #ccc" }}>
        <TableHead>
          <TableRow>
            <TableCell sx={headerStyle}>Name</TableCell>
            <TableCell sx={headerStyle}>Category</TableCell>
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
                <TableCell>{material?.["Material Name"]}</TableCell>
                <TableCell>{material?.Categories?.join(", ")}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell>No data available</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

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
    </>
  );
};

export default MaterialsTable;
