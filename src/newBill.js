import { useState } from "react";
import "./style/NewBill.css";

function NewBill() {
  const [formData, setFormData] = useState({
    name: "",
    billed_amount: "",
    paid_amount: "",
    date1: "",
    date2: "",
    paid_or_not: "",
    billNo:"",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation: Check if mandatory fields are filled
    const { name, billed_amount, date1, paid_or_not,billNo } = formData;
    if (!name || !billed_amount || !date1 || !paid_or_not || !billNo) {
      alert("Please fill all mandatory fields: Name, Billed Amount, Billed Date,Bill NO, and Paid or Not.");
      return; // Prevent submission
    }

    // Ensure date is formatted as YYYY-MM-DD
    const billedDateString = new Date(date1).toISOString().split("T")[0];
    const paidDateString = formData.date2 ? new Date(formData.date2).toISOString().split("T")[0] : "0";

    fetch("https://sheetdb.io/api/v1/iimwflqhrmr1k", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [
          {
            id: "INCREMENT", // Automatically increment ID
            name,
            billed_amount,
            paid_amount: formData.paid_amount || "0",
            date1: billedDateString,
            date2: paidDateString,
            paid_or_not,
            billNo,
          },
        ],
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Bill Created:", data);
        alert("New bill successfully created!");
        setFormData({
          name: "",
          billed_amount: "",
          paid_amount: "",
          date1: "",
          date2: "",
          paid_or_not: "",
          billNo
        });
      })
      .catch((error) => {
        console.error("Error creating bill:", error);
        alert("Failed to create the bill.");
      });
  };

  return (
    <div>
      <h2>Create New Bill</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name (Mandatory):
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Billed Amount (Mandatory):
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
          Billed Date (Mandatory):
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
        <label>
          Bill No (Mandatory):
          <input
            type="text"
            name="billNo"
            value={formData.billNo}
            onChange={handleChange}
          />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default NewBill;
