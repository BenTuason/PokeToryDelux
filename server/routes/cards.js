import express from "express";
import Card from "../models/Card.js";

const router = express.Router();

// Add a card to a binder
router.post("/", async (req, res) => {
  try {
    const card = new Card(req.body);
    await card.save();
    res.status(201).json(card);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all cards in a binder
router.get("/binder/:binder", async (req, res) => {
  try {
    const cards = await Card.find({ binder: req.params.binder });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a card
router.put("/:id", async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(card);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a card
router.delete("/:id", async (req, res) => {
  try {
    await Card.findByIdAndDelete(req.params.id);
    res.json({ message: "Card deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;