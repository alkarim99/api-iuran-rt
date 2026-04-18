const jwt = require("jsonwebtoken");
const {
  collActivityLogs,
  collActivityLogsUser,
  collActivityLogsWarga,
} = require("../config/database");

const getDecodedUser = (req) => {
  if (!req?.headers?.authorization) return null;
  const token = req.headers.authorization.slice(7);
  try {
    return jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  } catch (e) {
    return null;
  }
};

/**
 * Helper to create an audit log entry in the database.
 * @param {Object} req - The Express request object.
 * @param {string} action - Action performed (e.g. "CREATE", "UPDATE", "DELETE")
 * @param {string} entity - Module/Entity Name (e.g. "IURAN", "PENGELUARAN", "PENGHASILAN_LAINNYA")
 * @param {string} description - Brief description of the action.
 * @param {Object|null} oldData - Snapshot of data before mutation.
 * @param {Object|null} newData - Snapshot of data after mutation (or payload for create).
 * @param {string} targetDB - DB to store the log in ("payment", "user", "warga")
 */
const createLog = async (
  req,
  action,
  entity,
  description,
  oldData = null,
  newData = null,
  targetDB = "payment",
) => {
  try {
    let user_name = "System / Unknown";
    let user_id = null;

    const decoded = getDecodedUser(req);
    if (decoded) {
      user_name = decoded.name || decoded.username || "Admin";
      user_id = decoded._id || decoded.id || null;
    }

    const logEntry = {
      user_id,
      user_name,
      action,
      entity,
      description,
      old_data: oldData,
      new_data: newData,
      created_at: new Date(),
    };

    if (targetDB === "user") {
      await collActivityLogsUser.insertOne(logEntry);
    } else if (targetDB === "warga") {
      await collActivityLogsWarga.insertOne(logEntry);
    } else {
      await collActivityLogs.insertOne(logEntry);
    }
  } catch (err) {
    console.error("Failed to create audit log:", err);
  }
};

module.exports = { createLog };
