import { Routes, Route } from "react-router-dom";
import Home from "./Home";
function App() {
  return (
    <><h1 style={{textAlign:"center"}}>Bhatora Golap Sangha</h1>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;

// <div>
//         {data.map((item, index) => (
//           <div key={index} style={{ marginBottom: "10px" }}>
//             <p>ID: {item.id}</p>
//             <p>Name: {item.name}</p>
//             <p>Billed Amount: {item["billed amount"]}</p>
//             <p>Paid Amount: {item["paid amount"]}</p>
//             <p>Date: {item.date}</p>
//             <p>Paid or Not: {item["paid or not"]}</p>
//           </div>
//         ))}
// //       </div><div className="App">
//       <h1>Bhatora Golap Sangha</h1>

//     </div>
