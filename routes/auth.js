import express from "express";
import jwt from "jsonwebtoken";
import { BadRequestError, UnauthorizedError } from "../expressError";

const router = new express.Router();

import User from "../models/user";
import { SECRET_KEY } from "../config";

/** POST /login: {username, password} => {token} */
router.post("/login", async (req, res) => {
  if (req.body === undefined) throw new BadRequestError();

  const { username, password } = req.body;

  if (await User.authenticate(username, password)) {
    const token = jwt.sign({ username }, SECRET_KEY);
    return res.json({ token });
  } else {
    res.status(401)
    throw new UnauthorizedError();
  }

});


/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", async (req, res) => {
  if (req.body === undefined) throw new BadRequestError();

  let user;
  try {
    user = await User.register(req.body);
  } catch (err) {
    throw new BadRequestError();
  }

  const token = jwt.sign({ username: user.username }, SECRET_KEY);

  return res.status(201).json({ token });
});

export default router;
