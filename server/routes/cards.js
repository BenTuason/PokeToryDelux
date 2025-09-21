import express from "express";
import Card from "../models/Card.js";

const router = express.Router();

// GET all workouts
router.get('/', (req, res) => {
  res.json({mssg: 'GET all cards'})
})

// GET a single card
router.get('/:id', (req, res) => {
  res.json({mssg: 'GET a single card'})
})

// POST a new card
router.post('/', async (req, res) => {
  const {name, set, id, rarity, marketPrice, binder} = req.body
  
  try {
    const card = await Card.create({name, set, id, rarity, marketPrice, binder})
    res.status(200).json(card)
  } catch (error) {
    res.status(400).json({error: error.message})
  }
})

// DELETE a card
router.delete('/:id', (req, res) => {
  res.json({mssg: 'DELETE a card'})
})

// UPDATE a card
router.patch('/:id', (req, res) => {
  res.json({mssg: 'UPDATE a card'})
})

export default router;