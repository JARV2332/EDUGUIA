(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var status = document.getElementById("contact-form-status");
    var submitBtn = form.querySelector(".contact-form__submit");
    var name = document.getElementById("contact-name");
    var email = document.getElementById("contact-email");
    var phone = document.getElementById("contact-phone");
    var subject = document.getElementById("contact-subject");
    var message = document.getElementById("contact-message");

    if (submitBtn) submitBtn.disabled = true;

    if (status) {
      status.hidden = false;
      status.className = "contact-form__notice";
      status.textContent = "Enviando…";
    }

    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        phone: phone.value,
        subject: subject.value,
        message: message.value,
      }),
    })
      .then(function (response) {
        return response.json().then(function (data) {
          return { ok: response.ok, data: data };
        });
      })
      .then(function (result) {
        if (!status) return;

        if (result.ok) {
          status.className = "contact-form__notice contact-form__notice--success";
          status.textContent = "¡Gracias! Recibimos tu mensaje. Te responderemos lo antes posible.";
          form.reset();
          return;
        }

        status.className = "contact-form__notice contact-form__notice--error";
        status.textContent =
          (result.data && result.data.error) ||
          "No se pudo enviar tu mensaje. Intenta de nuevo o escríbenos por WhatsApp.";
      })
      .catch(function () {
        if (!status) return;
        status.className = "contact-form__notice contact-form__notice--error";
        status.textContent = "Error de conexión. Verifica tu internet e intenta de nuevo.";
      })
      .finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
  });
})();
