export const exportPropertiesToCSV = (material) => {
  if (!material) return;

  const name = material?.mat_name || "Material";
  const categories = material?.categories?.join(", ") || "-";
  const keywords = material?.keywords || "-";
  const notes = material?.notes || "-";
  const vendors =
    material?.vendors || "No vendors are listed for this material";

  const lines = [];

  // Material details
  lines.push(`${name}`);
  lines.push("");
  lines.push(`Categories - ${categories}`);
  lines.push(`Key Words - ${keywords}`);
  lines.push(`Material Notes - ${notes}`);
  lines.push(`Vendors - ${vendors}`);
  lines.push("");
  lines.push("Properties");
  lines.push("");

  // Grouped Properties
  if (material.Properties) {
    Object.entries(material.Properties).forEach(([category, props]) => {
      lines.push(`${category},,,,,`);
      lines.push("Property,Metric,English,Comments,");
      Object.entries(props).forEach(([propName, values]) => {
        values.forEach((value) => {
          const metric = value.Metric || "";
          const english = value.English || "";
          const comments = value.Comments || "";
          lines.push(`${propName},${metric},${english},${comments}`);
        });
      });
      lines.push(""); // blank line between categories
    });
  }

  // Create CSV
  const csvContent = lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `${name}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
