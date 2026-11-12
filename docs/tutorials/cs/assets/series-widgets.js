(function () {
  'use strict';
  var zh = document.documentElement.lang.indexOf('zh') === 0;
  var bits = document.getElementById('bit-explorer');
  if (bits) {
    var input = bits.querySelector('input');
    var output = bits.querySelector('[role="status"]');
    function convert() {
      var value = Number(input.value);
      if (input.value.trim() === '' || !Number.isInteger(value) || value < 0 || value > 255) {
        output.textContent = zh ? '请输入 0 到 255 的整数。' : 'Enter an integer from 0 to 255.';
        return;
      }
      output.textContent = (zh ? '位：' : 'Bits: ') + value.toString(2).padStart(8, '0') +
        (zh ? '；十六进制：' : '; hex: ') + value.toString(16).padStart(2, '0') +
        (zh ? '；补码解释：' : '; two’s-complement interpretation: ') + (value < 128 ? value : value - 256);
    }
    input.addEventListener('input', convert); convert();
  }
  var cpu = document.getElementById('cpu-explorer');
  if (cpu) {
    var step = cpu.querySelector('[data-action="step"]');
    var reset = cpu.querySelector('[data-action="reset"]');
    var state = cpu.querySelector('[role="status"]');
    var pc, acc, memory;
    function show(halted) {
      state.textContent = 'PC=' + pc + ', ACC=' + acc + ', memory[0]=' + memory +
        (halted ? (zh ? '。已停机。' : '. Halted.') : '');
    }
    function start() { pc = 0; acc = 0; memory = 0; step.disabled = false; show(false); }
    step.addEventListener('click', function () {
      if (pc === 0) acc = 250;
      else if (pc === 1) acc = (acc + 10) % 256;
      else if (pc === 2) memory = acc;
      else if (pc !== 3) return;
      pc += 1; step.disabled = pc === 4; show(pc === 4);
    });
    reset.addEventListener('click', start); start();
  }
})();
