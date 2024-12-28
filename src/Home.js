import React from "react";
import NewBill from "./newBill";
import { Link } from "react-router-dom";
import "./style/Home.css";
function Home() {
  return (
    <>
      <div className="container" >
        <Link to="/update" className="link-button">
          Update Bil
        </Link>
        <Link to="/dashboard" className="link-button">
          Dashboard
        </Link>
      </div>
      <div>
        <NewBill />
      </div>
    </>
  );
}

export default Home;
