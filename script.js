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
const menuButton = document.querySelector("#menu-button");
const siteMenu = document.querySelector("#site-menu");
let currentStep = 1;

const today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
dateInput.min = today.toISOString().split("T")[0];

menuButton.addEventListener("click", () => {
  const open = siteMenu.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});

siteMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    siteMenu.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

const packageDetails = {
  Budget: ["Aperitivo, a lovely dinner and a secret fun activity chosen just for the vibe.", "Think a cosy table, something delicious to share and one small plot twist. The activity is a secret — and very much included."],
  Fun: ["Everything in Budget, plus a three-course dinner and a more premium activity with proper main-character energy.", "Expect a playful Munich experience that is a little more polished, a little more surprising and very fun to talk about afterwards."],
  Premium: ["Everything in Fun, plus a gourmet chef’s tasting experience, beautiful drinks and our most elevated surprise activity.", "In other words: the fancy chapter. Thoughtful details, excellent food and a day that feels wonderfully hard to top."]
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
  const fieldsAreValid = fields.every((field) => field.reportValidity());
  const groupsAreValid = ["cuisine", "hobby"].every((group) => {
    const choices = [...screen.querySelectorAll(`input[name="${group}"]`)];
    if (!choices.length) return true;
    const selectedCount = choices.filter((choice) => choice.checked).length;
    choices[0].setCustomValidity(selectedCount === 3 ? "" : `Choose exactly 3 ${group} options.`);
    return selectedCount === 3;
  });
  return fieldsAreValid && groupsAreValid;
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

form.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    const group = checkbox.name;
    const selectedChoices = [...form.querySelectorAll(`input[name="${group}"]:checked`)];
    if (selectedChoices.length > 3) checkbox.checked = false;
    const count = form.querySelectorAll(`input[name="${group}"]:checked`).length;
    const countLabel = form.querySelector(`.selection-count[data-group="${group}"]`);
    if (countLabel) countLabel.textContent = `${count} / 3 selected`;
  });
});

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

document.querySelectorAll(".subscription-option").forEach((option) => {
  option.addEventListener("click", () => {
    const label = option.dataset.subscription === "three" ? "three dates a month" : "one date a month";
    document.querySelector("#subscription-status").textContent = `Lovely choice — ${label} is ready to join.`;
  });
});

document.querySelector("#referral-button").addEventListener("click", async () => {
  const referralLink = `${window.location.origin}${window.location.pathname}?ref=surpriseme`;
  try {
    await navigator.clipboard.writeText(referralLink);
    document.querySelector("#referral-status").textContent = "Link copied — €10 credits are on their way to both of you.";
  } catch {
    document.querySelector("#referral-status").textContent = `Share this link: ${referralLink}`;
  }
});

document.querySelector("#selfie-upload").addEventListener("change", (event) => {
  const file = event.currentTarget.files?.[0];
  document.querySelector("#selfie-status").textContent = file
    ? `${file.name} is ready to send when selfie submissions are connected.`
    : "";
});
