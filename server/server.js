const express = require('express');
const cors = require('cors'); 
require('dotenv').config(); // Load environment variables
const sql = require('mssql');
const dbConfig = require('./config/db');
const initializeDatabase = require('./migrations/initializeDatabase'); 
const cinemaRoutes = require('./routes/cinemaRoutes');
const movieRoutes = require('./routes/movieRoutes');
const usersRoutes = require('./routes/usersRoutes');
const adminRoutes = require('./routes/adminRoutes');
const clientRoutes = require('./routes/clientRoutes');
const ticketsRoutes = require('./routes/ticketsRoutes');
const eventsRoutes = require('./routes/eventsRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const authRoutes = require('./routes/authRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

 //Connect to MSSQL
sql.connect(dbConfig)
    .then(async () => {
        console.log('MSSQL connected successfully');
        await initializeDatabase(); // krijohen tabelat
    })
    .catch(err => console.error('MSSQL connection error:', err));


    // Routes for entity
    app.use('/api/cinemas', cinemaRoutes);
    app.use('/api/movies', movieRoutes);
    app.use('/api/users',   usersRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/clients', clientRoutes);
    app.use('/api/tickets', ticketsRoutes);
    app.use('/api/events', eventsRoutes);
    app.use('/api/reservations', reservationRoutes);
    app.use('/api/auth', authRoutes);



    // per kapjen e gabimeve
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({ error: 'Internal server error' });
  });


    app.get('/', (req, res) => {
         res.send('Server is running');
    });

// Start the server

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
