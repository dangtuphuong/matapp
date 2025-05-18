import React from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
} from "@mui/material";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const headerStyle = {
  fontWeight: "bold",
  backgroundColor: "#f0f0f0",
  fontSize: "16px",
};

function Row({ material, onDelete }) {
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow
        sx={{ backgroundColor: "#FAFAFA" }}
        onClick={() => setOpen(!open)}
      >
        <TableCell component="th" scope="row">
          {material?.["Material Name"]}
        </TableCell>
        <TableCell>{material?.Categories?.join(", ")}</TableCell>
        <TableCell align="right">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
          <IconButton
            aria-label="delete"
            size="small"
            sx={{ marginLeft: "10px" }}
            onClick={() => onDelete(material?.matGUID)}
          >
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ padding: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <TableContainer>
              {Object.entries(material?.["Properties"] ?? {}).map(
                ([key, items]) => (
                  <Table key={key}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={headerStyle}>{key}</TableCell>
                        <TableCell sx={headerStyle} align="right">
                          Metric
                        </TableCell>
                        <TableCell sx={headerStyle} align="right">
                          English
                        </TableCell>
                        <TableCell sx={headerStyle} align="right">
                          Comments
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(items).map(([property, values]) =>
                        values?.map((value, index) => (
                          <TableRow key={`${property}-${index}`}>
                            {index === 0 && (
                              <TableCell rowSpan={values?.length}>
                                {property}
                              </TableCell>
                            )}
                            <TableCell align="right">{value?.Metric}</TableCell>
                            <TableCell align="right">
                              {value?.English}
                            </TableCell>
                            <TableCell align="right">
                              {value?.Comments}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )
              )}
            </TableContainer>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

const tableHeaderStyle = {
  ...headerStyle,
  backgroundColor: "#424242",
  color: "white",
};

function CollapsibleTable({ rows, onDelete }) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ border: "1px solid #ccc" }}>
        <TableHead>
          <TableRow>
            <TableCell sx={tableHeaderStyle}>Material Name</TableCell>
            <TableCell sx={tableHeaderStyle}>Categories</TableCell>
            <TableCell sx={tableHeaderStyle} align="right">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <Row key={row?.matGUID} material={row} onDelete={onDelete} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default CollapsibleTable;
