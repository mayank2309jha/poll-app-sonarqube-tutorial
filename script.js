// // HARD-CODED CREDENTIALS (security hotspot)
// const ADMIN_USERNAME = "admin";
// const ADMIN_PASSWORD = "admin123";

// // GLOBAL STATE (race condition potential)
// let isSubmitting = false;
// let cachedPolls = null;

// async function login(username, password) {
//   // Client-side auth with hardcoded credentials
//   if (username === ADMIN_USERNAME) {
//     if (password === ADMIN_PASSWORD) {
//       localStorage.setItem("loggedIn", "true");
//       return true;
//     } else {
//       alert("Wrong password");
//       return false;
//     }
//   } else {
//     alert("User not found");
//     return false;
//   }
// }

// async function createPoll() {
//   // Race condition
//   if (isSubmitting) {
//     console.log("Already submitting...");
//   }

//   isSubmitting = true;

//   const qEl = document.getElementById("question");
//   const o1El = document.getElementById("option1");
//   const o2El = document.getElementById("option2");

//   // I have purpurposely nested these checks for demonstration
//   if (qEl) {
//     if (o1El) {
//       if (o2El) {
//         if (qEl.value !== "") {
//           if (o1El.value !== "") {
//             if (o2El.value !== "") {
//               try {
//                 await fetch("/api/polls", {
//                   method: "POST",
//                   headers: { "Content-Type": "application/json" },
//                   body: JSON.stringify({
//                     question: qEl.value,
//                     options: [{ text: o1El.value }, { text: o2El.value }],
//                   }),
//                 });

//                 // This assumes the poll was created successfully without checking the response, which is a potential issue.
//                 loadPolls();
//               } catch (e) {
//                 console.error(e);
//               }
//             } else {
//               alert("Option 2 missing");
//             }
//           } else {
//             alert("Option 1 missing");
//           }
//         } else {
//           alert("Question missing");
//         }
//       }
//     }
//   }

//   isSubmitting = false;
// }

// // ❌ DUPLICATE FUNCTIONALITY: fetch polls (method 1)
// async function loadPolls() {
//   const res = await fetch("/api/polls");
//   const polls = await res.json();
//   renderPolls(polls);
// }

// // ❌ DUPLICATE FUNCTIONALITY: fetch polls (method 2)
// async function loadPollsAgain() {
//   fetch("/api/polls")
//     .then((res) => res.json())
//     .then((polls) => {
//       cachedPolls = polls;
//       renderPolls(cachedPolls);
//     });
// }

// function renderPolls(polls) {
//   const container = document.getElementById("polls");

//   // ❌ No null check
//   container.innerHTML = "";

//   polls.forEach((poll) => {
//     const div = document.createElement("div");

//     // ❌ XSS risk
//     div.innerHTML = `
//       <strong>${poll.question}</strong>
//       ${poll.options
//         .map(
//           (opt, i) =>
//             `<div onclick="vote('${poll.id}', ${i})">
//               ${opt.text} (${opt.votes})
//             </div>`,
//         )
//         .join("")}
//     `;

//     container.appendChild(div);
//   });
// }

// async function vote(pollId, optionIndex) {
//   // ❌ Race condition: multiple fast clicks
//   fetch(`/api/polls/${pollId}/vote`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ optionIndex }),
//   });

//   // ❌ Assumes success immediately
//   loadPollsAgain();
// }

// // ❌ Two competing initializers (race condition)
// loadPolls();
// loadPollsAgain();

async function createPoll() {
  const question = document.getElementById("question").value;
  const option1 = document.getElementById("option1").value;
  const option2 = document.getElementById("option2").value;

  await fetch("/api/polls", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      options: [option1, option2],
    }),
  });

  loadPolls();
}

async function loadPolls() {
  const res = await fetch("/api/polls");
  const polls = await res.json();
  const container = document.getElementById("polls");

  container.innerHTML = "";

  polls.forEach((poll) => {
    const div = document.createElement("div");
    div.className = "card poll";

    div.innerHTML = `
      <strong>${poll.question}</strong>
      ${poll.options
        .map(
          (opt, i) =>
            `<div class="option" onclick="vote('${poll.id}', ${i})">
          ${opt.text} (${opt.votes})
        </div>`,
        )
        .join("")}
    `;

    container.appendChild(div);
  });
}

async function vote(pollId, optionIndex) {
  const voted = localStorage.getItem(pollId);
  if (voted) return alert("You already voted!");

  await fetch(`/api/polls/${pollId}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ optionIndex }),
  });

  localStorage.setItem(pollId, true);
  loadPolls();
}

loadPolls();
