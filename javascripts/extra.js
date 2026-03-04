// Sync Giscus iframe theme with Material for MkDocs palette toggle
function applyGiscusTheme() {
  var scheme = document.body.getAttribute('data-md-color-scheme');
  var theme = scheme === 'slate' ? 'dark' : 'light';
  var iframe = document.querySelector('iframe.giscus-frame');
  if (iframe) {
    iframe.contentWindow.postMessage(
      { giscus: { setConfig: { theme: theme } } },
      'https://giscus.app'
    );
  }
}

// Observe palette changes (Material toggles data-md-color-scheme on body)
var observer = new MutationObserver(applyGiscusTheme);
observer.observe(document.body, { attributes: true, attributeFilter: ['data-md-color-scheme'] });

// Apply once Giscus loads
window.addEventListener('message', function (event) {
  if (event.origin === 'https://giscus.app') {
    applyGiscusTheme();
  }
});
