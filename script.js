const form = document.querySelector("#booking-form");
const screens = [...document.querySelectorAll(".wizard-screen")];
const dateInput = document.querySelector("#date");
const progressLabel = document.querySelector("#progress-label");
const summaryParty = document.querySelector("#summary-party");
const summaryDate = document.querySelector("#summary-date");
const summaryPlan = document.querySelector("#summary-plan");
const summaryPrice = document.querySelector("#summary-price");
const valueNote = document.querySelector("#value-note");
const paymentTotal = document.querySelector("#payment-total");
const includesPanel = document.querySelector("#includes-panel");
let currentStep = 1;

const today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
dateInput.min = today.toISOString().split("T")[0];

const packageDetails = {
  Budget: ["A sweet little plan with a restaurant reservation, pre-ordered bites and a lovely route through Munich.", "No activity included — just enough room for you to add your own plot twist."],
  Fun: ["Everything in Budget, plus a playful activity chosen to make you laugh, play or see Munich differently.", "Think mini golf, a secret workshop or something delightfully unexpected."],
  Premium: ["The full cinematic treatment: a beautiful meal, drinks, a special activity and extra surprises along the way.", "We handle the little luxuries, so you can concentrate on looking effortlessly fabulous."]
};

function selected(name) {
  return form.querySelector(`input[name="${name}"]:checked`);
}

function total() {
  const plan = selected("plan");
  const duration = selected("duration");
  const people = Number(selected("party")?.dataset.people || 1);
  return plan ? (Number(plan.dataset.price) + Number(duration?.dataset.priceAdd || 0)) * people : 0;
}

function updateSummary() {
  const party = selected("party");
  const plan = selected("plan");
  summaryParty.textContent = party ? party.value : "Not chosen yet";
  summaryDate.textContent = dateInput.value
    ? new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(new Date(`${dateInput.value}T12:00:00`))
    : "Not chosen yet";
  summaryPlan.textContent = plan ? plan.value : "Not chosen yet";
  const amount = total();
  summaryPrice.textContent = amount ? `€${amount}` : "€—";
  paymentTotal.textContent = amount ? `€${amount}` : "€—";
  if (plan) {
    const people = Number(selected("party")?.dataset.people || 1);
    const usual = (Number(plan.dataset.value) + Number(selected("duration")?.dataset.priceAdd || 0)) * people;
    valueNote.textContent = `Usually €${usual}. You save €${usual - amount} by letting us do the plotting.`;
  }
  if (planDetailsVisible()) renderPackageDetails(plan);
}

function planDetailsVisible() {
  return !includesPanel.hidden;
}

function renderPackageDetails(plan) {
  includesPanel.innerHTML = plan
    ? `<strong>${plan.value} includes</strong><p>${packageDetails[plan.value][0]}</p><p>${packageDetails[plan.value][1]}</p>`
    : "";
}

function showStep(step) {
  currentStep = step;
  screens.forEach((screen) => screen.classList.toggle("active", Number(screen.dataset.step) === step));
  progressLabel.textContent = step < 6 ? `0${step} / 05` : "✦";
  window.scrollTo({ top: document.querySelector("#book").offsetTop - 30, behavior: "smooth" });
  updateSummary();
}

function validateCurrentStep() {
  const screen = screens.find((item) => Number(item.dataset.step) === currentStep);
  const fields = [...screen.querySelectorAll("input, textarea")].filter((field) => field.required);
  return fields.every((field) => field.reportValidity());
}

document.querySelectorAll(".next-button").forEach((button) => {
  button.addEventListener("click", () => {
    if (validateCurrentStep()) showStep(currentStep + 1);
  });
});

document.querySelectorAll(".back-button").forEach((button) => {
  button.addEventListener("click", () => showStep(currentStep - 1));
});

form.addEventListener("change", updateSummary);
dateInput.addEventListener("input", updateSummary);

document.querySelector(".includes-toggle").addEventListener("click", (event) => {
  const open = !planDetailsVisible();
  includesPanel.hidden = !open;
  event.currentTarget.setAttribute("aria-expanded", String(open));
  event.currentTarget.querySelector("span").textContent = open ? "⌃" : "⌄";
  renderPackageDetails(selected("plan"));
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateCurrentStep()) return;
  showStep(6);
});

document.querySelector('a[href="#book"]').addEventListener("click", (event) => {
  event.preventDefault();
  document.querySelector("#book").scrollIntoView({ behavior: "smooth" });
  window.setTimeout(() => showStep(1), 450);
});
