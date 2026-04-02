const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');

// Formatimi i datave 
function formatDateTime(date) {
  if (!date) return null;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}


function formatDuration(duration) {
  if (!duration) return null;

  if (duration instanceof Date) {
    return duration.toTimeString().slice(0, 8);
  }

  if (typeof duration === 'string') {
    if (duration.length >= 19) {
      // ISO string me date, merr pjesën e kohës
      return duration.slice(11, 19);
    }
    if (duration.length === 5) {
      // "HH:mm" -> "HH:mm:ss"
      return `${duration}:00`;
    }
    return duration;
  }

  return duration;
}


function prepareDuration(duration) {
  if (!duration) return null;
  if (typeof duration === 'string' && duration.length === 5) {
    return `${duration}:00`;
  }
  return duration;
}

// CREATE
async function createMovie(movie) {
  const {
    title, genre, age_Restriction, description, duration,
    language, subtitled, format, status, posterPath,
    createdBy, updatedBy
  } = movie;

  try {
    await sql.connect(dbConfig);
    await new sql.Request()
      .input('title', sql.NVarChar(100), title)
      .input('genre', sql.NVarChar(50), genre)
      .input('age_Restriction', sql.VarChar(3), age_Restriction)
      .input('description', sql.NVarChar(sql.MAX), description)
      .input('duration', sql.Time, prepareDuration(duration))
      .input('language', sql.NVarChar(50), language)
      .input('subtitled', sql.Bit, subtitled)
      .input('format', sql.NVarChar(5), format)
      .input('status', sql.NVarChar(50), status)
      .input('posterPath', sql.NVarChar(255), posterPath)
      .input('createdBy', sql.NVarChar(50), createdBy)
      .input('updatedBy', sql.NVarChar(50), updatedBy)
      .query(`
        INSERT INTO Movie (
          title, genre, age_Restriction, description, duration,
          language, subtitled, format, status, posterPath,
          createdBy, updatedBy
        )
        VALUES (
          @title, @genre, @age_Restriction, @description, @duration,
          @language, @subtitled, @format, @status, @posterPath,
          @createdBy, @updatedBy
        )
      `);
    return { message: 'Movie created successfully' };
  } catch (err) {
    console.error('Error creating movie:', err);
    throw err;
  }
}

// READ ALL
async function getAllMovies() {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request().query('SELECT * FROM Movie');

    return result.recordset.map(movie => ({
      ...movie,
      duration: formatDuration(movie.duration),
      createdAt: formatDateTime(movie.createdAt),
      updatedAt: movie.updatedAt ? formatDateTime(movie.updatedAt) : null
    }));
  } catch (err) {
    console.error('Error fetching movies:', err);
    throw err;
  }
}

// READ BY ID
async function getMovieById(movieId) {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request()
      .input('movieId', sql.Int, movieId)
      .query('SELECT * FROM Movie WHERE movieId = @movieId');

    if (result.recordset.length === 0) {
      throw new Error('Movie not found');
    }

    const movie = result.recordset[0];
    movie.duration = formatDuration(movie.duration);
    movie.createdAt = formatDateTime(movie.createdAt);
    movie.updatedAt = movie.updatedAt ? formatDateTime(movie.updatedAt) : null;

    return movie;
  } catch (err) {
    console.error('Error fetching movie by ID:', err);
    throw err;
  }
}

// UPDATE
async function updateMovie(movieId, movieData) {
  try {
    await sql.connect(dbConfig);

    const fields = [];
    const request = new sql.Request();
    request.input('movieId', sql.Int, movieId);

    for (const [key, value] of Object.entries(movieData)) {
      if (key === 'movieId') continue;

      fields.push(`${key} = @${key}`);

      switch (key) {
        case 'title':
        case 'genre':
        case 'language':
        case 'format':
        case 'status':
        case 'posterPath':
        case 'createdBy':
        case 'updatedBy':
          request.input(key, sql.NVarChar, value);
          break;
        case 'age_Restriction':
          request.input(key, sql.VarChar(3), value);
          break;
        case 'description':
          request.input(key, sql.NVarChar(sql.MAX), value);
          break;
        case 'duration':
          request.input(key, sql.Time, prepareDuration(value));
          break;
        case 'subtitled':
          request.input(key, sql.Bit, value);
          break;
        default:
          request.input(key, sql.NVarChar, value);
      }
    }

    if (fields.length === 0) {
      throw new Error('No valid fields provided for update');
    }

    fields.push('updatedAt = GETDATE()');

    const query = `
      UPDATE Movie SET
      ${fields.join(', ')}
      WHERE movieId = @movieId
    `;

    await request.query(query);

    return { message: 'Movie updated successfully' };

  } catch (err) {
    console.error('Error in updateMovie:', err);
    throw err;
  }
}

// DELETE
async function deleteMovie(movieId) {
  try {
    await sql.connect(dbConfig);
    await new sql.Request()
      .input('movieId', sql.Int, movieId)
      .query('DELETE FROM Movie WHERE movieId = @movieId');
    return { message: 'Movie deleted successfully' };
  } catch (err) {
    console.error('Error deleting movie:', err);
    throw err;
  }
}

module.exports = {
  createMovie,
  getAllMovies,
  getMovieById,
  updateMovie,
  deleteMovie
};
