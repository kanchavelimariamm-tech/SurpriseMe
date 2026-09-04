const form = document.querySelector("#booking-form");
const dateInput = document.querySelector("#date");
const summaryDate = document.querySelector("#summary-date");
const summaryDuration = document.querySelector("#summary-duration");
const summaryPlan = document.querySelector("#summary-plan");
const summaryPrice = document.querySelector("#summary-price");
const valueNote = document.querySelector("#value-note");
const toast = document.querySelector("#toast");

const today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
dateInput.min = today.toISOString().split("T")[0];

function updateSummary() {
  const duration = form.querySelector('input[name="duration"]:checked');
  const plan = form.querySelector('input[name="plan"]:checked');
  const date = dateInput.value;

  summaryDate.textContent = date
    ? new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${date}T12:00:00`))
    : "Choose a day";
  summaryDuration.textContent = duration ? duration.dataset.label : "Choose duration";
  summaryPlan.textContent = plan ? plan.dataset.label : "Choose a plan";

  if (plan) {
    const total = Number(plan.dataset.price) + Number(duration?.dataset.priceAdd || 0);
    const comparison = Number(plan.dataset.value) + Number(duration?.dataset.priceAdd || 0);
    summaryPrice.textContent = `€${total}`;
    valueNote.textContent = `Curated value €${comparison} — you save €${comparison - total}.`;
  } else {
    summaryPrice.textContent = "€—";
    valueNote.textContent = "Your date is curated at a better-than-DIY price.";
  }
}

form.addEventListener("change", updateSummary);
dateInput.addEventListener("input", updateSummary);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  toast.textContent = "Your date is reserved! Payment checkout will be connected here next.";
  toast.classList.add("visible");
  window.setTimeout(() => toast.classList.remove("visible"), 5000);
});
