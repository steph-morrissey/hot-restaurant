const express = require("express");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");

const PORT = process.env.PORT || 3000;

const app = express();

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Functions
const serveIndexFile = (req, res) => {
  const filePath = path.join(__dirname, "../view/index.html");
  res.sendFile(filePath);
};

const serveTablesFile = (req, res) => {
  const filePath = path.join(__dirname, "../view/tables.html");
  res.sendFile(filePath);
};

const serveReserveFile = (req, res) => {
  const filePath = path.join(__dirname, "../view/reservation.html");
  res.sendFile(filePath);
};

const getTablesFromFile = async () => {
  const filePath = path.join(__dirname, "../data/tables.json");
  const tablesData = await readFileAsync(filePath, "utf8");
  const tables = JSON.parse(tablesData);
  return tables;
};

const writeTablesToFile = async (tables) => {
  const filePath = path.join(__dirname, "../data/tables.json");
  await writeFileAsync(filePath, JSON.stringify(tables));
};

const getTables = async (req, res) => {
  const tables = await getTablesFromFile();
  res.json(tables);
};

const createReservations = async (req, res) => {
  const reservation = req.body;

  const tables = await getTablesFromFile();

  const isFull = tables.currentReservations.length >= 5;

  if (isFull) {
    tables.waitingLists.push(reservation);
  } else {
    tables.currentReservations.push(reservation);
  }

  await writeTablesToFile(tables);

  res.status(301).redirect("/tables");
};

const getWaitingTables = async (req, res) => {
  const tables = await getTablesFromFile();
  res.json(tables.waitingLists);
};

const deleteTables = async (req, res) => {
  const defaultData = {
    currentReservations: [],
    waitingLists: [],
  };
  await writeTablesToFile(defaultData);
  res.json({
    status: "Success",
  });
};

// ROUTES
app.get("/", serveIndexFile);
app.get("/tables", serveTablesFile);
app.get("/reserve", serveReserveFile);
app.get("/api/tables", getTables);
app.get("/api/waitingTables", getWaitingTables);
app.post("/api/reserve", createReservations);
app.delete("/api/tables", deleteTables);

app.listen(PORT, () => {
  console.log(`Server listening on: http://localhost:${PORT}`);
});
