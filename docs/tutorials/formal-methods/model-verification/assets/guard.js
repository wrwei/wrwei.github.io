(() => {
  "use strict";
  for (const root of document.querySelectorAll("[data-isabelle-explorer]")) {
    const form = root.querySelector("[data-guard-form]");
    const summary = root.querySelector("[data-guard-summary]");
    const list = root.querySelector("[data-guard-checks]");
    const effect = root.querySelector("[data-guard-effect]");
    const expression = root.querySelector("[data-guard-expression]");
    const currentInput = form.elements.namedItem("current");
    const targetInput = form.elements.namedItem("target");
    const latchedInput = form.elements.namedItem("latched");
    const supportedInput = form.elements.namedItem("supported");
    const inside = angle => 0 <= angle && angle <= 90;
    function read() {
      const current = Number(currentInput.value);
      const target = Number(targetInput.value);
      const valid = currentInput.value !== "" && targetInput.value !== "" &&
        Number.isInteger(current) && Number.isInteger(target) &&
        current >= -180 && current <= 180 && target >= -180 && target <= 180;
      return {current, target, valid, latched: latchedInput.checked, supported: supportedInput.checked};
    }
    function render(message = "") {
      const state = read();
      list.replaceChildren();
      effect.textContent = message;
      root.dataset.guard = "unknown";
      if (!state.valid) {
        summary.textContent = "Enter whole angles between −180° and 180° to explore this example.";
        expression.textContent = "Enter valid integer inputs to obtain an Isabelle expression.";
        return false;
      }
      const conditions = [
        ["Starting angle satisfies the invariant", inside(state.current)],
        ["Lid is unlatched", !state.latched],
        ["Container has support", state.supported],
        ["Target angle satisfies the invariant", inside(state.target)]
      ];
      const allowed = conditions.every(([, passes]) => passes);
      for (const [label, passes] of conditions) {
        const item = document.createElement("li");
        item.textContent = `${passes ? "Pass" : "Fail"}: ${label}`;
        item.dataset.passes = String(passes);
        list.append(item);
      }
      root.dataset.guard = allowed ? "true" : "false";
      summary.textContent = allowed ? "Guard is True. This example permits the update." : "Guard is False. This example withholds the update.";
      expression.textContent = `value "may_open ⦇lid_angle = (${state.current}), lid_latched = ${state.latched ? "True" : "False"}, lid_supported = ${state.supported ? "True" : "False"}⦈ (${state.target})"`;
      return allowed;
    }
    form.addEventListener("input", () => render());
    form.addEventListener("submit", event => {
      event.preventDefault();
      const before = read();
      const allowed = render();
      if (!before.valid) return;
      if (allowed) {
        currentInput.value = String(before.target);
        render(`Applied the illustrative update: the angle is now ${before.target}°. The angle invariant holds.`);
      } else {
        effect.textContent = `Update withheld: the angle remains ${before.current}°.`;
      }
    });
    root.querySelector("[data-guard-reset]").addEventListener("click", () => {
      form.reset();
      render("Restored the initial example.");
    });
    render();
  }
})();
