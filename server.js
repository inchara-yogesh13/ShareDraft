const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// SQLite database for documents
const db = new sqlite3.Database("./sharedraft.db");
db.run("CREATE TABLE IF NOT EXISTS docs (id TEXT PRIMARY KEY, content TEXT)");

const docs = {};

io.on("connection", (socket) => {
  socket.on("join", (docId) => {
    socket.join(docId);
    if (!docs[docId]) docs[docId] = "";
    socket.emit("update", docs[docId]);
  });

  socket.on("edit", ({ docId, value }) => {
    docs[docId] = value;
    db.run("INSERT OR REPLACE INTO docs VALUES (?,?)", [docId, value]);
    socket.to(docId).emit("update", value);
  });
});

server.listen(5000, () => console.log("ShareDraft backend running on port 5000"));
