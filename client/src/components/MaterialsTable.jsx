import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, useCallback } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Skeleton,
} from "@mui/material";

import { getAllMaterials } from "../services/material-service";
import Pagination from "./Pagination";

import "./styles/navbar.css";
import "./styles/Home.css";

const headerStyle = {
  backgroundColor: "#424242",
  color: "white",
  fontWeight: "bold",
};

const MaterialsTable = () => {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  // Fetch materials from API
  const fetchMaterials = useCallback(({ page, limit }) => {
    setLoading(true);
    return getAllMaterials({ page, limit })
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
    fetchMaterials({ page: currentPage, limit });
  }, [currentPage]);

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / limit);

  const onRowClick = (id) => navigate(`/material/${id}`);

  return (
    <>
      <Typography variant="h4" sx={{ mt: 3, mb: 3 }}>
        Materials List
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={headerStyle}>Name</TableCell>
            <TableCell sx={headerStyle}>Category</TableCell>
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
                <TableRow
                  key={material?._id}
                  onClick={() => onRowClick(material?.matGUID)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{material?.["Material Name"]}</TableCell>
                  <TableCell>{material?.Categories?.join(", ")}</TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
        isLoading={isLoading}
      />
    </>
  );
};

export default MaterialsTable;
