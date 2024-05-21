import express from "express";

const router = new express.Router();

import { ensureLoggedIn } from "../middleware/auth";

import User from "../models/user";
import Message from "../models/message";
import { UnauthorizedError, BadRequestError } from "../expressError";

//FIXME: test each route.

router.use(ensureLoggedIn);

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get(
  "/:id",
  async function (req, res){
    const username = res.locals.user.username;
    const msg = await Message.get(req.params.id);

    if (msg.from_user.username === username ||
      msg.to_user.username === username) {
      return res.json({ msg });
    }
    throw new UnauthorizedError;
  }
);

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/",
  async function (req, res){
    if (req.body === undefined) throw new BadRequestError();
    const currentUsername = res.locals.user.username;
    const msgRecipient = req.body.to_username;
    const msgBody = req.body.body;

    // Will throw a 404 if recipient doesn't exist in the DB
    await User.get(msgRecipient)

    const msg = await Message.create(currentUsername, msgRecipient, msgBody);

    return res.status(201).json({ msg })
  }
);

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read",
  async function (req, res) {
    if (req.body === undefined) throw new BadRequestError();

    const currUsername = res.locals.user.username;
    const msgId = req.params.id;
    const msg = await Message.get(msgId);

    //TODO: Update message to be more clear
    if(currUsername !== msg.to_user) throw new UnauthorizedError("Not your msg")

    const msgReadAtAndId = await Message.markRead(msgId);

    return res.json({ message:  msgReadAtAndId})
  }
);

export default router;