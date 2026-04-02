const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');

function formatDateTime(date) {
  if (!date) return null;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

function formatDate(date) {
  if (!date) return null;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

//CREATE
async function createUser(user) {
  try {
    await sql.connect(dbConfig);

    const {
      username, 
      firstName,
      lastName,
      gender,
      date_of_birth,
      address,
      zipCode,
      city,
      phoneNumber,
      passwordHash, 
      role,
      cinemaId,
      createdBy
    } = user;

    const pwBuffer = passwordHash
      ? (Buffer.isBuffer(passwordHash) ? passwordHash : Buffer.from(passwordHash, 'utf-8'))
      : null;

    const insertUser = await new sql.Request()
      .input("username", sql.NVarChar, username) 
      .input("firstName", sql.NVarChar, firstName)
      .input("lastName", sql.NVarChar, lastName)
      .input("gender", sql.NVarChar, gender)
      .input("date_of_birth", sql.Date, date_of_birth)
      .input("address", sql.NVarChar, address)
      .input("zipCode", sql.NVarChar, zipCode)
      .input("city", sql.NVarChar, city)
      .input("phoneNumber", sql.NVarChar, phoneNumber)
      .input("passwordHash", sql.VarBinary, pwBuffer)
      .input("role", sql.NVarChar, role)
      .input("cinemaId", sql.Int, cinemaId)
      .input("createdAt", sql.DateTime, new Date())
      .input("createdBy", sql.NVarChar, createdBy)
      .query(`
        INSERT INTO Users 
          (username, firstName, lastName, gender, date_of_birth, address, zipCode, city, phoneNumber, passwordHash, role, cinemaId, createdAt, createdBy)
        VALUES
          (@username, @firstName, @lastName, @gender, @date_of_birth, @address, @zipCode, @city, @phoneNumber, @passwordHash, @role, @cinemaId, @createdAt, @createdBy);
        SELECT SCOPE_IDENTITY() AS userId;
      `);

    const userId = insertUser.recordset[0].userId;

    if (role === "Admin") {
      await new sql.Request()
        .input("userId", sql.Int, userId)
        .query(`INSERT INTO Admin (responsibility, userId) VALUES ('Default Responsibility', @userId)`);
    } else if (role === "Client") {
      await new sql.Request()
        .input("userId", sql.Int, userId)
        .query(`INSERT INTO Client (status, userId) VALUES ('Active', @userId)`);
    }

    return { message: "User created successfully", userId };
  } catch (err) {
    console.error("Error creating user:", err);
    throw err;
  }
}

//READ
async function getAllUsers() {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query("SELECT * FROM Users");
    return result.recordset.map(user => ({
      ...user,
      createdAt: formatDateTime(user.createdAt),
      updatedAt: formatDateTime(user.updatedAt),
      date_of_birth: formatDate(user.date_of_birth),
      passwordHash: user.passwordHash ? user.passwordHash.toString('base64') : null
    }));
  } catch (err) {
    console.error("Error getting all users:", err);
    throw err;
  }
}

async function getUserById(id) {
  try {
    await sql.connect(dbConfig);
    const request = new sql.Request();
    request.input("userId", sql.Int, id);
    const result = await request.query("SELECT * FROM Users WHERE userId = @userId");
    if (result.recordset.length === 0) return null;
    const user = result.recordset[0];
    return {
      ...user,
      createdAt: formatDateTime(user.createdAt),
      updatedAt: formatDateTime(user.updatedAt),
      date_of_birth: formatDate(user.date_of_birth),
      passwordHash: user.passwordHash ? user.passwordHash.toString('base64') : null
    };
  } catch (err) {
    console.error("Error getting user by ID:", err);
    throw err;
  }
}

//UPDATE
async function updateUser(id, user) {
  try {
    await sql.connect(dbConfig);

    const {
      username, // added username
      firstName,
      lastName,
      gender,
      date_of_birth,
      address,
      zipCode,
      city,
      phoneNumber,
      passwordHash,
      role,
      updatedBy
    } = user;

    const updatedAt = new Date();

    const pwBuffer = passwordHash
      ? (Buffer.isBuffer(passwordHash) ? passwordHash : Buffer.from(passwordHash, 'utf-8'))
      : null;

    await new sql.Request()
      .input("userId", sql.Int, id)
      .input("username", sql.NVarChar, username)
      .input("firstName", sql.NVarChar, firstName)
      .input("lastName", sql.NVarChar, lastName)
      .input("gender", sql.NVarChar, gender)
      .input("date_of_birth", sql.Date, date_of_birth)
      .input("address", sql.NVarChar, address)
      .input("zipCode", sql.NVarChar, zipCode)
      .input("city", sql.NVarChar, city)
      .input("phoneNumber", sql.NVarChar, phoneNumber)
      .input("passwordHash", sql.VarBinary, pwBuffer)
      .input("role", sql.NVarChar, role)
      .input("updatedAt", sql.DateTime, updatedAt)
      .input("updatedBy", sql.NVarChar, updatedBy)
      .query(`
        UPDATE Users SET
          username = @username,
          firstName = @firstName,
          lastName = @lastName,
          gender = @gender,
          date_of_birth = @date_of_birth,
          address = @address,
          zipCode = @zipCode,
          city = @city,
          phoneNumber = @phoneNumber,
          passwordHash = @passwordHash,
          role = @role,
          updatedAt = @updatedAt,
          updatedBy = @updatedBy
        WHERE userId = @userId
      `);

    return { message: "User updated successfully" };
  } catch (err) {
    console.error("Error updating user:", err);
    throw err;
  }
}
//delete
async function deleteUser(id) {
  try {
    await sql.connect(dbConfig);

    // Merr rolin e perdoruesit
    const userResult = await new sql.Request()
      .input("userId", sql.Int, id)
      .query("SELECT role FROM Users WHERE userId = @userId");

    if (userResult.recordset.length === 0) {
      return { message: "User not found" };
    }

    const role = userResult.recordset[0].role;

    // Fshije nga Admin ose Client para Users
    if (role === "Admin") {
      await new sql.Request()
        .input("userId", sql.Int, id)
        .query("DELETE FROM Admin WHERE userId = @userId");
    } else if (role === "Client") {
      await new sql.Request()
        .input("userId", sql.Int, id)
        .query("DELETE FROM Client WHERE userId = @userId");
    }

    // Pastaj fshije nga Users
    await new sql.Request()
      .input("userId", sql.Int, id)
      .query("DELETE FROM Users WHERE userId = @userId");

    return { message: "User deleted successfully" };
  } catch (err) {
    console.error("Error deleting user:", err);
    throw err;
  }
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};
