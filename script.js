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
