const projectIds = new Set(["rain-gauge", "ai-tutorials", "api-gateway"]);

function openLinkedProject() {
  const id = window.location.hash.slice(1);
  if (projectIds.has(id)) {
    document.getElementById(id).querySelector("details").open = true;
  }
}

window.addEventListener("hashchange", openLinkedProject);
document.querySelectorAll('a[href^="#"]').forEach(link => {
  const id = link.hash.slice(1);
  if (projectIds.has(id)) {
    link.addEventListener("click", () => {
      document.getElementById(id).querySelector("details").open = true;
    });
  }
});
openLinkedProject();
