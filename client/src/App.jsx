import { useState } from "react";
import Home from "./components/Home.jsx";
import Admin from "./components/Admin.jsx";
import CardLookup from "./components/CardLookup.jsx";
import pokeball from "./assets/img/pokeball.png";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [binders, setBinders] = useState({}); // Add binders state here
  const ADMIN_PASSWORD = "supersecret";

  const handleLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setPasswordInput("");
    } else {
      alert("Wrong password!");
    }
  };

  const handleBack = () => {
    setIsAdmin(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      {!isAdmin ? (
        <div>
          <img src={pokeball} alt="Pokeball" width="300" length="300" style={{marginLeft: "23px"}}/>
          <h1>Welcome User</h1>
          <h2>Are you a vendor? Log in here!</h2>
          <input
            type="password"
            placeholder="Enter vendor password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            style={{ marginRight: "0.5rem" }}
          />
          <button onClick={handleLogin}>Login as Vendor</button>
          <div style={{height: "3rem"}}></div>
          {/* Pass binders to Home component */}
          <Home binders={binders} />
        </div>
      ) : (
        <div>
          {/* Pass binders and setBinders to Admin component */}
          <Admin binders={binders} setBinders={setBinders} />
          <CardLookup />
          <button
            onClick={handleBack}
            style={{ marginTop: "1rem", background: "#f00000", padding: "0.5rem" }}
          >
            Back to User
          </button>
        </div>
      )}
    </div>
  );
}