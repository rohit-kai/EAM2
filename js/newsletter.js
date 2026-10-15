/* =========================================================
   AURELIA - newsletter.js
   Client-side validation + mock concierge subscription
   ========================================================= */

(function () {
  "use strict";

  const form = document.getElementById("newsletterForm");
  if (!form) return;

  const emailField = document.getElementById("emailField");
  const emailInput = document.getElementById("nlEmail");
  const status = document.getElementById("subscribeStatus");
  const submitBtn = form.querySelector('button[type="submit"]');

  // Deliberately permissive but reliable pattern
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

  function setStatus(message, isError) {
    if (!status) return;
    status.textContent = message;
    status.style.color = isError ? "#e18680" : "";
  }

  function validateEmail(showEmpty) {
    const value = (emailInput.value || "").trim();
    let message = "";

    if (!value) {
      message = showEmpty ? "An email address is required." : "";
    } else if (!EMAIL_RE.test(value)) {
      message = "Please enter a valid email address.";
    }

    if (message) {
      emailField.classList.add("is-invalid");
      emailInput.setAttribute("aria-invalid", "true");
      return false;
    }

    emailField.classList.remove("is-invalid");
    emailInput.removeAttribute("aria-invalid");
    return true;
  }

  // Live validation once the field has been touched
  emailInput.addEventListener("input", function () {
    if (emailField.classList.contains("is-invalid") || emailInput.value.trim()) {
      validateEmail(false);
      if (!emailField.classList.contains("is-invalid")) setStatus("");
    }
  });

  emailInput.addEventListener("blur", function () {
    validateEmail(true);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validateEmail(true)) {
      setStatus("Please correct the highlighted field.", true);
      emailInput.focus();
      return;
    }

    const payload = {
      name: (form.querySelector("#nlName").value || "").trim(),
      email: emailInput.value.trim(),
      submittedAt: new Date().toISOString()
    };

    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    setStatus("Reserving your place on the list...", false);

    // Mock submission - swap for an endpoint when a backend exists
    window.setTimeout(function () {
      try {
        const key = "aurelia_subscribers";
        const stored = JSON.parse(window.localStorage.getItem(key) || "[]");
        stored.push(payload);
        window.localStorage.setItem(key, JSON.stringify(stored));
      } catch (err) {
        /* storage unavailable (private mode) - continue gracefully */
      }

      form.reset();
      emailField.classList.remove("is-invalid");
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
      setStatus(
        "Welcome to Aurelia. A confirmation has been sent to " + payload.email + ".",
        false
      );
    }, 900);
  });
})();
