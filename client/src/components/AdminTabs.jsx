import { useState } from "react";
import axios from "axios";

export default function AdminTabs() {
  const [tab, setTab] = useState("add");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [binders, setBinders] = useState({});
  const [currentBinder, setCurrentBinder] = useState("");
  const [newBinderName, setNewBinderName] = useState("");
  const [addedCardFeedback, setAddedCardFeedback] = useState(null);
  const [editingCard, setEditingCard] = useState(null); // Track which card is being edited

  // Price multipliers for different conditions
  const conditionMultipliers = {
    "Mint": 1.0,
    "Near Mint": 0.9,
    "Lightly Played": 0.7,
    "Moderately Played": 0.5,
    "Heavily Played": 0.3,
    "Damaged": 0.1
  };

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

    const existingBinder = binders[currentBinder] || [];
    const cardExists = existingBinder.some(c => c.id === card.id);
    
    if (cardExists) {
      alert(`${card.name} is already in ${currentBinder}!`);
      return;
    }

    // Add default properties to the card
    const enhancedCard = {
      ...card,
      quantity: 1,
      condition: "Near Mint",
      grade: null,
      customPrice: null
    };

    setBinders((prev) => {
      const existing = prev[currentBinder] || [];
      return {
        ...prev,
        [currentBinder]: [...existing, enhancedCard],
      };
    });
    
    setAddedCardFeedback(`${card.name} added to ${currentBinder}!`);
    setTimeout(() => setAddedCardFeedback(null), 3000);
  };

  const removeCard = (binderName, cardId) => {
    setBinders(prev => ({
      ...prev,
      [binderName]: prev[binderName].filter(card => card.id !== cardId)
    }));
  };

  const updateCard = (binderName, cardId, updates) => {
    setBinders(prev => ({
      ...prev,
      [binderName]: prev[binderName].map(card => 
        card.id === cardId ? { ...card, ...updates } : card
      )
    }));
    setEditingCard(null); // Close edit mode after update
  };

  const calculateAdjustedPrice = (card, condition, grade) => {
    const priceEntry = card.tcgplayer?.prices ? Object.entries(card.tcgplayer.prices)[0] : null;
    const basePrice = priceEntry ? priceEntry[1].market : 0;
    
    let adjustedPrice = basePrice;
    
    // Apply condition multiplier
    if (condition && conditionMultipliers[condition]) {
      adjustedPrice *= conditionMultipliers[condition];
    }
    
    // Apply grade multiplier (graded cards typically command premium)
    if (grade) {
      const gradeNum = parseInt(grade);
      if (gradeNum >= 9) adjustedPrice *= 2.5; // PSA 9-10 get premium
      else if (gradeNum >= 7) adjustedPrice *= 1.5; // PSA 7-8 get moderate premium
    }
    
    return adjustedPrice.toFixed(2);
  };

  const startEditing = (binderName, card) => {
    setEditingCard({ binderName, ...card });
  };

  const CardEditForm = ({ card, binderName, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      quantity: card.quantity || 1,
      condition: card.condition || "Near Mint",
      grade: card.grade || "",
      customPrice: card.customPrice || ""
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const updates = { ...formData };
      
      // Calculate adjusted price if not using custom price
      if (!updates.customPrice) {
        const adjustedPrice = calculateAdjustedPrice(card, updates.condition, updates.grade);
        updates.adjustedPrice = parseFloat(adjustedPrice);
      } else {
        updates.adjustedPrice = parseFloat(updates.customPrice);
      }
      
      onSave(binderName, card.id, updates);
    };

    return (
      <div style={{
        border: "2px solid #007bff",
        padding: "1rem",
        margin: "1rem 0",
        borderRadius: "8px",
        backgroundColor: "#f8f9fa"
      }}>
        <h4>Edit Card: {card.name}</h4>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Quantity:
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                style={{ marginLeft: "0.5rem", padding: "0.25rem" }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Condition:
              <select
                value={formData.condition}
                onChange={(e) => setFormData({...formData, condition: e.target.value})}
                style={{ marginLeft: "0.5rem", padding: "0.25rem" }}
              >
                {Object.keys(conditionMultipliers).map(cond => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Grade (PSA/BGS):
              <input
                type="text"
                placeholder="e.g., PSA 10"
                value={formData.grade}
                onChange={(e) => setFormData({...formData, grade: e.target.value})}
                style={{ marginLeft: "0.5rem", padding: "0.25rem" }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Custom Price ($):
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Override calculated price"
                value={formData.customPrice}
                onChange={(e) => setFormData({...formData, customPrice: e.target.value})}
                style={{ marginLeft: "0.5rem", padding: "0.25rem" }}
              />
            </label>
          </div>

          <div>
            <button type="submit" style={{ marginRight: "1rem", padding: "0.5rem", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px" }}>
              Save Changes
            </button>
            <button type="button" onClick={onCancel} style={{ padding: "0.5rem", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
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
        </div>
      )}

      {/* --- Inventory Tab --- */}
      {tab === "inventory" && (
        <div>
          <h2>Inventory Management</h2>
          {Object.keys(binders).length === 0 ? (
            <p>No binders created yet. Go to the "Add Cards" tab to create binders and add cards.</p>
          ) : (
            <div>
              {Object.entries(binders).map(([binderName, cards]) => (
                <div key={binderName} style={{ 
                  marginBottom: "2rem", 
                  border: "1px solid #ccc", 
                  padding: "1.5rem", 
                  borderRadius: "8px" 
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h3>{binderName} ({cards.length} cards)</h3>
                    <button 
                      onClick={() => {
                        if (window.confirm(`Delete entire ${binderName} binder?`)) {
                          setBinders(prev => {
                            const newBinders = { ...prev };
                            delete newBinders[binderName];
                            return newBinders;
                          });
                        }
                      }}
                      style={{ padding: "0.5rem", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px" }}
                    >
                      Delete Binder
                    </button>
                  </div>
                  
                  {cards.map((card, idx) => (
                    <div key={idx} style={{
                      border: "1px solid #eee",
                      padding: "1rem",
                      marginBottom: "1rem",
                      borderRadius: "4px",
                      position: "relative"
                    }}>
                      {editingCard && editingCard.id === card.id ? (
                        <CardEditForm
                          card={card}
                          binderName={binderName}
                          onSave={updateCard}
                          onCancel={() => setEditingCard(null)}
                        />
                      ) : (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ margin: "0 0 0.5rem 0" }}>{card.name}</h4>
                              <p style={{ margin: "0.25rem 0", fontSize: "0.9rem" }}>
                                Set: {card.set?.name} | ID: {card.id} | Rarity: {card.rarity || "N/A"}
                              </p>
                              <p style={{ margin: "0.25rem 0", fontSize: "0.9rem" }}>
                                Quantity: {card.quantity} | Condition: {card.condition}
                                {card.grade && ` | Grade: ${card.grade}`}
                              </p>
                              <p style={{ margin: "0.25rem 0", fontSize: "0.9rem", fontWeight: "bold" }}>
                                Price: ${card.adjustedPrice || calculateAdjustedPrice(card, card.condition, card.grade)}
                              </p>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                              <button 
                                onClick={() => startEditing(binderName, card)}
                                style={{ padding: "0.25rem 0.5rem", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", fontSize: "0.8rem" }}
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => {
                                  if (window.confirm(`Remove ${card.name} from ${binderName}?`)) {
                                    removeCard(binderName, card.id);
                                  }
                                }}
                                style={{ padding: "0.25rem 0.5rem", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", fontSize: "0.8rem" }}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          {card.tcgplayer?.url && (
                            <a href={card.tcgplayer.url} target="_blank" rel="noreferrer" style={{ fontSize: "0.8rem", color: "blue", display: "block", marginTop: "0.5rem" }}>
                              View on TCGPlayer
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}