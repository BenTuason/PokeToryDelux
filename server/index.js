import express from "express";
import cors from "cors";
import pokemon from "pokemontcgsdk";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Configure the SDK with your API key
pokemon.configure({ apiKey: "<YOUR_API_KEY>" });

// Lookup card by ID (only essential fields)
app.get("/api/card/:id", async (req, res) => {
  const cardId = req.params.id;
  try {
    const card = await pokemon.card.find(cardId, {
      select: "id,name,set,images,rarity,tcgplayer",
    });
    res.json({ data: card });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch card" });
  }
});

// Search cards by name (only essential fields, limit to 50 results)
app.get("/api/search", async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: "Missing name parameter" });

  try {
    const result = await pokemon.card.where({
      q: `name:${name}`,
      pageSize: 50,
      select: "id,name,set,images,rarity,tcgplayer",
    });
    res.json({ data: result.data });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to search cards" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
