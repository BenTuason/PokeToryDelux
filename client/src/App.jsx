import { useState } from "react";
import Home from "./components/Home.jsx";
import Admin from "./components/Admin.jsx";
import CardLookup from "./components/CardLookup.jsx";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
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
          <h1>Welcome User</h1>
          <input
            type="password"
            placeholder="Enter admin password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            style={{ marginRight: "0.5rem" }}
          />
          <button onClick={handleLogin}>Login as Admin</button>
          <Home />
        </div>
      ) : (
        <div>
          <Admin />
          <h1>Admin Panel</h1>
          <CardLookup />
          <button
            onClick={handleBack}
            style={{ marginTop: "1rem", background: "#eee", padding: "0.5rem" }}
          >
            Back to User
          </button>
        </div>
      )}
    </div>
  );
}
