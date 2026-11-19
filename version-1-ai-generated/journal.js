function openLinkedProject(hash) {
  const target = document.getElementById(hash.slice(1));
  const project = target?.closest(".project-entry");
  if (project) {
    project.querySelector("details").open = true;
  }
}

window.addEventListener("hashchange", () => openLinkedProject(window.location.hash));
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", () => openLinkedProject(link.hash));
});
openLinkedProject(window.location.hash);
