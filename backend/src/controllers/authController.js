import bcrypt from "bcryptjs";
import { getPool } from "../config/db.js";
import { createToken } from "../utils/token.js";

export const register = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Full name, email, and password are required." });
  }

  try {
    const pool = getPool();
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);

    if (existing.length) {
      return res.status(409).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)",
      [fullName, email, hashedPassword]
    );
    const user = { id: result.insertId, full_name: fullName, email };

    return res.status(201).json({
      token: createToken(user),
      user: { id: user.id, fullName, email }
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to create account.", detail: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    return res.json({
      token: createToken(user),
      user: { id: user.id, fullName: user.full_name, email: user.email }
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to login.", detail: error.message });
  }
};
