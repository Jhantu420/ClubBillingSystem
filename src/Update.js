import React, { useState } from "react";
import './style/update.css'; // Import the CSS file

function Update() {
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState([]); // To store multiple records for same Bill No

  // Fetch data based on the billNo
  const handleSearch = () => {
    if (!searchTerm) {
      alert("Please enter a Bill No to search.");
      return;
    }

    setIsLoading(true);

    fetch(`https://sheetdb.io/api/v1/iimwflqhrmr1k/search?billNo=${searchTerm}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`No data found for Bill No: ${searchTerm}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.length === 0) {
          alert("No data found for the provided Bill No.");
        } else {
          setRecords(data); // Store all records returned
          setFormData(data[0]); // Prefill form with the first match
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        alert("Failed to fetch data. Please try again.");
      })
      .finally(() => setIsLoading(false));
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleUpdate = (e) => {
    e.preventDefault();

    fetch(`https://sheetdb.io/api/v1/iimwflqhrmr1k/billNo/${formData.billNo}`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: formData, // Send updated data
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
        setFormData(null); // Reset the form after successful update
        setSearchTerm("");
        setRecords([]); // Clear records after update
      })
      .catch((error) => {
        console.error("Error updating data:", error);
        alert("Failed to update the data. Please try again.");
      });
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
