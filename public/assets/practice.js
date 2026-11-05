(() => {
  const labels = {
    personalized: "Walk into each session prepared",
    notes: "Let Otto draft the note",
    "front-desk": "Keep payment moving",
  };
  const query = new URLSearchParams(location.search);
  const selected = query
    .getAll("feature")
    .filter((value) => Object.hasOwn(labels, value));
  const builder = document.querySelector("#practice-builder");
  if (builder) {
    const name = builder.querySelector("[name=practice]");
    name.value = (query.get("practice") || "").slice(0, 60);
    for (const key of ["size", "setting"]) {
      const value = query.get(key);
      if (value)
        for (const option of builder.querySelectorAll(
          `[name=${key}], [name=${key}] option`,
        )) {
          if (option.value === value) {
            if (option.tagName === "OPTION") option.selected = true;
            else if (option.type === "radio") option.checked = true;
          }
        }
    }
    if (selected.length)
      builder.querySelectorAll("[name=feature]").forEach((input) => {
        input.checked = selected.includes(input.value);
      });
    function showStep(number) {
      builder.querySelectorAll("[data-builder-step]").forEach((step) => {
        step.hidden = step.dataset.builderStep !== String(number);
      });
      document.querySelectorAll("[data-step-label]").forEach((step) => {
        if (step.dataset.stepLabel === String(number))
          step.setAttribute("aria-current", "step");
        else step.removeAttribute("aria-current");
      });
      const heading = builder.querySelector(
        `[data-builder-step="${number}"] h2`,
      );
      heading.tabIndex = -1;
      heading.focus();
    }
    document
      .querySelector("#builder-next")
      .addEventListener("click", () => showStep(2));
    document.querySelector("#builder-next").disabled = false;
    document
      .querySelector("#builder-back")
      .addEventListener("click", () => showStep(1));
    builder.addEventListener("submit", (event) => {
      if (!builder.querySelector("[name=feature]:checked")) {
        event.preventDefault();
        document.querySelector("#builder-error").textContent =
          "Choose at least one workflow for your tour.";
      }
    });
    builder.addEventListener("change", () => {
      document.querySelector("#builder-error").textContent = "";
    });
  }
  const result = document.querySelector("#result-practice-name");
  if (result) {
    result.textContent =
      (query.get("practice") || "").trim().slice(0, 60) || "your practice.";
    const sizes = ["Solo practice", "Group practice", "Starting a practice"];
    const settings = ["In person and online", "Online", "In person"];
    document.querySelector("#result-size").textContent = sizes.includes(
      query.get("size"),
    )
      ? query.get("size")
      : sizes[0];
    document.querySelector("#result-setting").textContent = settings.includes(
      query.get("setting"),
    )
      ? query.get("setting")
      : settings[0];
    const chosen = selected.length ? selected : ["personalized"];
    document.querySelectorAll("[data-result-feature]").forEach((card) => {
      card.hidden = !chosen.includes(card.dataset.resultFeature);
    });
    const edit = document.querySelector("#edit-practice");
    const editURL = new URL(edit.href);
    editURL.search = query.toString();
    edit.href = editURL.href;
    const dialog = document.querySelector("#interest-dialog");
    const close = () => dialog.close();
    document.querySelectorAll("[data-interest]").forEach((button) =>
      button.addEventListener("click", () => {
        document.querySelector("#interest-feature-name").textContent =
          labels[button.dataset.interest];
        document.querySelector("#interest-form-step").hidden = false;
        document.querySelector("#interest-complete").hidden = true;
        dialog.showModal();
      }),
    );
    dialog.querySelector(".dialog-close").addEventListener("click", close);
    document.querySelector("#interest-return").addEventListener("click", close);
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        const rect = dialog.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          close();
      }
    });
    document
      .querySelector("#interest-form")
      .addEventListener("submit", (event) => {
        event.preventDefault();
        document.querySelector("#interest-email").value = "alex@example.com";
        document.querySelector("#interest-form-step").hidden = true;
        document.querySelector("#interest-complete").hidden = false;
        document.querySelector("#interest-complete-title").focus();
      });
  }
})();
