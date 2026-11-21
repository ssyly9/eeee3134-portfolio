const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const esc = (value = "") => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
function initialiseFilters(projects) {
  const categories = ["All work", ...new Set(projects.map(project => project.category))];
  const root = $("#project-filters");
  root.innerHTML = categories.map((category, index) => `<button type="button" class="filter-button${index === 0 ? " active" : ""}" data-filter="${esc(category)}" aria-pressed="${index === 0}">${esc(category)}${index === 0 ? ` <span>${projects.length}</span>` : ""}</button>`).join("");
  root.addEventListener("click", event => {
    const button = event.target.closest("button[data-filter]");
    if (!button) return;
    const filter = button.dataset.filter;
    $$("button", root).forEach(item => { const selected = item === button; item.classList.toggle("active", selected); item.setAttribute("aria-pressed", String(selected)); });
    $$(".project-card").forEach(card => { card.hidden = filter !== "All work" && card.dataset.category !== filter; });
    const count = $$(".project-card:not([hidden])").length;
    $("#results-announcement").textContent = `${count} project${count === 1 ? "" : "s"} shown`;
  });
}

function initialiseNavigation() {
  const toggle = $(".menu-toggle");
  const nav = $("#main-nav");
  toggle?.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open)); nav.classList.toggle("is-open", open);
  });
  $$("#main-nav a").forEach(link => link.addEventListener("click", () => { toggle?.setAttribute("aria-expanded","false"); nav.classList.remove("is-open"); }));
  document.addEventListener("keydown", event => { if(event.key === "Escape") { toggle?.setAttribute("aria-expanded","false"); nav?.classList.remove("is-open"); } });
  const sections = $$("main section[id]");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      $$("#main-nav a").forEach(link => link.classList.toggle("current", link.hash === "#" + entry.target.id));
    }), { rootMargin: "-15% 0px -60% 0px" });
    sections.forEach(section => observer.observe(section));
  }
}

initialiseFilters($$('.project-card').map(card => ({ category: card.dataset.category })));
initialiseNavigation();
document.documentElement.classList.add('ready');
