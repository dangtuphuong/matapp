import React, { useEffect, useState } from "react";
import { Bubble } from "react-chartjs-2";
import { getAllMaterials } from "../services/material-service";
import {
    Chart as ChartJS,
    PointElement,
    LinearScale,
    Tooltip,
    Legend,
    Title,
} from "chart.js";
import { Container, Typography, Box } from "@mui/material";
import NavbarPrivate from "./NavbarPrivate";

ChartJS.register(LinearScale, PointElement, Tooltip, Legend, Title);

const COLORS = [
    "#4dc9f6", "#f67019", "#f53794", "#537bc4", "#acc236",
    "#ffa600", "#8dd3c7", "#e7298a", "#66a61e", "#ff7f00",
];

const BubbleChart = () => {
    const [materials, setMaterials] = useState([]);

    useEffect(() => {
        getAllMaterials({
            page: 1,
            limit: 100,
            searchTerm: "",
            searchCategories: [],
            searchProperties: [],
        })
            .then((data) => {
                setMaterials(data?.materials || []);
            })
            .catch((err) => console.error("Error loading materials:", err));
    }, []);

    // Group material count by top-level categories
    const categoryMap = {};
    materials.forEach((mat) => {
        mat.Categories?.forEach((cat) => {
            categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });
    });

    const grouped = groupByTopLevelCategory(materials);
    const categoryNames = Object.keys(grouped);

    function groupByTopLevelCategory(materials) {
        const grouped = {};
        materials.forEach(material => {
            material.Categories?.forEach(cat => {
                grouped[cat] = (grouped[cat] || 0) + 1;
            });
        });
        return grouped;
    }


    const data = {
        datasets: categoryNames.map((cat, i) => ({
            label: cat,
            data: [{
                x: cat,
                y: grouped[cat],
                r: Math.sqrt(grouped[cat]) * 6
            }],
            backgroundColor: COLORS[i % COLORS.length]
        }))
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: true },
            title: {
                display: true,
                text: "Materials per Category"
            }
        },
        scales: {
            x: {
                type: 'category',
                title: {
                    display: true,
                    text: 'Category'
                },
                labels: categoryNames
            },
            y: {
                title: {
                    display: true,
                    text: 'Material Count'
                },
                beginAtZero: true,
                ticks: { stepSize: 1 }
            }
        }
    };

    return (
        <>
            <NavbarPrivate />
            <Container
                maxWidth={false}
                disableGutters
                sx={{
                    my: 4,
                    px: 0,
                    width: "100vw",
                }}
            >
                <Typography variant="h4" align="center" sx={{ mb: 3 }}>
                    Bubble Chart: Material Count by Category
                </Typography>
                <Box
                    sx={{
                        height: "800px",
                        width: "100%",
                        overflowX: "auto",
                    }}
                >
                    <Bubble data={data} options={options} />
                </Box>
            </Container>

        </>
    );
};

export default BubbleChart;
