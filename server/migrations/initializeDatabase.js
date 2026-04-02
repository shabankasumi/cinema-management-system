const sql = require('mssql');
const dbConfig = require('../config/db');

async function initializeDatabase() {
    try {
        const pool = await sql.connect(dbConfig);

        // 1. Cinema
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Cinema' AND xtype='U')
            CREATE TABLE Cinema (
                cinemaId INT PRIMARY KEY IDENTITY(1,1),
                city NVARCHAR(50) NOT NULL,
                name NVARCHAR(50) NOT NULL
            )
        `);
        console.log('Tabela Cinema u krijua me sukses!');

        // 2. Movie
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Movie' AND xtype='U')
            CREATE TABLE Movie (
                movieId INT PRIMARY KEY IDENTITY(1,1),
                title NVARCHAR(100) NOT NULL,
                genre NVARCHAR(50) NOT NULL,
                age_Restriction VARCHAR(3) NOT NULL CHECK (age_Restriction IN ('+6', '+12', '+15', '+18', '+21')),
                description NVARCHAR(MAX),
                duration TIME NOT NULL,
                language NVARCHAR(50) NOT NULL,
                subtitled BIT DEFAULT 0,
                format NVARCHAR(5) NOT NULL DEFAULT '2D' CHECK (format IN ('2D', '3D', 'IMAX', '4DX')),
                status NVARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
                posterPath NVARCHAR(255),
                createdAt DATETIME DEFAULT GETDATE(),
                createdBy NVARCHAR(50) NOT NULL,
                updatedAt DATETIME,
                updatedBy NVARCHAR(50)
            )
        `);
        console.log('Tabela Movie u krijua me sukses!');

        // 3. Users
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
            CREATE TABLE Users (
                userId INT PRIMARY KEY IDENTITY(1,1),
                username NVARCHAR(50) NOT NULL UNIQUE,
                firstName NVARCHAR(50) NOT NULL,
                lastName NVARCHAR(50) NOT NULL,
                gender NVARCHAR(10),
                date_of_birth DATE,
                address NVARCHAR(100),
                zipCode NVARCHAR(10),
                city NVARCHAR(50),
                phoneNumber NVARCHAR(20) UNIQUE,
                passwordHash VARBINARY(255) NOT NULL,
                role NVARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Client')),
                createdAt DATETIME DEFAULT GETDATE(),
                createdBy NVARCHAR(100),
                updatedAt DATETIME,
                updatedBy NVARCHAR(100),
                cinemaId INT,
                FOREIGN KEY (cinemaId) REFERENCES Cinema(cinemaId) ON DELETE SET NULL
            )
        `);
        console.log('Tabela Users u krijua me sukses!');

        // 4. Admin
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Admin' AND xtype='U')
            CREATE TABLE Admin (
                adminId INT PRIMARY KEY IDENTITY(1,1),
                responsibility NVARCHAR(255),
                userId INT NOT NULL,
                FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE
            )
        `);
        console.log('Tabela Admin u krijua me sukses!');

        // 5. Client
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Client' AND xtype='U')
            CREATE TABLE Client (
                clientId INT PRIMARY KEY IDENTITY(1,1),
                status NVARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
                userId INT NOT NULL,
                FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE
            )
        `);
        console.log('Tabela Client u krijua me sukses!');

        // 6. Events
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Events' AND xtype='U')
            CREATE TABLE Events (
                eventId INT PRIMARY KEY IDENTITY(1,1),
                title NVARCHAR(100) NOT NULL,
                description NVARCHAR(MAX),
                date DATE NOT NULL,
                time TIME NOT NULL,
                hallName NVARCHAR(50) NOT NULL,
                maxTickets INT NOT NULL,
                ticketPrice DECIMAL(10,2) NOT NULL ,
                bookedTickets INT NOT NULL,
                posterPath NVARCHAR(255),
                status NVARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
                createdAt DATETIME DEFAULT GETDATE(),
                createdBy NVARCHAR(100),
                updatedAt DATETIME,
                updatedBy NVARCHAR(100)
            )
        `);
        console.log('Tabela Events u krijua me sukses!');

        // 7. Reservations
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Reservations' AND xtype='U')
     CREATE TABLE Reservations (
    reservationId INT PRIMARY KEY IDENTITY(1,1),
    clientId INT NOT NULL,
    eventId INT NOT NULL,
    seatNumber INT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    createdBy NVARCHAR(100),

    CONSTRAINT FK_Reservations_Users
        FOREIGN KEY (clientId) REFERENCES Users(userId),

    CONSTRAINT FK_Reservations_Events
        FOREIGN KEY (eventId) REFERENCES Events(eventId),

    CONSTRAINT UQ_Event_Seat
        UNIQUE (eventId, seatNumber)
);
        `);
        console.log('Tabela Reservations u krijua me sukses!');

        // 8. Tickets
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Tickets' AND xtype='U')
            CREATE TABLE Tickets (
    ticketId INT PRIMARY KEY IDENTITY(1,1),
    reservationId INT NOT NULL,
    clientName NVARCHAR(100) NOT NULL,
    eventTitle NVARCHAR(100) NOT NULL,
    eventDate DATE NOT NULL,
    eventTime TIME NOT NULL,
    hallName NVARCHAR(50) NOT NULL,
    seatNumber INT NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'Active',
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Tickets_Reservations
        FOREIGN KEY (reservationId) REFERENCES Reservations(reservationId)
        ON DELETE CASCADE
);
        `);
        console.log('Tabela Tickets u krijua me sukses!');

        // 9. RefreshTokens
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RefreshTokens' AND xtype='U')
            CREATE TABLE RefreshTokens (
                tokenId INT PRIMARY KEY IDENTITY(1,1),
                userId INT NOT NULL,
                token NVARCHAR(500) NOT NULL,
                expiresAt DATETIME NOT NULL,
                createdAt DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE
            )
        `);
        console.log('Tabela RefreshTokens u krijua me sukses!');

    } catch (err) {
        console.error('Gabim gjate inicializimit te databazes:', err.message);
    }
}

module.exports = initializeDatabase;