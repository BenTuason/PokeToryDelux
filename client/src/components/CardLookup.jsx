import { useState } from "react";
import axios from "axios";

export default function CardLookup() {
  const [searchTerm, setSearchTerm] = useState(""); // name search
  const [setNumber, setSetNumber] = useState({ set: "", number: "" }); // set + collector number
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search by Pokémon name
  const handleSearch = async () => {
    if (!searchTerm) return;
    setLoading(true);
    setResults([]);
    try {
      const res = await axios.get("http://localhost:5000/api/search", {
        params: { name: searchTerm },
      });
      setResults(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Search failed");
    } finally {
      setLoading(false);
    }
  };

  // Lookup by set + collector number
  const handleLookup = async () => {
    if (!setNumber.set || !setNumber.number) return;
    setLoading(true);
    setResults([]);
    try {
      const res = await axios.get("http://localhost:5000/api/lookup", {
        params: { set: setNumber.set, number: setNumber.number },
      });
      if (res.data.data) {
        setResults([res.data.data]); // wrap in array for consistency
      } else {
        alert("No card found for that set/number");
      }
    } catch (err) {
      console.error(err);
      alert("Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "1rem" }}>
      {/* Name search */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search Pokémon by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginRight: "0.5rem" }}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      

      {/* Display all cards */}
{results.length > 0 && (
  <div style={{ marginTop: "1rem" }}>
    <h3>Results:</h3>
    {results.map((card) => (
      <div
        key={card.id}
        style={{
          border: "1px solid #ccc",
          padding: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        <h4>{card.name}</h4>
        <p>
          Set: {card.set?.name} | ID: <strong>{card.id}</strong> | Rarity:{" "}
          {card.rarity || "N/A"}
        </p>

        {/* Display all TCGPlayer prices */}
        {card.tcgplayer?.prices &&
          Object.entries(card.tcgplayer.prices).map(([variant, data]) => (
            <p key={variant}>
              {variant} Market Price: ${data.market ?? "N/A"} | Near Mint: $
              {data?.["holofoil"]?.market ?? data.market ?? "N/A"}
            </p>
          ))}

        {card.tcgplayer?.url && (
          <a href={card.tcgplayer.url} target="_blank" rel="noreferrer">
            View on TCGPlayer
          </a>
        )}
      </div>
    ))}
  </div>
)}
    </div>
  );
}