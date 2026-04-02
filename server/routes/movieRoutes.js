const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin, requireUser } = require('../middleware/authMiddleware');

const {
  createMovie,
  getAllMovies,
  getMovieById,
  updateMovie,
  deleteMovie
} = require('../models/movieModel'); 


function isValidDuration(dur) {
  return /^([0-1]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/.test(dur);
}

// CREATE
router.post('/',authenticateToken,requireAdmin, async (req, res) => {
  try {
    const movie = req.body;

    if (movie.duration && !isValidDuration(movie.duration)) {
      return res.status(400).json({ error: 'Invalid duration format. Expected HH:mm or HH:mm:ss' });
    }

    const result = await createMovie(movie);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL 
router.get('/', async (req, res) => {
  try {
    const movies = await getAllMovies();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ BY ID 
router.get('/:id', async (req, res) => {
  try {
    const movieId = parseInt(req.params.id, 10);
    const movie = await getMovieById(movieId);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id',authenticateToken, requireAdmin, async (req, res) => {
  try {
    const movieId = parseInt(req.params.id, 10);
    const movieData = req.body;

    if (movieData.duration && !isValidDuration(movieData.duration)) {
      return res.status(400).json({ error: 'Invalid duration format. Expected HH:mm or HH:mm:ss' });
    }

    const result = await updateMovie(movieId, movieData);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE 
router.delete('/:id',authenticateToken, requireAdmin, async (req, res) => {
  try {
    const movieId = parseInt(req.params.id, 10);
    const result = await deleteMovie(movieId);
    res.json(result);
  } catch (err) {
    if (err.status === 409) {
      return res.status(409).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
