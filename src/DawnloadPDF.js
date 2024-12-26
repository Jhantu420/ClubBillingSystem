import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Import the autoTable plugin
import "./style/DawnloadPDF.css";

function DawnloadPDF() {
  const [data, setData] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [filteredData, setFilteredData] = useState([]); // Filtered data for the table

  // Fetch and store data in Local Storage when clicked
  const fetchAndStoreData = async () => {
    try {
      const response = await fetch("https://sheetdb.io/api/v1/c495ucuahvet3");
      const data = await response.json();
      localStorage.setItem(
        "billsData",
        JSON.stringify({ data, timestamp: new Date().getTime() })
      );
      alert("Data fetched and cached successfully!");
      setData(data); // Update the data state after storing it
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data.");
    }
  };

  // Final submission to the database
  // Handle update of modified records
  const handleFinalSubmit = async () => {
    const cachedData = localStorage.getItem("billsData");

    if (cachedData) {
      const { data } = JSON.parse(cachedData);

      // Identify new bills to submit
      const newBills = data.filter((item) => item.isNewBill === true);

      // Identify updated records to submit
      const updatedRecords = data.filter((item) => item.isNewUpdate === true);

      if (updatedRecords.length === 0 && newBills.length === 0) {
        alert("No new or updated data to submit.");
        return;
      }

      try {
        // Handle new bills submission
        for (const bill of newBills) {
          await fetch("https://sheetdb.io/api/v1/c495ucuahvet3", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ data: bill }),
          });
          console.log(`New bill added: ${bill.billNo}`);
        }

        // Handle updated records submission
        for (const record of updatedRecords) {
          try {
            const response = await fetch(
              `https://sheetdb.io/api/v1/c495ucuahvet3/billNo/${record.billNo}`, // Updated API URL
              {
                method: "PATCH",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  data: record, // Send the record as the update payload
                }),
              }
            );

            if (!response.ok) {
              throw new Error(
                `Failed to update record with Bill No ${record.billNo}: ${response.statusText}`
              );
            }

            const data = await response.json();
            // console.log(
            //   `Record updated successfully for Bill No ${record.billNo}:`,
            //   data
            // );
          } catch (error) {
            console.error(
              `Error updating record with Bill No ${record.billNo}:`,
              error
            );
          }
        }

        // Reset flags in localStorage
        const resetData = data.map((item) => ({
          ...item,
          isNewBill: false,
          isNewUpdate: false,
        }));

        localStorage.setItem(
          "billsData",
          JSON.stringify({ data: resetData, timestamp: new Date().getTime() })
        );

        alert("Database successfully updated!");
      } catch (error) {
        console.error("Error updating database:", error);
        alert("Failed to update the database. Please try again.");
      }
    } else {
      alert("No data to submit.");
    }
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

  // Generate a PDF report
  const generatePDF = (filteredData, title) => {
    const doc = new jsPDF();

    // Add multiple watermarks at a 45-degree angle
    const addWatermarks = () => {
      const watermarkText = "Bhatora Golap Sangha";
      doc.setFontSize(20);
      doc.setTextColor(200, 200, 200); // Light gray color

      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      for (let x = -50; x < pageWidth + 50; x += 100) {
        for (let y = 50; y < pageHeight + 50; y += 100) {
          doc.text(watermarkText, x, y, {
            angle: 45, // Rotate the text 45 degrees
          });
        }
      }
    };

    // Add a centered, capitalized title
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

    // Prepare rows for the table
    const rows = filteredData.map((item) => ({
      name: item.name,
      billNo: item.billNo,
      billed_amount: item.billed_amount,
      paid_amount: item.paid_amount || "0",
      paid_or_not: item.paid_or_not,
      date1: item.date1,
      date2: item.date2 || "-",
    }));

    // Add the table to the PDF
    doc.autoTable({
      head: [columns.map((col) => col.header)],
      body: rows.map((row) => columns.map((col) => row[col.dataKey])),
      startY: 30,
      didDrawPage: (data) => {
        if (data.pageNumber > 1) addWatermarks();
      },
    });

    doc.save(`${title.replace(/\s+/g, "_").toLowerCase()}.pdf`);
  };

  // Filter data by date and paid_or_not
  const filterDataAndGeneratePDF = () => {
    if (!filterDate) {
      alert("Please select a date to filter.");
      return;
    }

    const cachedData = localStorage.getItem("billsData");
    if (cachedData) {
      const { data } = JSON.parse(cachedData);
      const filteredData = data.filter(
        (item) => item.date2 === filterDate && item.paid_or_not === "Yes"
      );

      if (filteredData.length === 0) {
        alert("No data found for the selected date with 'Paid' status.");
        return;
      }

      generatePDF(filteredData, `Bill Report for ${filterDate}`);
    } else {
      alert("No data available in Local Storage.");
    }
  };

  // Generate a PDF with all paid data
  const generateAllDataPDF = () => {
    const cachedData = localStorage.getItem("billsData");
    if (cachedData) {
      const { data } = JSON.parse(cachedData);
      const filteredData = data.filter((item) => item.paid_or_not === "Yes");

      if (filteredData.length === 0) {
        alert("No data found with 'Paid' status.");
        return;
      }

      generatePDF(filteredData, "Full Bill Report");
    } else {
      alert("No data available in Local Storage.");
    }
  };

  // Generate a PDF with all unpaid data
  const generateUnpaidDataPDF = () => {
    const cachedData = localStorage.getItem("billsData");
    if (cachedData) {
      const { data } = JSON.parse(cachedData);
      const filteredData = data.filter((item) => item.paid_or_not === "No");

      if (filteredData.length === 0) {
        alert("No unpaid data found.");
        return;
      }

      generatePDF(filteredData, "Unpaid Bill Report");
    } else {
      alert("No data available in Local Storage.");
    }
  };

  // Load data from local storage when the component mounts
  useEffect(() => {
    const cachedData = localStorage.getItem("billsData");
    if (cachedData) {
      const { data } = JSON.parse(cachedData);
      setData(data);
      setFilteredData(data); // Initialize filtered data with all the data
    }
  }, []);

  return (
    <div>
      <h2 className="b-h1">Download Bill Reports</h2>
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
      <button onClick={fetchAndStoreData} className="b-tn">
        Fetch And Store Data
      </button>
      <br />
      <br />
      <button onClick={handleFinalSubmit} className="b-tn">
        Final Submit All Data
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

// const response = await fetch(
//   "https://sheetdb.io/api/v1/c495ucuahvet3",
//   {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       query: { id: record.billNo }, // Use `id` field for the query
//       data: record, // Pass the updated record as `data`
//     }),
//   }
// );

// const result = await response.json();
// console.log(`Record updated successfully:`, result);

// if (!response.ok) {
//   throw new Error(`Failed to update record with ID ${record.id}`);
// }
