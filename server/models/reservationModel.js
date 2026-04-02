const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');

async function createReservation(data) {
  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input('clientId', sql.Int, data.clientId)
      .input('eventId', sql.Int, data.eventId)
      .input('seatNumber', sql.Int, data.seatNumber)
      .input('createdBy', sql.NVarChar(100), data.createdBy || null)
      .query(`
        INSERT INTO Reservations (
          clientId,
          eventId,
          seatNumber,
          createdBy
        )
        OUTPUT INSERTED.*
        VALUES (
          @clientId,
          @eventId,
          @seatNumber,
          @createdBy
        )
      `);

    return result.recordset[0];
  } catch (err) {
    console.error('Error creating reservation:', err);
    throw err;
  }
}

async function getAllReservations() {
  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request().query(`
      SELECT *
      FROM Reservations
      ORDER BY reservationId DESC
    `);

    return result.recordset;
  } catch (err) {
    console.error('Error in getAllReservations:', err);
    throw err;
  }
}

async function getReservationsByClient(clientId) {
  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input('clientId', sql.Int, clientId)
      .query(`
        SELECT *
        FROM Reservations
        WHERE clientId = @clientId
        ORDER BY reservationId DESC
      `);

    return result.recordset;
  } catch (err) {
    console.error('Error in getReservationsByClient:', err);
    throw err;
  }
}

async function getReservationById(reservationId) {
  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input('reservationId', sql.Int, reservationId)
      .query(`
        SELECT *
        FROM Reservations
        WHERE reservationId = @reservationId
      `);

    return result.recordset[0];
  } catch (err) {
    console.error('Error in getReservationById:', err);
    throw err;
  }
}

async function getReservedSeatsByEvent(eventId) {
  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input('eventId', sql.Int, eventId)
      .query(`
        SELECT seatNumber
        FROM Reservations
        WHERE eventId = @eventId
        ORDER BY seatNumber ASC
      `);

    return result.recordset.map(row => row.seatNumber);
  } catch (err) {
    console.error('Error in getReservedSeatsByEvent:', err);
    throw err;
  }
}

async function deleteReservation(reservationId) {
  try {
    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input('reservationId', sql.Int, reservationId)
      .query(`
        DELETE FROM Reservations
        WHERE reservationId = @reservationId
      `);

    return { message: 'Reservation deleted successfully' };
  } catch (err) {
    console.error('Error in deleteReservation:', err);
    throw err;
  }
}

module.exports = {
  createReservation,
  getAllReservations,
  getReservationsByClient,
  getReservationById,
  getReservedSeatsByEvent,
  deleteReservation
};