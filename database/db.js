import { Pool } from "pg";

const connection = new Pool({
  user: "postgres",
  password: "Ilhamkume2006",
  host: "localhost",
  port: "5432",
  database: "waclone",
});

connection.connect((err) => {
  if (err) {
    return console.log(err);
  }
  return console.log("connected");
});

export default connection;
