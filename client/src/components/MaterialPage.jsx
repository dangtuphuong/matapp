
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  Card,
  Skeleton,
  Button,
} from "@mui/material";
import { Bookmark, BookmarkBorder } from "@mui/icons-material";
import CategoryIcon from "@mui/icons-material/Category";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import EditNoteIcon from "@mui/icons-material/EditNote";
import KeyIcon from "@mui/icons-material/Key";

import NavbarPrivate from "./NavbarPrivate";
import { getMaterialByMatGUID } from "../services/material-service";
import { exportElementToPDF } from "../utils/pdfExporter";
import { exportPropertiesToCSV } from "../utils/csvExporter";
import "./styles/MaterialPage.css";

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
  minWidth: "170px",
};

const iconStyle = {
  fontSize: 20,
  color: "#505050",
  marginRight: "10px",
};

const LoadingComponent = () => (
  <Container className="mat-container">
    <Typography align="center" variant="h4" sx={{ mt: 3, mb: 3 }}>
      <Skeleton
        sx={{ borderRadius: 1, width: "80%", display: "inline-block" }}
      />
    </Typography>
    <Card variant="outlined" sx={{ p: "15px 30px" }}>
      <Skeleton sx={{ borderRadius: 1 }} width="50%" height={30} />
      <Skeleton sx={{ borderRadius: 1 }} width="70%" height={30} />
      <Skeleton sx={{ borderRadius: 1 }} height={70} />
    </Card>
  </Container>
);

const MaterialPage = () => {
  const { matGUID } = useParams();
  const [isLoading, setLoading] = useState(false);
  const [material, setMaterial] = useState(null);
  const contentRef = useRef();
  const [isBookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMaterialByMatGUID(matGUID)
      .then((data) => setMaterial(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [matGUID]);

  const handleDownloadPDF = () => {
    if (contentRef.current) {
      exportElementToPDF(
        contentRef.current,
        `${material?.["Material Name"] || "material"}.pdf`
      );
    }
  };

  const handleBookmark = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ matGUID }),
      });
      setBookmarked(true);
    } catch (err) {
      console.error("Failed to bookmark material", err);
    }
  };

  return (
    <div>
      <NavbarPrivate />
      {isLoading ? (
        <LoadingComponent />
      ) : (

        //BOOKMARK BUTTON
        <Container className="mat-container">
          <div style={{ textAlign: "right", marginTop: "10px" }}>
            <Button
              onClick={handleBookmark}
              disabled={isBookmarked}
              sx={{
                backgroundColor: isBookmarked ? "transparent" : "#3d4650",
                color: isBookmarked ? "#023e8a" : "#fff",
                border: "1px solid #023e8a",
                minWidth: 40,
                height: 40,
                borderRadius: "50%",
                "&:hover": {
                  backgroundColor: isBookmarked ? "#e3f2fd" : "#0353a4",
                },
              }}
            >
              {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
            </Button>
          </div>

          <div ref={contentRef}>
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
                {material?.["Vendors"] ||
                  "No vendors are listed for this material"}
              </div>
            </Card>

            <Typography sx={{ fontWeight: 600, margin: "20px 0" }} variant="h6">
              Properties
            </Typography>

            <TableContainer component={Paper}>
              {Object.entries(material?.["Properties"] ?? {}).map(
                ([key, items]) =>
                  key !== "Descriptive Properties" ? (
                    <Table sx={{ minWidth: 650 }} aria-label="table" key={key}>
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
                                <TableCell rowSpan={values.length}>
                                  {property}
                                </TableCell>
                              )}
                              <TableCell align="right">
                                {value.Metric}
                              </TableCell>
                              <TableCell align="right">
                                {value.English}
                              </TableCell>
                              <TableCell align="right">
                                {value.Comments}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  ) : (
                    <Table
                      sx={{ minWidth: 650 }}
                      aria-label="descriptive"
                      key={key}
                    >
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
          </div>

          {/* Download buttons for PDF and CSV */}
          {material && (
            <div style={{ textAlign: "right", marginTop: "20px" }}>
              <button onClick={handleDownloadPDF} className="pdf-button">
                Download PDF
              </button>
              <button
                onClick={() => exportPropertiesToCSV(material)}
                className="pdf-button"
                style={{ marginLeft: "10px" }}
              >
                Download CSV
              </button>
            </div>
          )}
        </Container>
      )}
      <br />
    </div>
  );
};

export default MaterialPage;
