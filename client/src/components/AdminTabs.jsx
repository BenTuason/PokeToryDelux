import { useState } from "react";
import axios from "axios";

export default function AdminTabs() {
  const [tab, setTab] = useState("add"); // "add" or "inventory"

  // --- Card Lookup state ---
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Binder state ---
  const [binders, setBinders] = useState({}); // { binderName: [cards] }
  const [currentBinder, setCurrentBinder] = useState(""); // name of binder to add cards
  const [newBinderName, setNewBinderName] = useState(""); // for creating new binders
  const [addedCardFeedback, setAddedCardFeedback] = useState(null); // for showing feedback

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

  const createBinder = () => {
    if (!newBinderName) {
      alert("Please enter a binder name.");
      return;
    }
    
    if (binders[newBinderName]) {
      alert("A binder with this name already exists.");
      return;
    }
    
    setBinders(prev => ({
      ...prev,
      [newBinderName]: []
    }));
    
    setCurrentBinder(newBinderName);
    setNewBinderName("");
    alert(`Binder "${newBinderName}" created!`);
  };

  const addToBinder = (card) => {
    if (!currentBinder) {
      alert("Please select or create a binder first.");
      return;
    }

    // Check if card already exists in this binder
    const existingBinder = binders[currentBinder] || [];
    const cardExists = existingBinder.some(c => c.id === card.id);
    
    if (cardExists) {
      alert(`${card.name} is already in ${currentBinder}!`);
      return;
    }

    setBinders((prev) => {
      const existing = prev[currentBinder] || [];
      return {
        ...prev,
        [currentBinder]: [...existing, card],
      };
    });
    
    // Show feedback
    setAddedCardFeedback(`${card.name} added to ${currentBinder}!`);
    setTimeout(() => setAddedCardFeedback(null), 3000);
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h1>Admin Panel</h1>

      {/* Tab navigation */}
      <div style={{ marginBottom: "1rem" }}>
        <button 
          onClick={() => setTab("add")}
          disabled={tab === "add"}
          style={{ marginRight: "0.5rem" }}
        >
          Add Cards
        </button>
        <button 
          onClick={() => setTab("inventory")}
          disabled={tab === "inventory"}
        >
          Inventory
        </button>
      </div>

      {/* Feedback message */}
      {addedCardFeedback && (
        <div style={{
          padding: "0.5rem",
          backgroundColor: "#4CAF50",
          color: "white",
          marginBottom: "1rem",
          borderRadius: "4px"
        }}>
          {addedCardFeedback}
        </div>
      )}

      {/* --- Add Cards Tab --- */}
      {tab === "add" && (
        <div>
          <h2>Add Cards</h2>

          {/* --- Binder selection --- */}
          <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <select
                value={currentBinder}
                onChange={(e) => setCurrentBinder(e.target.value)}
                style={{ marginRight: "0.5rem", padding: "0.25rem" }}
              >
                <option value="">Select a binder</option>
                {Object.keys(binders).map(binder => (
                  <option key={binder} value={binder}>{binder}</option>
                ))}
              </select>
            </div>
            <span>OR</span>
            <div>
              <input
                type="text"
                placeholder="Create new binder"
                value={newBinderName}
                onChange={(e) => setNewBinderName(e.target.value)}
                style={{ marginRight: "0.5rem", padding: "0.25rem" }}
              />
              <button onClick={createBinder}>Create Binder</button>
            </div>
          </div>

          {/* --- Card search --- */}
          <div style={{ marginBottom: "1rem" }}>
            <input
              type="text"
              placeholder="Search Pokémon by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginRight: "0.5rem", padding: "0.25rem" }}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <button onClick={handleSearch} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          {/* --- Display results --- */}
          {results.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <h3>Results:</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                {results.map((card) => (
                  <div
                    key={card.id}
                    style={{
                      border: "1px solid #ccc",
                      padding: "1rem",
                      borderRadius: "8px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: "250px"
                    }}
                  >
                    <div>
                      <h4 style={{ margin: "0 0 0.5rem 0" }}>{card.name}</h4>
                      <p style={{ margin: "0.25rem 0", fontSize: "0.9rem" }}>
                        Set: {card.set?.name} | ID: <strong>{card.id}</strong> | Rarity:{" "}
                        {card.rarity || "N/A"}
                      </p>
                      {card.tcgplayer?.prices &&
                        Object.entries(card.tcgplayer.prices).map(([variant, data]) => (
                          <p key={variant} style={{ margin: "0.25rem 0", fontSize: "0.9rem" }}>
                            {variant} Market Price: ${data.market ?? "N/A"}
                          </p>
                        ))}
                      {card.tcgplayer?.url && (
                        <a href={card.tcgplayer.url} target="_blank" rel="noreferrer" style={{ fontSize: "0.9rem" }}>
                          View on TCGPlayer
                        </a>
                      )}
                    </div>
                    <button 
                      onClick={() => addToBinder(card)} 
                      style={{ 
                        marginTop: "1rem", 
                        padding: "0.5rem", 
                        backgroundColor: "#4CAF50", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Add to Binder
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- Display binder preview --- */}
          {currentBinder && binders[currentBinder] && (
            <div style={{ marginTop: "2rem" }}>
              <h3>{currentBinder} Contents ({binders[currentBinder].length})</h3>
              <ul>
                {binders[currentBinder].map((card, idx) => {
                  // Get the market price (use the first available price)
                  const priceEntry = card.tcgplayer?.prices ? Object.entries(card.tcgplayer.prices)[0] : null;
                  const marketPrice = priceEntry ? priceEntry[1].market : "N/A";
                  
                  return (
                    <li key={idx}>
                      {card.name} | {card.set?.name} | ID: {card.id} | Price: ${marketPrice}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* --- Inventory Tab --- */}
{tab === "inventory" && (
  <div>
    <h2>Inventory</h2>
    {Object.keys(binders).length === 0 ? (
      <p>No binders created yet. Go to the "Add Cards" tab to create binders and add cards.</p>
    ) : (
      <div>
        {Object.entries(binders).map(([binderName, cards]) => (
          <div key={binderName} style={{ marginBottom: "1.5rem" }}>
            <h3>{binderName} ({cards.length} cards)</h3>
            <ul>
              {cards.map((card, idx) => {
                // Get the market price (use the first available price)
                const priceEntry = card.tcgplayer?.prices ? Object.entries(card.tcgplayer.prices)[0] : null;
                const marketPrice = priceEntry ? priceEntry[1].market : "N/A";
                
                return (
                  <li key={idx}>
                    {card.name} | {card.set?.name} | ID: {card.id} | Price: ${marketPrice}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    )}
  </div>
)}
    </div>
  );
}