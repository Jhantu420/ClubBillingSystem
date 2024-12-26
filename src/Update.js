import React, { useState } from "react";
import "./style/update.css"; // Import the CSS file

function Update() {
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState([]); // To store multiple records for the same Bill No

  // Fetch and update records from local storage
  const handleSearch = () => {
    if (!searchTerm) {
      alert("Please enter a Bill No to search.");
      return;
    }

    setIsLoading(true);

    // Fetch data from localStorage
    const cachedData = localStorage.getItem("billsData");
    if (cachedData) {
      const { data } = JSON.parse(cachedData);
      const filteredRecords = data.filter(
        (record) => record.billNo === searchTerm
      );

      if (filteredRecords.length === 0) {
        alert("No data found for the provided Bill No.");
      } else {
        setRecords(filteredRecords); // Store all matching records
        setFormData(filteredRecords[0]); // Prefill form with the first match
      }
    } else {
      alert("No data found in local storage.");
    }

    setIsLoading(false);
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
      isNewUpdate: true, // Mark the record as updated
    }));
  };

  // Handle form submission (update in localStorage)
  const handleUpdate = (e) => {
    e.preventDefault();

    if (!formData) {
      alert("No form data available for update.");
      return;
    }

    // Fetch data from localStorage
    const cachedData = localStorage.getItem("billsData");
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);

      // Update the localStorage with new formData
      const updatedData = data.map((record) =>
        record.billNo === formData.billNo ? { ...formData } : record
      );

      // Save updated data back to localStorage
      localStorage.setItem(
        "billsData",
        JSON.stringify({ data: updatedData, timestamp })
      );
      alert("Data updated in local storage!");
      setRecords(
        updatedData.filter((record) => record.billNo === formData.billNo)
      ); // Update displayed records
    }
  };

  // Handle record selection from the list
  const handleSelectRecord = (record) => {
    setFormData(record); // Prefill form with the selected record
  };

  return (
    <div>
      <h2>Search and Update</h2>

      {/* Search Section */}
      <div className="search-section">
        <label>
          Search by Bill No:
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>
        <button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Prefilled Form Section */}
      {formData && (
        <form onSubmit={handleUpdate}>
          <h3>Edit Details</h3>
          <label>
            Bill No:
            <input
              type="text"
              name="billNo"
              value={formData.billNo}
              onChange={handleChange}
              disabled
            />
          </label>
          <br />
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </label>
          <br />
          <label>
            Billed Amount:
            <input
              type="text"
              name="billed_amount"
              value={formData.billed_amount}
              onChange={handleChange}
            />
          </label>
          <br />
          <label>
            Paid Amount:
            <input
              type="text"
              name="paid_amount"
              value={formData.paid_amount}
              onChange={handleChange}
            />
          </label>
          <br />
          <label>
            Billed Date:
            <input
              type="date"
              name="date1"
              value={formData.date1}
              onChange={handleChange}
            />
          </label>
          <br />
          <label>
            Paid Date:
            <input
              type="date"
              name="date2"
              value={formData.date2}
              onChange={handleChange}
            />
          </label>
          <br />
          <label>
            Paid or Not:
            <select
              name="paid_or_not"
              value={formData.paid_or_not}
              onChange={handleChange}
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </label>
          <br />
          <button type="submit">Update in Local Storage</button>
        </form>
      )}
    </div>
  );
}

export default Update;




