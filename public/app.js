document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("form[data-loading='true']");
  forms.forEach((form) => {
    form.addEventListener("submit", () => {
      const btn = form.querySelector("button[type='submit']");
      if (!btn) return;

      btn.disabled = true;
      const loadingText = btn.getAttribute("data-loading-text");
      if (loadingText) btn.textContent = loadingText;
    });
  });
});
