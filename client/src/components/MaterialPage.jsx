import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Typography,
  ListItem,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  Card,
} from "@mui/material";
import CategoryIcon from "@mui/icons-material/Category";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import EditNoteIcon from "@mui/icons-material/EditNote";
import KeyIcon from "@mui/icons-material/Key";

import { getMaterialByMatGUID } from "../services/material-service";

import NavbarPrivate from "./NavbarPrivate";

const headerStyle = {
  backgroundColor: "#424242",
  color: "white",
  fontWeight: "bold",
};

const itemWrapperStyle = {
  display: "flex",
  flexDirection: "row",
  padding: "5px 0",
};

const itemStyle = {
  fontWeight: 600,
  marginRight: "10px",
  minWidth: "150px",
};

const iconStyle = {
  fontSize: 20,
  color: "#505050",
  marginRight: "5px",
};

const MaterialPage = () => {
  const { matGUID } = useParams();
  const [material, setMaterial] = useState(null);

  useEffect(() => {
    getMaterialByMatGUID(matGUID)
      .then((data) => setMaterial(data))
      .catch((err) => console.error(err));
  }, [matGUID]);

  return (
    <div>
      <NavbarPrivate />
      <Container className="mat-container">
        <Typography align="center" variant="h4" sx={{ mt: 3, mb: 3 }}>
          {material?.["Material Name"]}
        </Typography>
        <Card
          sx={{
            mb: 2,
            boxShadow: "none",
            border: "1px solid #ccc",
            padding: "10px",
          }}
        >
          <div style={itemWrapperStyle}>
            <span style={itemStyle}>
              <CategoryIcon sx={iconStyle} />
              Categories
            </span>
            {material?.["Categories"]?.join(", ")}
          </div>
          {material?.["Key Words"] && (
            <div style={itemWrapperStyle}>
              <span style={itemStyle}>
                <KeyIcon sx={iconStyle} />
                Key Words
              </span>
              {material?.["Key Words"]}
            </div>
          )}
          {material?.["Material Notes"] && (
            <div style={itemWrapperStyle}>
              <span style={itemStyle}>
                <EditNoteIcon sx={iconStyle} />
                Material Notes
              </span>
              {material?.["Material Notes"]}
            </div>
          )}
          <div style={itemWrapperStyle}>
            <span style={itemStyle}>
              <PrecisionManufacturingIcon sx={iconStyle} />
              Vendors
            </span>
            {material?.["Vendors"] || "No vendors are listed for this material"}
          </div>
        </Card>
        <Typography sx={{ fontWeight: 600, margin: "20px 0" }} variant="h6">
          Properties
        </Typography>
        <TableContainer component={Paper}>
          {Object.entries(material?.["Properties"] ?? {}).map(([key, items]) =>
            key !== "Descriptive Properties" ? (
              <Table sx={{ minWidth: 650 }} aria-label="simple table" key={key}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ ...headerStyle, width: "25%" }}>
                      {key}
                    </TableCell>
                    <TableCell
                      sx={{ ...headerStyle, width: "28%" }}
                      align="right"
                    >
                      Metric
                    </TableCell>
                    <TableCell
                      sx={{ ...headerStyle, width: "28%" }}
                      align="right"
                    >
                      English
                    </TableCell>
                    <TableCell sx={headerStyle} align="right">
                      Comments
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(items).map(([property, values]) =>
                    values.map((value, index) => (
                      <TableRow key={`${property}-${index}`}>
                        {index === 0 && (
                          <TableCell
                            rowSpan={values.length}
                            sx={{ alignContent: "flex-start" }}
                          >
                            {property}
                          </TableCell>
                        )}
                        <TableCell align="right">{value.Metric}</TableCell>
                        <TableCell align="right">{value.English}</TableCell>
                        <TableCell align="right">{value.Comments}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            ) : (
              <Table sx={{ minWidth: 650 }} aria-label="simple table" key={key}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerStyle}>{key}</TableCell>
                    <TableCell sx={headerStyle} align="right">
                      Value
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(items).map(([property, values]) =>
                    values.map((value, index) => (
                      <TableRow key={`${property}-${index}`}>
                        {index === 0 && (
                          <TableCell rowSpan={values.length}>
                            {property}
                          </TableCell>
                        )}
                        <TableCell align="right">{value}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )
          )}
        </TableContainer>
      </Container>
    </div>
  );
};

export default MaterialPage;
