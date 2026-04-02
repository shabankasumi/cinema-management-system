const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');

//CREATE - Only insert name and city
async function createCinema(cinemaData) {
  const { name, city } = cinemaData;

  try {
    await sql.connect(dbConfig);
    await new sql.Request()
      .input('name', sql.NVarChar(50), name)
      .input('city', sql.NVarChar(50), city)
      .query(`
        INSERT INTO Cinema (name, city)
        VALUES (@name, @city)
      `);

    return { message: 'Cinema created successfully' };
  } catch (err) {
    console.error('Error creating cinema:', err);
    throw err;
  }
}

//READ ALL - Only select cinemaId, name, city
async function getAllCinemas() {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request().query('SELECT cinemaId, name, city FROM Cinema ORDER BY cinemaId DESC');
    
    return result.recordset;
  } catch (err) {
    console.error('Error fetching cinemas:', err);
    throw err;
  }
}

//READ BY ID - Only select cinemaId, name, city
async function getCinemaById(cinemaId) {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request()
      .input('cinemaId', sql.Int, cinemaId)
      .query('SELECT cinemaId, name, city FROM Cinema WHERE cinemaId = @cinemaId');
    
    if (result.recordset.length === 0) {
      throw new Error('Cinema not found');
    }

    return result.recordset[0];
  } catch (err) {
    console.error('Error fetching cinema by ID:', err);
    throw err;
  }
}

//UPDATE - Only update name and city
async function updateCinema(cinemaId, cinemaData) {
  try {
    await sql.connect(dbConfig);

    const fields = [];
    const request = new sql.Request();
    request.input('cinemaId', sql.Int, cinemaId);

    // Only allow updating name and city
    if (cinemaData.name !== undefined) {
      fields.push('name = @name');
      request.input('name', sql.NVarChar(50), cinemaData.name);
    }

    if (cinemaData.city !== undefined) {
      fields.push('city = @city');
      request.input('city', sql.NVarChar(50), cinemaData.city);
    }

    if (fields.length === 0) {
      throw new Error('No valid fields provided for update');
    }

    const query = `
      UPDATE Cinema SET
      ${fields.join(', ')}
      WHERE cinemaId = @cinemaId
    `;

    await request.query(query);
    return { message: 'Cinema updated successfully' };

  } catch (err) {
    console.error('Error updating cinema:', err);
    throw err;
  }
}

//DELETE
async function deleteCinema(cinemaId) {
  try {
    await sql.connect(dbConfig);
    await new sql.Request()
      .input('cinemaId', sql.Int, cinemaId)
      .query('DELETE FROM Cinema WHERE cinemaId = @cinemaId');
    return { message: 'Cinema deleted successfully' };
  } catch (err) {
    console.error('Error deleting cinema:', err);
    throw err;
  }
}

module.exports = {
  createCinema,
  getAllCinemas,
  getCinemaById,
  updateCinema,
  deleteCinema
};