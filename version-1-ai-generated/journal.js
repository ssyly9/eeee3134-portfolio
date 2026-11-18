const projectIds = new Set(["rain-gauge", "line-car", "api-gateway"]);

function openLinkedProject() {
  const id = window.location.hash.slice(1);
  if (projectIds.has(id)) {
    document.getElementById(id).querySelector("details").open = true;
  }
}

window.addEventListener("hashchange", openLinkedProject);
document.querySelector(".featured-plate a").addEventListener("click", () => {
  document.querySelector("#rain-gauge details").open = true;
});
openLinkedProject();
