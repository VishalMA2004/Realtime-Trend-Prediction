import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const createToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: user.full_name
    },
    env.jwtSecret,
    { expiresIn: "7d" }
  );
