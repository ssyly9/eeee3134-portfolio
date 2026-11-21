"use strict";

const byId = (id) => document.getElementById(id);
const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
const instrument = byId("instrument");
const object = instrument.querySelector(".object");
const assemblyButton = byId("assembly");
const explodedButton = byId("exploded");
function setAssembly(assembled) {
  instrument.classList.toggle("is-assembled", assembled);
  assemblyButton.setAttribute("aria-pressed", String(assembled));
  explodedButton.setAttribute("aria-pressed", String(!assembled));
}
assemblyButton.addEventListener("click", () => setAssembly(true));
explodedButton.addEventListener("click", () => setAssembly(false));

const sceneButtons = document.querySelectorAll(".scene-picker button");
const scenes = {
  rain: { title: "Tipping-bucket rain gauge", medium: "Concept rendering", target: "#rain-gauge" },
  lesson: { title: "Inside a language model", medium: "Published lesson cover", target: "#ai-tutorials" },
  gateway: { title: "Sub2API on OVH", medium: "System architecture", target: "#api-gateway" }
};
const sceneLink = byId("scene-link");
for (const button of sceneButtons) {
  button.addEventListener("click", () => {
    const key = button.dataset.scene;
    const scene = scenes[key];
    instrument.dataset.scene = key;
    instrument.querySelector(".lesson-art").hidden = key !== "lesson";
    instrument.querySelector(".gateway-art").hidden = key !== "gateway";
    byId("scene-medium").textContent = scene.medium;
    sceneLink.querySelector("strong").textContent = scene.title;
    sceneLink.setAttribute("href", scene.target);
    sceneButtons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
  });
}

// A family of copper curves shifts with native scroll. Idle pages do no drawing.
const field = document.querySelector(".current-field");
const brush = field.getContext("2d");
if (brush) {
  let frame = 0;
  function paintField() {
    frame = 0;
    const bounds = field.getBoundingClientRect();
    const width = bounds.width;
    const height = bounds.height;
    if (!width || !height || bounds.bottom <= 0 || bounds.top >= innerHeight) return;
    const density = Math.min(devicePixelRatio || 1, 1.5);
    const pixelsX = Math.round(width * density);
    const pixelsY = Math.round(height * density);
    if (field.width !== pixelsX || field.height !== pixelsY) {
      field.width = pixelsX;
      field.height = pixelsY;
    }
    brush.setTransform(density, 0, 0, density, 0, 0);
    brush.clearRect(0, 0, width, height);
    const scroll = motion.matches ? 0 : Math.max(0, -bounds.top / height);
    for (let i = 0; i < 37; i++) {
      const u = i / 36;
      brush.beginPath();
      brush.moveTo(-.07 * width, (.60 + .67 * u) * height);
      brush.bezierCurveTo(.37 * width, (1.35 - .48*u - .09*scroll) * height,
        .53 * width, (.56 + .30*u - .14*scroll) * height,
        1.06 * width, (-.25 + .68*u + .06*scroll) * height);
      brush.strokeStyle = i % 4 === 0 ? "rgba(255,241,205,.57)" : "rgba(134,71,41,.21)";
      brush.lineWidth = i % 4 === 0 ? 1.3 : .8;
      brush.stroke();
    }
  }
  function scheduleField() {
    if (!frame) frame = requestAnimationFrame(paintField);
  }
  window.addEventListener("resize", scheduleField);
  window.addEventListener("scroll", () => { if (!motion.matches) scheduleField(); }, { passive: true });
  motion.addEventListener("change", scheduleField);
  scheduleField();
}

if ("IntersectionObserver" in window) {
  const arrivals = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("art-enter");
        arrivals.unobserve(entry.target);
      }
    }
  }, { threshold: .08 });
  document.querySelectorAll(".project").forEach(project => arrivals.observe(project));
}

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
const trace = rain.querySelectorAll(".pulse-trace i");
byId("tip-button").addEventListener("click", () => {
  tips++;
  if (tips <= trace.length) trace[tips - 1].classList.add("recorded");
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
slides.forEach((slide, index) => { slide.hidden = index !== 0; });
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
