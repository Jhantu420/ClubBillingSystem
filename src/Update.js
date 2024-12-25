import React, { useState } from "react";
import "./style/update.css"; // Import the CSS file

function Update() {
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState([]); // To store multiple records for the same Bill No

  // Fetch all data and save to local storage
  const fetchAllData = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("https://sheetdb.io/api/v1/c495ucuahvet3");
      const data = await response.json();

      // Save data to local storage with a timestamp
      localStorage.setItem(
        "billsData",
        JSON.stringify({ data, timestamp: new Date().getTime() })
      );
      alert("Data fetched and stored in local storage for one day.");
    } catch (error) {
      console.error("Error fetching all data:", error);
      alert("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Get data from local storage or fetch fresh data if expired
  const getCachedData = () => {
    const cachedData = localStorage.getItem("billsData");
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const currentTime = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      if (currentTime - timestamp < oneDay) {
        console.log("Using cached data.");
        return data;
      }
    }
    console.log("Cache expired. Fetch fresh data.");
    return [];
  };

  // Search data by Bill No from local storage
  const handleSearch = () => {
    if (!searchTerm) {
      alert("Please enter a Bill No to search.");
      return;
    }

    const data = getCachedData();
    const filteredRecords = data.filter((record) => record.billNo === searchTerm);

    if (filteredRecords.length === 0) {
      alert("No data found for the provided Bill No.");
      setRecords([]);
      setFormData(null);
    } else {
      setRecords(filteredRecords);
      setFormData(filteredRecords[0]);
    }
  };

  // Update local storage with new or updated data
  const updateLocalStorage = (updatedRecord) => {
    const data = getCachedData();
    const updatedData = data.map((record) =>
      record.billNo === updatedRecord.billNo ? updatedRecord : record
    );
    localStorage.setItem(
      "billsData",
      JSON.stringify({ data: updatedData, timestamp: new Date().getTime() })
    );
    console.log("Local storage updated with new data.");
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission for update
  const handleUpdate = (e) => {
    e.preventDefault();

    // Validate changes
    const lastUploadedData = JSON.parse(localStorage.getItem("lastUploadedData"));
    if (lastUploadedData && JSON.stringify(lastUploadedData) === JSON.stringify(formData)) {
      alert("No changes detected. Please update the data before submitting.");
      return;
    }

    fetch(`https://sheetdb.io/api/v1/c495ucuahvet3/billNo/${formData.billNo}`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: formData,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update the data.");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Update successful:", data);
        alert("Data updated successfully!");

        // Update local storage with the updated record
        updateLocalStorage(formData);

        setFormData(null);
        setSearchTerm("");
        setRecords([]);

        // Store the updated data in localStorage
        localStorage.setItem("lastUploadedData", JSON.stringify(formData));
      })
      .catch((error) => {
        console.error("Error updating data:", error);
        alert("Failed to update the data. Please try again.");
      });
  };

  // Handle record selection from the list
  const handleSelectRecord = (record) => {
    setFormData(record);
  };

  return (
    <div>
      <h2>Search and Update</h2>

      {/* Fetch All Data Section */}
      <div className="fetch-section">
        <button onClick={fetchAllData} disabled={isLoading}>
          {isLoading ? "Fetching..." : "Fetch All Data"}
        </button>
      </div>

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
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* List of Records Section */}
      {records.length > 0 && (
        <div>
          <h3>Select a Record to Edit</h3>
          <ul>
            {records.map((record) => (
              <li key={record.billNo}>
                <button onClick={() => handleSelectRecord(record)}>
                  Edit Bill No: {record.billNo}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

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
          <button type="submit">Update</button>
        </form>
      )}
    </div>
  );
}

export default Update;
