const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3600;

// --- MongoDB Connection ---
const MONGO_URI = 'mongodb://127.0.0.1:27017/pantryGeniusDB';

mongoose.connect(MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB.'))
    .catch(err => console.error('Connection error', err));

// --- Mongoose Schema and Model ---
const recipeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ingredients: { type: [String], required: true },
    instructions: { type: [String], required: true },
    ratings: { type: [Number], default: [] },
    imageUrl: { type: String, default: 'https://placehold.co/400x300/f8f8f8/ccc?text=Recipe' }
});

const Recipe = mongoose.model('Recipe', recipeSchema);


// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));


// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/recipes', async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: "Error fetching recipes", error: error });
    }
});

app.post('/api/recipes', async (req, res) => {
    const { name, ingredients, instructions } = req.body;
    
    if (!name || !ingredients || !instructions) {
        return res.status(400).json({ message: "Invalid recipe data" });
    }
    
    // Generate a random placeholder image for new recipes
    const colors = ['FF7E5F', 'FEB47B', 'D4A5A5', 'A5D4A5', 'A5A5D4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const imageUrl = `https://placehold.co/400x300/${randomColor}/FFFFFF?text=${encodeURIComponent(name)}`;

    const newRecipe = new Recipe({
        name,
        ingredients,
        instructions,
        imageUrl,
        ratings: []
    });

    try {
        const savedRecipe = await newRecipe.save();
        console.log('Added new recipe:', savedRecipe.name);
        res.status(201).json(savedRecipe);
    } catch (error) {
        res.status(500).json({ message: "Error saving recipe", error: error });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Serving files from:', __dirname);
});

