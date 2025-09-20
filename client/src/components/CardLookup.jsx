import { useState } from "react";
import axios from "axios";

export default function CardLookup() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm) return;
    setLoading(true);
    setSelectedCard(null); // reset selected card
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

  const handleSelect = async (cardId) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/card/${cardId}`);
      setSelectedCard(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load card");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "1rem" }}>
      <div>
        <input
          type="text"
          placeholder="Search card by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginRight: "0.5rem" }}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {results.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Search Results:</h3>
          <ul>
            {results.map((card) => (
              <li key={card.id} style={{ marginBottom: "0.5rem" }}>
                {card.name} ({card.set?.series})
                <button
                  style={{ marginLeft: "0.5rem" }}
                  onClick={() => handleSelect(card.id)}
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedCard && (
        <div style={{ marginTop: "1rem", border: "1px solid #ccc", padding: "1rem" }}>
          <h2>{selectedCard.name}</h2>
          <img src={selectedCard.images?.small} alt={selectedCard.name} />
          <p>Set: {selectedCard.set?.name}</p>
          <p>Rarity: {selectedCard.rarity || "N/A"}</p>
          {selectedCard.tcgplayer?.prices?.holofoil && (
            <p>Market Price: ${selectedCard.tcgplayer.prices.holofoil.market}</p>
          )}
          {selectedCard.tcgplayer?.url && (
            <a href={selectedCard.tcgplayer.url} target="_blank" rel="noreferrer">
              View on TCGPlayer
            </a>
          )}
        </div>
      )}
    </div>
  );
}
