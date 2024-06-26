/** User of the site. */


import { NotFoundError } from "../expressError.js";
import db from "../db.js";
import bcrypt from "bcrypt";
import { BCRYPT_WORK_FACTOR } from "../config.js";

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hpwd = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users (username,
        password,
        first_name,
        last_name,
        phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING username, password, first_name, last_name, phone`,
      [username, hpwd, first_name, last_name, phone]
    );

    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password
         FROM users
         WHERE username = $1`,
      [username]);
    const user = result.rows[0];

    return (user && (await bcrypt.compare(password, user.password) === true));
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const results = await db.query(
      `UPDATE users
        SET last_login_at=CURRENT_TIMESTAMP
      WHERE username = $1
      RETURNING username
    `, [username]);

    const user = results.rows[0];
    if (user === undefined) throw new NotFoundError();
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const results = await db.query(
      `SELECT username,
              first_name,
              last_name
      FROM users
      ORDER BY last_name, first_name`);

    return results.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const results = await db.query(
      `SELECT username,
                  first_name,
                  last_name,
                  phone,
                  join_at,
                  last_login_at
           FROM users
           WHERE username = $1`,
      [username],
    );
    const user = results.rows[0];
    if (!user) throw new NotFoundError(`User not found: ${username}`);

    return user;
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    // Having no messages is not an error,
    // not passing in a valid user is.
    await User.get(username)

    const results = await db.query(
      `SELECT
              m.id,
              m.body,
              m.sent_at,
              m.read_at,
              u.username,
              u.first_name,
              u.last_name,
              u.phone
       FROM messages AS m
          JOIN users AS u ON m.to_username = u.username
       WHERE m.from_username = $1
       ORDER BY m.sent_at`,
      [username],
    );

    return results.rows.map(r =>
      ({
        id: r.id,
        to_user: {
          username: r.username,
          first_name: r.first_name,
          last_name: r.last_name,
          phone: r.phone
        },
        body: r.body,
        sent_at: r.sent_at,
        read_at: r.read_at,
      })
    );

  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    // Having no messages is not an error,
    // not passing in a valid user is.
    await User.get(username)

    const results = await db.query(
      `SELECT
              m.id,
              m.body,
              m.sent_at,
              m.read_at,
              u.username,
              u.first_name,
              u.last_name,
              u.phone
       FROM messages AS m
          JOIN users AS u ON m.from_username = u.username
       WHERE m.to_username = $1
       ORDER BY sent_at`,
      [username],
    );

    return results.rows.map(r =>
      ({
        id: r.id,
        from_user: {
          username: r.username,
          first_name: r.first_name,
          last_name: r.last_name,
          phone: r.phone
        },
        body: r.body,
        sent_at: r.sent_at,
        read_at: r.read_at,
      })
    );
  }
}


export default User;
