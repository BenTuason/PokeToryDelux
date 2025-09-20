import express from "express";
import cors from "cors";
import pokemon from "pokemontcgsdk";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Configure the SDK with your API key
pokemon.configure({ apiKey: "<YOUR_API_KEY>" });

// Search cards by PokÃ©mon name (fast, essential fields)
app.get("/api/search", async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: "Missing name parameter" });

  try {
    const result = await pokemon.card.where({
      q: `name:${name}`,
      pageSize: 250,
      select: "id,name,set,rarity,tcgplayer", // only essential fields
    });
    res.json({ data: result.data });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to search cards" });
  }
});

// Get a single card by ID (fast, essential fields)
app.get("/api/card/:id", async (req, res) => {
  const cardId = req.params.id;
  try {
    const card = await pokemon.card.find(cardId, {
      select: "id,name,set,rarity,tcgplayer",
    });
    res.json({ data: card });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch card" });
  }
});

// Lookup card by set + collector number (fast, unique result)
app.get("/api/lookup", async (req, res) => {
  const { set, number } = req.query; // e.g., ?set=rc&number=20
  if (!set || !number) return res.status(400).json({ error: "Missing set or number" });

  try {
    const result = await pokemon.card.where({
      q: `set.id:${set} number:${number}`,
      pageSize: 1, // only 1 result, collector numbers are unique
      select: "id,name,set,rarity,tcgplayer",
    });
    res.json({ data: result.data[0] || null });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch card by number" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));