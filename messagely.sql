CREATE TABLE users (
  username VARCHAR(50) PRIMARY KEY,
  password VARCHAR(100) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  join_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP WITH TIME ZONE);

CREATE TABLE messages (
  id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  from_username VARCHAR(50) NOT NULL REFERENCES users,
  to_username VARCHAR(50) NOT NULL REFERENCES users,
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP WITH TIME ZONE);

/* Passwords: password1, password2, password3 */
INSERT INTO users (username, password, first_name, last_name, phone)
VALUES ('username1', '$2b$04$k49chsPBrXlnEaol1Duiju7LlSkTL75TLjMUH9ZkKEYrC2sH7lUGW', 'fuser1', 'luser1', 1231231111),
       ('username2', '$2b$04$qS3Obx4lrSpDvDO45rAdyO9MMxYmHKG5CxdPII2jZ7100DAYUnp4O', 'fuser2', 'luser2', 123123222),
       ('username3', '$2b$04$3DULBaVZqs1BHgm.gAETou0qJXLMI0ExYxQkVGJXXPgXHdGhAu8b2', 'fuser3', 'luser3', 123123333);


INSERT INTO messages (from_username, to_username, body)
VALUES ('username1', 'username2', '1st msg from u1 to u2'),
      ('username1', 'username2', '2nd msg from u1 to u2'),
      ('username2', 'username1', '1st msg from u2 to u1');


