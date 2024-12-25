import { useState } from "react";
import "./style/NewBill.css";

function NewBill() {
  const [formData, setFormData] = useState({
    id: "INCREMENT",
    name: "",
    billed_amount: "",
    paid_amount: "",
    date1: "",
    date2: "",
    paid_or_not: "",
    billNo: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const fetchCachedData = () => {
    const cachedData = localStorage.getItem("billsData");
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const currentTime = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      if (currentTime - timestamp < oneDay) {
        // Use cached data
        console.log("Using cached bills data:", data);
        return data;
      }
    }
    return [];
  };

  const updateLocalStorage = (newBill) => {
    const existingData = fetchCachedData();
    const updatedData = [...existingData, newBill];
    localStorage.setItem(
      "billsData",
      JSON.stringify({ data: updatedData, timestamp: new Date().getTime() })
    );
    console.log("Updated local storage with new bill:", newBill);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, billed_amount, date1, paid_or_not, billNo } = formData;

    // Validation
    if (!name || !billed_amount || !date1 || !paid_or_not || !billNo) {
      alert(
        "Please fill all mandatory fields: Name, Billed Amount, Billed Date, Bill No, and Paid or Not."
      );
      return;
    }

    try {
      // Check for duplicate Bill No
      const existingBills = fetchCachedData();
      const duplicate = existingBills.some((bill) => bill.billNo === billNo);

      if (duplicate) {
        alert(
          "A bill with this Bill No already exists. Please use a unique Bill No."
        );
        return;
      }

      // Ensure the dates are in ISO string format
      const formattedData = {
        ...formData,
        date1: formData.date1
          ? new Date(formData.date1).toLocaleDateString("en-CA")
          : "",
        date2: formData.date2
          ? new Date(formData.date2).toLocaleDateString("en-CA")
          : "",
      };

      // Submit the form
      const submitResponse = await fetch(
        "https://sheetdb.io/api/v1/c495ucuahvet3",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: formattedData }),
        }
      );

      const result = await submitResponse.json();
      console.log("Bill Created:", result);
      alert("New bill successfully created!");

      // Update local storage with new bill
      updateLocalStorage(formattedData);

      setFormData({
        id: "INCREMENT",
        name: "",
        billed_amount: "",
        paid_amount: "",
        date1: "",
        date2: "",
        paid_or_not: "",
        billNo: "",
      });
    } catch (error) {
      console.error("Error creating bill:", error);
      alert("Failed to create the bill.");
    }
  };

  return (
    <div className="main">
      <h2 className="h2-cls">Create New Bill</h2>
      <form onSubmit={handleSubmit}>
        <label className="in-css">
          Name (Mandatory):
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </label>
        <br />
        <label className="in-css">
          Billed Amount (Mandatory):
          <input
            type="text"
            name="billed_amount"
            value={formData.billed_amount}
            onChange={handleChange}
          />
        </label>
        <br />
        <label className="in-css">
          Paid Amount:
          <input
            type="text"
            name="paid_amount"
            value={formData.paid_amount}
            onChange={handleChange}
          />
        </label>
        <br />
        <label className="in-css">
          Billed Date (Mandatory):
          <input
            type="date"
            name="date1"
            value={formData.date1}
            onChange={handleChange}
          />
        </label>
        <br />
        <label className="in-css">
          Paid Date:
          <input
            type="date"
            name="date2"
            value={formData.date2}
            onChange={handleChange}
          />
        </label>
        <br />
        <label className="in-css">
          Paid or Not (Mandatory):
          <select
            name="paid_or_not"
            value={formData.paid_or_not}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </label>
        <br />
        <label className="in-css">
          Bill No (Mandatory):
          <input
            type="text"
            name="billNo"
            value={formData.billNo}
            onChange={handleChange}
          />
        </label>
        <br />
        <button type="submit" className="n-btn">
          Submit
        </button>
      </form>
    </div>
  );
}

export default NewBill;
