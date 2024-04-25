const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");

// connecting app to db
dotenv.config({ path: "./config.env" });
// .replace() is nothing but property of string
const DBURL = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);
const newURL = DBURL.replace("<DB_NAME>", process.env.DATABASE_NAME);

mongoose
  .connect(newURL)
  .then((conn) => {
    //  console.log(conn.connections);
    console.log("connection sucesss");
  })
  .catch((err) => {
    console.log("error in connection");
  });

const port = process.env.PORT || 3232;
app.listen(port, "127.0.0.1", () => {
  console.log(`App running on port ${port}...`);
});
