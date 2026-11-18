"use strict";

const byId = (id) => document.getElementById(id);
const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
const instrument = byId("instrument");
const object = instrument.querySelector(".object");
const assemblyButton = byId("assembly");
assemblyButton.addEventListener("click", () => {
  const assembled = instrument.classList.toggle("is-assembled");
  assemblyButton.setAttribute("aria-pressed", String(assembled));
  byId("assembly-label").textContent = assembled ? "Explode view" : "Assemble";
});

const stage = instrument.querySelector(".stage");
stage.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "mouse" || motion.matches) return;
  const bounds = stage.getBoundingClientRect();
  object.style.setProperty("--shift-x", ((event.clientX - bounds.left) / bounds.width - .5) * 12 + "px");
  object.style.setProperty("--shift-y", ((event.clientY - bounds.top) / bounds.height - .5) * 8 + "px");
});
stage.addEventListener("pointerleave", () => {
  object.style.setProperty("--shift-x", "0px");
  object.style.setProperty("--shift-y", "0px");
});

let tips = 0;
const rain = byId("rain-study");
const drop = rain.querySelector(".rain-drop");
byId("tip-button").addEventListener("click", () => {
  tips++;
  rain.classList.toggle("tipped", tips % 2 === 1);
  drop.classList.remove("fall");
  void drop.offsetWidth;
  drop.classList.add("fall");
  byId("tip-status").textContent = "Study counter · " + tips + (tips === 1 ? " tip" : " tips");
});

const services = [...document.querySelectorAll(".servers b")];
const routes = [...document.querySelectorAll(".routes i")];
const condition = byId("route-condition");
const routeStatus = byId("route-status");
const exampleShares = { healthy: [2, 2, 2], slow: [2, 1, 2], paused: [2, 0, 2] };

function resetAllocation() {
  for (const [index, service] of services.entries()) {
    service.querySelector("span").textContent = "—";
    service.classList.remove("active", "excluded");
    routes[index].classList.remove("active");
  }
  routeStatus.textContent = "Select a condition and allocate a sample batch.";
}
condition.addEventListener("change", resetAllocation);
byId("route-button").addEventListener("click", () => {
  const shares = exampleShares[condition.value];
  const total = shares.reduce((sum, value) => sum + value, 0);
  const batchSize = 12;
  const targets = shares.map(value => batchSize * value / total);
  const counts = targets.map(Math.floor);
  const remainders = targets.map((target, index) => ({index, remainder: target - counts[index]}))
    .sort((a, b) => b.remainder - a.remainder);
  const unassigned = batchSize - counts.reduce((sum, value) => sum + value, 0);
  for (const entry of remainders.slice(0, unassigned)) counts[entry.index]++;
  services.forEach((service, index) => {
    service.querySelector("span").textContent = counts[index];
    service.classList.toggle("active", counts[index] > 0);
    service.classList.toggle("excluded", counts[index] === 0);
    routes[index].classList.toggle("active", counts[index] > 0);
  });
  routeStatus.textContent = "12 example requests · A " + counts[0] + " / B " + counts[1] + " / C " + counts[2];
});

const slides = Array.from(byId("tutorial-preview").querySelectorAll("[data-slide]"));
const slideCount = byId("slide-count");
let currentSlide = 0;

function changeSlide(offset) {
  slides[currentSlide].hidden = true;
  currentSlide = (currentSlide + offset + slides.length) % slides.length;
  slides[currentSlide].hidden = false;
  slideCount.textContent = (currentSlide + 1) + " / " + slides.length;
}
byId("slide-prev").addEventListener("click", () => changeSlide(-1));
byId("slide-next").addEventListener("click", () => changeSlide(1));
document.documentElement.classList.add("enhanced");
