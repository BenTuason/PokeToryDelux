export default function Home({ binders }) {
  return (
    <div>
      <h2>Available Binders</h2>
      
      {Object.keys(binders).length === 0 ? (
        <p>No binders available yet. Check back later!</p>
      ) : (
        <div>
          {Object.entries(binders).map(([binderName, cards]) => (
            <div key={binderName} style={{ 
              marginBottom: "2rem", 
              border: "1px solid #ccc", 
              padding: "1rem", 
              borderRadius: "8px" 
            }}>
              <h3>{binderName} ({cards.length} cards)</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
                {cards.map((card, idx) => {
                  // Get the market price
                  const priceEntry = card.tcgplayer?.prices ? Object.entries(card.tcgplayer.prices)[0] : null;
                  const marketPrice = priceEntry ? priceEntry[1].market : "N/A";
                  
                  return (
                    <div key={idx} style={{
                      border: "1px solid #eee",
                      padding: "0.5rem",
                      borderRadius: "4px"
                    }}>
                      <h4 style={{ margin: "0 0 0.5rem 0" }}>{card.name}</h4>
                      <p style={{ margin: "0.25rem 0", fontSize: "0.9rem" }}>
                        Set: {card.set?.name}
                      </p>
                      <p style={{ margin: "0.25rem 0", fontSize: "0.9rem" }}>
                        ID: {card.id} | Rarity: {card.rarity || "N/A"}
                      </p>
                      <p style={{ margin: "0.25rem 0", fontSize: "0.9rem", fontWeight: "bold" }}>
                        Price: ${marketPrice}
                      </p>
                      {card.tcgplayer?.url && (
                        <a 
                          href={card.tcgplayer.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ fontSize: "0.8rem", color: "blue" }}
                        >
                          View on TCGPlayer
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}