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

const MaterialsTable = ({ searchTerm }) => {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]); // Filtered based on search
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  // Fetch materials from API
  const fetchMaterials = useCallback(({ page, limit, searchTerm }) => {
    setLoading(true);
    return getAllMaterials({ page, limit, searchTerm }) // Make sure to pass searchTerm to the API call
      .then((data) => {
        setMaterials(data.materials); // Set all materials at once
        setFilteredMaterials(data.materials); // Set the filtered materials
        setTotalCount(data.total_count); // Set the total count (you can adjust this based on how you want to count)
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
    fetchMaterials({ page: currentPage, limit, searchTerm });
  }, [currentPage, searchTerm]);

  // Update filteredMaterials whenever materials or searchTerm changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = materials.filter((material) =>
        material["Material Name"]
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setFilteredMaterials(filtered); // Set filtered materials
    } else {
      setFilteredMaterials(materials); // If no searchTerm, show all materials
    }
  }, [searchTerm, materials]);

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / limit);

  const onRowClick = (id) => navigate(`/material/${id}`);

  return (
    <>
      <Table>
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
          ) : filteredMaterials?.length > 0 ? (
            filteredMaterials?.map((material) => (
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
