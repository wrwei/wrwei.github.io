/* A finite, deterministic linear search, shared by the EN and ZH pages. */
(function () {
  'use strict';
  var dropdown = document.getElementById('moduleDropdown');
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && dropdown) {
      dropdown.querySelector('.badge').setAttribute('aria-expanded', 'false');
    }
  });
  var root = document.getElementById('search-trace');
  if (!root) return;
  var zh = document.documentElement.lang.indexOf('zh') === 0;
  var books = ['Dune', 'Foundation', 'The Hobbit', 'Dune'];
  var items = root.querySelector('.trace-items');
  var status = root.querySelector('.trace-status');
  var target = root.querySelector('select');
  var empty = root.querySelector('input');
  var next = root.querySelector('[data-action="step"]');
  var reset = root.querySelector('[data-action="reset"]');
  var data, position, count, finished;
  function start() {
    data = empty.checked ? [] : books;
    position = 0; count = 0; finished = false;
    items.replaceChildren();
    data.forEach(function (book, index) {
      var li = document.createElement('li');
      var label = document.createElement('small');
      label.textContent = (zh ? '索引 ' : 'index ') + index;
      li.appendChild(label); li.appendChild(document.createTextNode(book));
      items.appendChild(li);
    });
    next.disabled = false;
    status.textContent = zh ? '尚未检查任何项目。点击“下一步”开始。' : 'No items inspected. Choose Next step to begin.';
  }
  function step() {
    if (finished) return;
    if (position >= data.length) {
      status.textContent = zh ? '结束：结果为 -1（未找到）。比较次数：' + count + '。' : 'Finished: result -1 (absent). Comparisons: ' + count + '.';
      finished = true;
    } else {
      var li = items.children[position];
      count += 1;
      var found = data[position] === target.value;
      li.classList.add('inspected');
      if (found) {
        li.classList.add('matched');
        status.textContent = zh ? '匹配！返回索引 ' + position + '。比较次数：' + count + '。' : 'Match! Return index ' + position + '. Comparisons: ' + count + '.';
        finished = true;
      } else {
        status.textContent = zh ? '索引 ' + position + ' 不匹配。比较次数：' + count + '。继续检查下一项。' : 'Index ' + position + ' does not match. Comparisons: ' + count + '. Continue to the next item.';
        position += 1;
      }
    }
    next.disabled = finished;
  }
  next.addEventListener('click', step);
  reset.addEventListener('click', start);
  target.addEventListener('change', start);
  empty.addEventListener('change', start);
  start();
})();
