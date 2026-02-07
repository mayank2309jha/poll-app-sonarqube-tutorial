const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

const DATA_FILE = path.join(__dirname, "polls.json");

// Utility
function readPolls() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function writePolls(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Create poll
app.post("/api/polls", (req, res) => {
  const { question, options } = req.body;
  if (!question || options.length < 2) {
    return res.status(400).json({ error: "Invalid poll data" });
  }

  const polls = readPolls();
  const newPoll = {
    id: Date.now().toString(),
    question,
    options: options.map((opt) => ({ text: opt, votes: 0 })),
  };

  polls.push(newPoll);
  writePolls(polls);

  res.json(newPoll);
});

// Get all polls
app.get("/api/polls", (req, res) => {
  res.json(readPolls());
});

// Vote
app.post("/api/polls/:id/vote", (req, res) => {
  const { optionIndex } = req.body;
  const polls = readPolls();
  const poll = polls.find((p) => p.id === req.params.id);

  if (!poll) return res.status(404).json({ error: "Poll not found" });

  poll.options[optionIndex].votes += 1;
  writePolls(polls);

  res.json(poll);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
