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
})();
