const express = require("express");
const bodyParser = require("body-parser");
const FormData = require("form-data");
const fetch = require("node-fetch");
const {
  client_id,
  redirect_uri,
  client_secret,
  server_port,
} = require("./config");

const config = require("./config");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.json({ type: "text/*" }));
app.use(bodyParser.urlencoded({ extended: false }));

// Enabled Access-Control-Allow-Origin", "*" in the header so as to by-pass the CORS error.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, X-Auth-Token, X-CSRF-Token, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header;
  next();
});

app.post("/authenticate", async (req, res) => {
  const { code } = req.body;

  let apiResponse = {};

  const data = new FormData();
  data.append("client_id", client_id);
  data.append("client_secret", client_secret);
  data.append("code", code);
  data.append("redirect_uri", redirect_uri);

  fetch(`https://github.com/login/oauth/access_token`, {
    method: "POST",
    body: data,
  })
    .then((response) => response.text())
    .then((paramsString) => {
      let params = new URLSearchParams(paramsString);
      const access_token = params.get("access_token");

      // Request to return data of a user that has been authenticated
      return fetch(`https://api.github.com/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      });
    })
    .then((response) => response.json())
    .then((response) => {
      apiResponse.profile = response;
      return fetch(response?.repos_url);
    })
    .then((response) => response.json())
    .then((response) => {
      apiResponse.repositoryData = response;
      return res.status(200).json(apiResponse);
    })
    .catch((error) => {
      return res.status(400).json(error);
    });
});

app.get("/", (req, res) => {
  console.log("hit get");
});

const PORT = process.env.SERVER_PORT || 5000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

// Export the Express API
module.exports = app;
