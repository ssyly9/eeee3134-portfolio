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
let requests = 0;
byId("route-button").addEventListener("click", () => {
  const destination = requests % services.length;
  requests++;
  services.forEach((service, index) => {
    service.classList.toggle("active", index === destination);
    routes[index].classList.toggle("active", index === destination);
  });
  byId("route-status").textContent = "Request " + requests + " → Service " + services[destination].textContent;
});

// A closed course and a simplified differential-drive study are drawn in plate coordinates.
const canvas = byId("car-canvas");
const ctx = canvas.getContext("2d");
const driveButton = byId("drive-button");
const driveStatus = byId("drive-status");
const tau = Math.PI * 2;
const start = .36;
let position = start;
let frame = 0;
let lapStart = 0;

function pointAt(progress) {
  const angle = progress * tau;
  return {
    x: 180 + 110 * Math.cos(angle) + 15 * Math.cos(angle * 2 + .4),
    y: 122 + 57 * Math.sin(angle) - 11 * Math.sin(angle * 2 - .3),
  };
}

function roundedRect(x, y, width, height, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}

function drawCar() {
  if (!ctx) return;
  ctx.setTransform(canvas.width / 360, 0, 0, canvas.height / 240, 0, 0);
  ctx.clearRect(0, 0, 360, 240);
  ctx.fillStyle = "#7d805d45";
  for (let x = 10; x < 360; x += 14) {
    for (let y = 8; y < 240; y += 14) ctx.fillRect(x, y, 1, 1);
  }
  ctx.beginPath();
  for (let step = 0; step <= 180; step++) {
    const p = pointAt(step / 180);
    if (step === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.lineWidth = 13;
  ctx.strokeStyle = "#989775";
  ctx.stroke();
  ctx.lineWidth = 7;
  ctx.strokeStyle = "#41443a";
  ctx.stroke();

  const car = pointAt(position);
  const next = pointAt(position + .001);
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(Math.atan2(next.y - car.y, next.x - car.x));
  ctx.shadowBlur = 5;
  ctx.shadowColor = "#332e2190";
  ctx.shadowOffsetY = 2;
  roundedRect(-14, -10, 30, 20, 5, "#b06a39");
  ctx.shadowColor = "transparent";
  for (const y of [-14, 8]) {
    roundedRect(-10, y, 14, 6, 2, "#292b25");
    for (let x = -8; x < 4; x += 3) roundedRect(x, y + 1, 1, 4, .5, "#5f6051");
  }
  roundedRect(-8, -7, 19, 13, 2, "#66745b");
  roundedRect(-5, -3, 7, 5, 1, "#33352d");
  roundedRect(12, -8, 5, 16, 1, "#493f2c");
  for (const y of [-6, 4]) roundedRect(14, y, 2, 2, .5, "#edb273");
  for (let x = -7; x < 10; x += 3) roundedRect(x, -6, 1, 2, .3, "#d4bc78");
  ctx.restore();
}

function setDriveLabel(text) {
  driveButton.firstChild.textContent = text + " ";
}

function finishLap() {
  cancelAnimationFrame(frame);
  frame = 0;
  position = start + 1;
  drawCar();
  driveStatus.textContent = "Track study · One lap complete";
  setDriveLabel("Run again");
}

function advanceLap(timestamp) {
  const progress = (timestamp - lapStart) / 4400;
  if (progress >= 1) {
    finishLap();
    return;
  }
  position = start + progress;
  drawCar();
  frame = requestAnimationFrame(advanceLap);
}

driveButton.addEventListener("click", () => {
  if (frame) {
    cancelAnimationFrame(frame);
    frame = 0;
    driveStatus.textContent = "Track study · Paused";
    setDriveLabel("Resume the lap");
    return;
  }
  if (motion.matches) {
    finishLap();
    return;
  }
  if (position >= start + 1) position = start;
  lapStart = performance.now() - (position - start) * 4400;
  driveStatus.textContent = "Track study · Following the line";
  setDriveLabel("Pause the car");
  frame = requestAnimationFrame(advanceLap);
});
motion.addEventListener("change", () => {
  if (motion.matches && frame) finishLap();
});
drawCar();
document.documentElement.classList.add("enhanced");
