(function () {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderCurso(curso) {
    var edadHtml = curso.edad
      ? '<p class="course-card__meta"><strong>Dirigido a:</strong> ' + escapeHtml(curso.edad) + "</p>"
      : "";
    var inversionHtml = curso.inversion
      ? '<p class="course-card__meta"><strong>Inversión:</strong> ' + escapeHtml(curso.inversion) + "</p>"
      : curso.duracion
        ? '<p class="course-card__meta"><strong>Duración:</strong> ' + escapeHtml(curso.duracion) + "</p>"
        : "";
    var modalidadHtml = curso.modalidad
      ? '<p class="course-card__meta"><strong>Modalidad:</strong> ' + escapeHtml(curso.modalidad) + "</p>"
      : "";
    var descHtml = curso.descripcion
      ? '<p class="course-card__desc">' + escapeHtml(curso.descripcion) + "</p>"
      : "";

    return (
      '<article class="course-card course-card--dynamic">' +
      '<div class="course-card__image">' +
      '<img src="' +
      escapeHtml(curso.imagen_url) +
      '" alt="' +
      escapeHtml(curso.titulo) +
      '" loading="lazy">' +
      "</div>" +
      '<div class="course-card__body">' +
      '<h3 class="course-card__title">' +
      escapeHtml(curso.titulo) +
      "</h3>" +
      edadHtml +
      inversionHtml +
      modalidadHtml +
      descHtml +
      "</div>" +
      "</article>"
    );
  }

  var grid = document.getElementById("courses-grid");
  if (!grid) return;

  fetch("/api/public/cursos")
    .then(function (res) {
      if (!res.ok) throw new Error("API error");
      return res.json();
    })
    .then(function (data) {
      var cursos = data && data.cursos ? data.cursos : [];
      if (!cursos.length) return;

      grid.insertAdjacentHTML("afterbegin", cursos.map(renderCurso).join(""));

      grid.querySelectorAll(".course-card--static").forEach(function (el) {
        el.hidden = true;
      });
    })
    .catch(function () {
      /* Mantener catálogo estático si falla la API */
    });
})();
