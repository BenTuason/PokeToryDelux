import express from "express";
import cors from "cors";
import pokemon from "pokemontcgsdk";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cardsRouter from "./routes/cards.js";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/api/cards", cardsRouter);

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('connected to database')
    // listen to requests from port
    app.listen(process.env.PORT, () => {
      console.log('listening for requests on port', process.env.PORT)
    })
  })
  .catch((err) => {
    console.log(err)
  }) 


pokemon.configure({ apiKey: "<YOUR_API_KEY>" });

app.get("/api/search", async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: "Missing name parameter" });

  try {
    const result = await pokemon.card.where({
      q: `name:${name}`,
      pageSize: 250,
      select: "id,name,set,rarity,tcgplayer", 
    });
    res.json({ data: result.data });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to search cards" });
  }
});

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


