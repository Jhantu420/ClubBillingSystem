import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Import the autoTable plugin
import "./style/DawnloadPDF.css";

function DawnloadPDF() {
  const [data, setData] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [filteredData, setFilteredData] = useState([]); // Filtered data for the table

  // Helper function to fetch and store data in localStorage
  const fetchData = () => {
    fetch("https://sheetdb.io/api/v1/c495ucuahvet3")
      .then((response) => response.json())
      .then((data) => {
        const timestamp = new Date().getTime(); // Current time in milliseconds
        const dataToStore = { data, timestamp };
        localStorage.setItem("cachedData", JSON.stringify(dataToStore)); // Save data and timestamp
        alert("Data fetched and stored in local storage for one day.");
        setData(data);
        setFilteredData(data);
        console.log("Fetched Data:", data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  // Load data from localStorage if valid
  const loadCachedData = () => {
    const cachedData = localStorage.getItem("cachedData");
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const currentTime = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000; // 1 day in milliseconds

      if (currentTime - timestamp < oneDay) {
        // Use cached data if within 1 day
        setData(data);
        setFilteredData(data);
        console.log("Using cached data:", data);
        return true;
      }
    }
    return false; // No valid cached data
  };

  // Handle search input change
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(query)
      )
    );
    setFilteredData(filtered);
  };

  // Check for cached data on component load
  useEffect(() => {
    if (!loadCachedData()) {
      console.log("No valid cached data, please fetch data.");
    }
  }, []);

  // Generate a PDF report (other functions remain unchanged)
  const generatePDF = (filteredData, title) => {
    const doc = new jsPDF();

    // Define watermark logic
    const addWatermarks = () => {
      const watermarkText = "Bhatora Golap Sangha";
      doc.setFontSize(20);
      doc.setTextColor(200, 200, 200); // Light gray color
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      for (let x = -50; x < pageWidth + 50; x += 100) {
        for (let y = 50; y < pageHeight + 50; y += 100) {
          doc.text(watermarkText, x, y, { angle: 45 });
        }
      }
    };

    // Add a title
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(title.toUpperCase(), doc.internal.pageSize.width / 2, 20, {
      align: "center",
    });

    // Add watermarks
    addWatermarks();

    // Define table columns
    const columns = [
      { header: "Name", dataKey: "name" },
      { header: "Bill No", dataKey: "billNo" },
      { header: "Billed Amount", dataKey: "billed_amount" },
      { header: "Paid Amount", dataKey: "paid_amount" },
      { header: "Paid or Not", dataKey: "paid_or_not" },
      { header: "Billed Date", dataKey: "date1" },
      { header: "Paid Date", dataKey: "date2" },
    ];

    // Prepare rows
    const rows = filteredData.map((item) => ({
      name: item.name,
      billNo: item.billNo,
      billed_amount: item.billed_amount,
      paid_amount: item.paid_amount || "0",
      paid_or_not: item.paid_or_not,
      date1: item.date1,
      date2: item.date2 || "-",
    }));

    // Add table
    doc.autoTable({
      head: [columns.map((col) => col.header)],
      body: rows.map((row) => columns.map((col) => row[col.dataKey])),
      startY: 30,
      didDrawPage: (data) => {
        if (data.pageNumber > 1) addWatermarks();
      },
    });

    // Save the PDF
    doc.save(`${title.replace(/\s+/g, "_").toLowerCase()}.pdf`);
  };

  // Filter data and generate PDFs (other functions unchanged)
  const filterDataAndGeneratePDF = () => {
    if (!filterDate) {
      alert("Please select a date to filter.");
      return;
    }

    const filteredData = data.filter(
      (item) => item.date2 === filterDate && item.paid_or_not === "Yes"
    );

    if (filteredData.length === 0) {
      alert("No data found for the selected date with 'Paid' status.");
      return;
    }

    generatePDF(filteredData, `Bill Report for ${filterDate}`);
  };

  const generateAllDataPDF = () => {
    const filteredData = data.filter((item) => item.paid_or_not === "Yes");

    if (filteredData.length === 0) {
      alert("No data found with 'Paid' status.");
      return;
    }

    generatePDF(filteredData, "Full Bill Report");
  };

  const generateUnpaidDataPDF = () => {
    const filteredData = data.filter((item) => item.paid_or_not === "No");

    if (filteredData.length === 0) {
      alert("No unpaid data found.");
      return;
    }

    generatePDF(filteredData, "Unpaid Bill Report");
  };

  return (
    <div>
      <h2 className="b-h1">Download Bill Reports</h2>
      <button onClick={fetchData} className="b-tn">Fetch Data</button>
      <br />
      <label className="b-h2">
        Filter by Date:
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </label>
      <button onClick={filterDataAndGeneratePDF} className="b-tn">
        Download Report by Date
      </button>
      <br />
      <button onClick={generateAllDataPDF} className="b-tn">
        Download Full Report
      </button>
      <br />
      <button onClick={generateUnpaidDataPDF} className="b-tn">
        Download Unpaid Report
      </button>
      <br />
      <br />
      <h3 className="b-h2">Search and View Data</h3>
      <input
        type="text"
        placeholder="Search by any field"
        value={searchQuery}
        onChange={handleSearch}
        className="i"
      />
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Bill No</th>
              <th>Billed Amount</th>
              <th>Paid Amount</th>
              <th>Paid or Not</th>
              <th>Billed Date</th>
              <th>Paid Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.billNo}</td>
                  <td>{item.billed_amount}</td>
                  <td>{item.paid_amount || "0"}</td>
                  <td>{item.paid_or_not}</td>
                  <td>{item.date1}</td>
                  <td>{item.date2 || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DawnloadPDF;
