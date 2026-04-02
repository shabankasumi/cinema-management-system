const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');

async function getAllEvents() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT *
      FROM Events
      ORDER BY date ASC, time ASC
    `);
    return result.recordset;
  } catch (err) {
    console.error('Error in getAllEvents:', err);
    throw err;
  }
}

async function getEventById(eventId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('eventId', sql.Int, eventId)
      .query(`
        SELECT *
        FROM Events
        WHERE eventId = @eventId
      `);

    return result.recordset[0];
  } catch (err) {
    console.error('Error in getEventById:', err);
    throw err;
  }
}

async function createEvent(event) {
  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input('title', sql.NVarChar(100), event.title)
      .input('description', sql.NVarChar(sql.MAX), event.description || null)
      .input('date', sql.Date, event.date)
      .input('time', sql.Time, event.time)
      .input('hallName', sql.NVarChar(50), event.hallName)
      .input('maxTickets', sql.Int, event.maxTickets)
      .input('ticketPrice', sql.Decimal(10, 2), event.ticketPrice)
      .input('posterPath', sql.NVarChar(255), event.posterPath || null)
      .input('status', sql.NVarChar(50), event.status || 'Active')
      .input('createdBy', sql.NVarChar(100), event.createdBy || null)
      .query(`
        INSERT INTO Events (
          title,
          description,
          date,
          time,
          hallName,
          maxTickets,
          ticketPrice,
          posterPath,
          status,
          createdBy
        )
        OUTPUT INSERTED.*
        VALUES (
          @title,
          @description,
          @date,
          @time,
          @hallName,
          @maxTickets,
          @ticketPrice,
          @posterPath,
          @status,
          @createdBy
        )
      `);

    return result.recordset[0];
  } catch (err) {
    console.error('Error in createEvent:', err);
    throw err;
  }
}

async function updateEvent(eventId, updates) {
  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input('eventId', sql.Int, eventId)
      .input('title', sql.NVarChar(100), updates.title)
      .input('description', sql.NVarChar(sql.MAX), updates.description || null)
      .input('date', sql.Date, updates.date)
      .input('time', sql.Time, updates.time)
      .input('hallName', sql.NVarChar(50), updates.hallName)
      .input('maxTickets', sql.Int, updates.maxTickets)
      .input('ticketPrice', sql.Decimal(10, 2), updates.ticketPrice)
      .input('posterPath', sql.NVarChar(255), updates.posterPath || null)
      .input('status', sql.NVarChar(50), updates.status || 'Active')
      .input('updatedBy', sql.NVarChar(100), updates.updatedBy || null)
      .query(`
        UPDATE Events
        SET
          title = @title,
          description = @description,
          date = @date,
          time = @time,
          hallName = @hallName,
          maxTickets = @maxTickets,
          ticketPrice = @ticketPrice,
          posterPath = @posterPath,
          status = @status,
          updatedAt = GETDATE(),
          updatedBy = @updatedBy
        WHERE eventId = @eventId
      `);

    return result;
  } catch (err) {
    console.error('Error in updateEvent:', err);
    throw err;
  }
}

async function deleteEvent(eventId) {
  try {
    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input('eventId', sql.Int, eventId)
      .query(`
        DELETE FROM Events
        WHERE eventId = @eventId
      `);

    return { message: 'Event deleted successfully' };
  } catch (err) {
    console.error('Error in deleteEvent:', err);
    throw err;
  }
}

async function incrementBookedTickets(eventId, count = 1) {
  try {
    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input('eventId', sql.Int, eventId)
      .input('count', sql.Int, count)
      .query(`
        UPDATE Events
        SET bookedTickets = ISNULL(bookedTickets, 0) + @count
        WHERE eventId = @eventId
      `);
  } catch (err) {
    console.error('Error in incrementBookedTickets:', err);
    throw err;
  }
}

async function decrementBookedTickets(eventId, count = 1) {
  try {
    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input('eventId', sql.Int, eventId)
      .input('count', sql.Int, count)
      .query(`
        UPDATE Events
        SET bookedTickets = CASE
          WHEN ISNULL(bookedTickets, 0) >= @count THEN bookedTickets - @count
          ELSE 0
        END
        WHERE eventId = @eventId
      `);
  } catch (err) {
    console.error('Error in decrementBookedTickets:', err);
    throw err;
  }
}

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  incrementBookedTickets,
  decrementBookedTickets
};