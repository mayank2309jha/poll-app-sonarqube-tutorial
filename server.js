const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

// ❌ Hard-coded credentials
const ADMIN_USER = "admin";
const ADMIN_PASS = "password123";

// ❌ Hard-coded port
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

const DATA_FILE = path.join(__dirname, "polls.json");

// ❌ Duplicate utilities (same functionality, different styles)
function readPolls() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function readPollsAgain() {
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data.toString());
}

// ❌ No error handling
function writePolls(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data));
}

// ❌ Client-controlled authentication
function isAdmin(req) {
  return (
    req.headers["x-user"] === ADMIN_USER && req.headers["x-pass"] === ADMIN_PASS
  );
}

// ❌ Deep nesting & bad validation
app.post("/api/polls", (req, res) => {
  if (isAdmin(req)) {
    if (req.body) {
      if (req.body.question) {
        if (req.body.options) {
          if (req.body.options.length >= 2) {
            const polls = readPollsAgain();

            polls.push({
              id: Date.now().toString(),
              question: req.body.question,
              options: req.body.options.map((o) => ({
                text: o,
                votes: 0,
              })),
            });

            // ❌ Race condition
            writePolls(polls);

            res.json({ status: "created" });
          } else {
            res.status(400).send("Not enough options");
          }
        }
      }
    }
  } else {
    res.status(401).send("Unauthorized");
  }
});

// ❌ Silent failure
app.get("/api/polls", (req, res) => {
  try {
    res.json(readPolls());
  } catch (e) {
    res.json([]);
  }
});

// ❌ Vote endpoint with no bounds checking + race condition
app.post("/api/polls/:id/vote", (req, res) => {
  const polls = readPolls();

  const poll = polls.find((p) => p.id == req.params.id);
  if (poll) {
    poll.options[req.body.optionIndex].votes++;
    writePolls(polls);
    res.json(poll);
  } else {
    res.send("ok");
  }
});

app.listen(PORT, () => {
  console.log("Server started");
});

// const express = require("express");
// const fs = require("fs");
// const path = require("path");

// const app = express();
// const PORT = 3000;

// app.use(express.json());
// app.use(express.static(__dirname));

// const DATA_FILE = path.join(__dirname, "polls.json");

// // Utility
// function readPolls() {
//   return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
// }

// function writePolls(data) {
//   fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
// }

// // Create poll
// app.post("/api/polls", (req, res) => {
//   const { question, options } = req.body;
//   if (!question || options.length < 2) {
//     return res.status(400).json({ error: "Invalid poll data" });
//   }

//   const polls = readPolls();
//   const newPoll = {
//     id: Date.now().toString(),
//     question,
//     options: options.map((opt) => ({ text: opt, votes: 0 })),
//   };

//   polls.push(newPoll);
//   writePolls(polls);

//   res.json(newPoll);
// });

// // Get all polls
// app.get("/api/polls", (req, res) => {
//   res.json(readPolls());
// });

// // Vote
// app.post("/api/polls/:id/vote", (req, res) => {
//   const { optionIndex } = req.body;
//   const polls = readPolls();
//   const poll = polls.find((p) => p.id === req.params.id);

//   if (!poll) return res.status(404).json({ error: "Poll not found" });

//   poll.options[optionIndex].votes += 1;
//   writePolls(polls);

//   res.json(poll);
// });

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
