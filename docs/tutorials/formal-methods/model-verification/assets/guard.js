(() => {
  "use strict";
  for (const root of document.querySelectorAll("[data-isabelle-explorer]")) {
    const chinese = root.closest("[lang]")?.lang.toLowerCase().startsWith("zh");
    const text = (en, zh) => chinese ? zh : en;
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
        summary.textContent = text(
          "Enter whole angles between −180° and 180° to explore this example.",
          "请输入 −180° 至 180° 之间的整数角度。"
        );
        expression.textContent = text(
          "Enter valid integer inputs to obtain an Isabelle expression.",
          "输入有效的整数角度后即可生成 Isabelle 表达式。"
        );
        return false;
      }
      const conditions = [
        [text("Starting angle satisfies the invariant", "当前角度满足不变式"), inside(state.current)],
        [text("Lid is unlatched", "盖子已解锁"), !state.latched],
        [text("Container has support", "容器有支撑"), state.supported],
        [text("Target angle satisfies the invariant", "目标角度满足不变式"), inside(state.target)]
      ];
      const allowed = conditions.every(([, passes]) => passes);
      for (const [label, passes] of conditions) {
        const item = document.createElement("li");
        item.textContent = chinese
          ? `${passes ? "通过" : "未通过"}：${label}`
          : `${passes ? "Pass" : "Fail"}: ${label}`;
        item.dataset.passes = String(passes);
        list.append(item);
      }
      root.dataset.guard = allowed ? "true" : "false";
      summary.textContent = allowed
        ? text("Guard is True. This example permits the update.", "守卫条件为真，可以更新状态。")
        : text("Guard is False. This example withholds the update.", "守卫条件为假，本次不更新状态。");
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
        render(text(
          `Applied the illustrative update: the angle is now ${before.target}°. The angle invariant holds.`,
          `已执行演示中的更新：当前角度为 ${before.target}°，仍满足角度不变式。`
        ));
      } else {
        effect.textContent = text(
          `Update withheld: the angle remains ${before.current}°.`,
          `未执行更新。当前角度仍为 ${before.current}°。`
        );
      }
    });
    root.querySelector("[data-guard-reset]").addEventListener("click", () => {
      form.reset();
      render(text("Restored the initial example.", "已恢复初始示例。"));
    });
    render();
  }
})();
