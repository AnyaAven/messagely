import express from "express";
import jwt from "jsonwebtoken";
import { BadRequestError, UnauthorizedError } from "../expressError.js";

const router = new express.Router();

import User from "../models/user.js";
import { SECRET_KEY } from "../config.js";

/** POST /login: {username, password} => {token} */
router.post("/login", async function (req, res){
  if (req.body === undefined) throw new BadRequestError();

  const { username, password } = req.body;

  if (await User.authenticate(username, password)) {
    const token = jwt.sign({ username }, SECRET_KEY);
    await User.updateLoginTimestamp(username);

    return res.json({ token });
  }

  throw new UnauthorizedError();
});


/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", async function (req, res){
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
