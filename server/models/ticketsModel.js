const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');

async function createTicket(ticketData) {
  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input('reservationId', sql.Int, ticketData.reservationId)
      .input('clientName', sql.NVarChar(100), ticketData.clientName)
      .input('eventTitle', sql.NVarChar(100), ticketData.eventTitle)
      .input('eventDate', sql.Date, ticketData.eventDate)
      .input('eventTime', sql.Time, ticketData.eventTime)
      .input('hallName', sql.NVarChar(50), ticketData.hallName)
      .input('seatNumber', sql.Int, ticketData.seatNumber)
      .input('status', sql.NVarChar(50), ticketData.status || 'Active')
      .query(`
        INSERT INTO Tickets (
          reservationId,
          clientName,
          eventTitle,
          eventDate,
          eventTime,
          hallName,
          seatNumber,
          status
        )
        OUTPUT INSERTED.*
        VALUES (
          @reservationId,
          @clientName,
          @eventTitle,
          @eventDate,
          @eventTime,
          @hallName,
          @seatNumber,
          @status
        )
      `);

    return result.recordset[0];
  } catch (err) {
    console.error('Error in createTicket:', err);
    throw err;
  }
}

async function getAllTickets() {
  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request().query(`
      SELECT *
      FROM Tickets
      ORDER BY ticketId DESC
    `);

    return result.recordset;
  } catch (err) {
    console.error('Error in getAllTickets:', err);
    throw err;
  }
}

async function getTicketsByClientName(clientName) {
  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input('clientName', sql.NVarChar(100), clientName)
      .query(`
        SELECT *
        FROM Tickets
        WHERE clientName = @clientName
        ORDER BY ticketId DESC
      `);

    return result.recordset;
  } catch (err) {
    console.error('Error in getTicketsByClientName:', err);
    throw err;
  }
}

module.exports = {
  createTicket,
  getAllTickets,
  getTicketsByClientName
};