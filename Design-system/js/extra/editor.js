(function () {
  var CODE_LANGUAGES = [
    { value: 'javascript', label: 'javascript' },
    { value: 'typescript', label: 'typescript' },
    { value: 'html', label: 'html' },
    { value: 'css', label: 'css' },
    { value: 'json', label: 'json' },
    { value: 'bash', label: 'bash' }
  ];

  var LANGUAGE_ALIASES = {
    html: 'xml'
  };

  var INLINE_COMMANDS = {
    bold: 'strong',
    italic: 'em',
    underline: 'u',
    strikeThrough: 's'
  };

  var LANGUAGE_SAMPLES = {
    javascript:
      "for (let i = 1; i <= 15; i++) {\n" +
      "  if (i % 15 === 0) console.log('FizzBuzz');\n" +
      "  else if (i % 3 === 0) console.log('Fizz');\n" +
      "  else if (i % 5 === 0) console.log('Buzz');\n" +
      "  else console.log(i);\n" +
      '}',
    typescript:
      'function greet(name: string): string {\n' +
      '  const message = `Hello, ${name}`;\n' +
      '  return message;\n' +
      '}\n\n' +
      'type User = { id: number; name: string };\n' +
      'const user: User = { id: 1, name: "Editor" };',
    html:
      '<!DOCTYPE html>\n' +
      '<html lang="ko">\n' +
      '  <head>\n' +
      '    <title>Sample</title>\n' +
      '  </head>\n' +
      '  <body>\n' +
      '    <h1 class="title">Hello</h1>\n' +
      '  </body>\n' +
      '</html>',
    css:
      ':root {\n' +
      '  --primary: #3b82f6;\n' +
      '}\n\n' +
      '.card {\n' +
      '  display: flex;\n' +
      '  color: var(--primary);\n' +
      '  border-radius: 0.75rem;\n' +
      '}',
    json:
      '{\n' +
      '  "name": "Editor",\n' +
      '  "version": 1,\n' +
      '  "features": ["toolbar", "code-block"],\n' +
      '  "enabled": true\n' +
      '}',
    bash:
      '#!/bin/bash\n' +
      'for i in {1..5}; do\n' +
      '  if [[ $i -eq 3 ]]; then\n' +
      '    echo "Fizz"\n' +
      '  else\n' +
      '    echo "Line $i"\n' +
      '  fi\n' +
      'done'
  };

  var savedRanges = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  var trackedEditors = typeof Set !== 'undefined' ? new Set() : null;

  function getContent(editor) {
    return editor.querySelector('[data-slot="editor-content"]');
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(text) {
    return escapeHtml(text).replace(/'/g, '&#39;');
  }

  function resolveLanguage(lang) {
    return LANGUAGE_ALIASES[lang] || lang;
  }

  function isRangeInContent(range, content) {
    if (!range || !content) return false;
    try {
      return content.contains(range.commonAncestorContainer);
    } catch (e) {
      return false;
    }
  }

  function saveSelection(editor) {
    var content = getContent(editor);
    if (!content || !savedRanges) return;

    var selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    var range = selection.getRangeAt(0);
    if (!isRangeInContent(range, content)) return;

    savedRanges.set(editor, range.cloneRange());
  }

  function restoreSelection(editor) {
    var content = getContent(editor);
    if (!content || !savedRanges || !savedRanges.has(editor)) return false;

    var savedRange = savedRanges.get(editor);
    if (!isRangeInContent(savedRange, content)) {
      savedRanges.delete(editor);
      return false;
    }

    content.focus({ preventScroll: true });

    var selection = window.getSelection();
    if (!selection) return false;

    selection.removeAllRanges();
    selection.addRange(savedRange);
    return true;
  }

  function focusContent(editor) {
    var content = getContent(editor);
    if (!content) return null;
    if (!restoreSelection(editor)) content.focus({ preventScroll: true });
    return content;
  }

  function execCommand(command, value) {
    try {
      return document.execCommand(command, false, value != null ? value : undefined);
    } catch (e) {
      return false;
    }
  }

  function execOnEditor(editor, command, value) {
    focusContent(editor);
    return execCommand(command, value);
  }

  function wrapRangeWithTag(range, tagName) {
    var wrapper = document.createElement(tagName);

    try {
      range.surroundContents(wrapper);
    } catch (e) {
      wrapper.appendChild(range.extractContents());
      range.insertNode(wrapper);
    }

    var selection = window.getSelection();
    if (!selection) return wrapper;

    var nextRange = document.createRange();
    nextRange.selectNodeContents(wrapper);
    nextRange.collapse(false);
    selection.removeAllRanges();
    selection.addRange(nextRange);
    return wrapper;
  }

  function applyInlineFormat(editor, command) {
    var content = getContent(editor);
    if (!content) return;

    focusContent(editor);

    try {
      document.execCommand('styleWithCSS', false, false);
    } catch (e) {}

    if (execCommand(command)) {
      saveSelection(editor);
      return;
    }

    var selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    var range = selection.getRangeAt(0);
    if (!isRangeInContent(range, content)) return;

    var tagName = INLINE_COMMANDS[command];
    if (!tagName) return;

    if (range.collapsed) {
      var placeholder = document.createElement(tagName);
      placeholder.appendChild(document.createTextNode('\u200B'));
      range.insertNode(placeholder);

      var cursor = document.createRange();
      cursor.setStart(placeholder.firstChild, 1);
      cursor.collapse(true);
      selection.removeAllRanges();
      selection.addRange(cursor);
      saveSelection(editor);
      return;
    }

    wrapRangeWithTag(range, tagName);
    saveSelection(editor);
  }

  function insertHtmlAtSelection(editor, html) {
    focusContent(editor);

    if (execCommand('insertHTML', html)) {
      saveSelection(editor);
      return;
    }

    var selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    var range = selection.getRangeAt(0);
    if (!isRangeInContent(range, getContent(editor))) return;

    range.deleteContents();

    var template = document.createElement('template');
    template.innerHTML = html;
    var fragment = template.content;
    var lastNode = fragment.lastChild;

    range.insertNode(fragment);

    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    saveSelection(editor);
  }

  function normalizeBlockValue(value) {
    if (!value) return value;
    return value.charAt(0) === '<' ? value : '<' + value + '>';
  }

  function highlightCodeBlock(codeEl, lang) {
    if (!window.hljs || !codeEl) return;

    var language = lang || (codeEl.className.match(/\blanguage-([\w-]+)\b/) || [])[1];
    var resolved = resolveLanguage(language);
    var text = codeEl.textContent || '';

    codeEl.removeAttribute('data-highlighted');
    codeEl.className = language ? 'language-' + language : '';

    if (!resolved || !hljs.getLanguage(resolved)) {
      codeEl.textContent = text;
      return;
    }

    try {
      var result = hljs.highlight(text, { language: resolved, ignoreIllegals: true });
      codeEl.innerHTML = result.value;
      codeEl.classList.add('hljs');
      if (language) codeEl.classList.add('language-' + language);
    } catch (e) {
      codeEl.textContent = text;
    }
  }

  function highlightCodeBlocks(editor) {
    if (!editor) return;
    editor.querySelectorAll('[data-slot="editor-content"] pre code').forEach(function (block) {
      highlightCodeBlock(block);
    });
  }

  function buildLanguageSelect(selected) {
    var select = document.createElement('select');
    select.setAttribute('data-editor-code-lang', '');
    select.setAttribute('aria-label', 'Code language');
    select.className = 'editor-code-lang-select';
    CODE_LANGUAGES.forEach(function (lang) {
      var option = document.createElement('option');
      option.value = lang.value;
      option.textContent = lang.label;
      if (lang.value === selected) option.selected = true;
      select.appendChild(option);
    });
    return select;
  }

  function buildCodeBlockHtml() {
    var sample = LANGUAGE_SAMPLES.javascript;

    var block = document.createElement('div');
    block.setAttribute('data-slot', 'editor-code-block');
    block.setAttribute('contenteditable', 'false');

    var header = document.createElement('div');
    header.setAttribute('data-slot', 'editor-code-block-header');
    header.setAttribute('contenteditable', 'false');
    header.appendChild(buildLanguageSelect('javascript'));

    var pre = document.createElement('pre');
    pre.setAttribute('contenteditable', 'false');
    var code = document.createElement('code');
    code.className = 'language-javascript';
    code.textContent = sample;
    pre.appendChild(code);
    block.appendChild(header);
    block.appendChild(pre);

    return block.outerHTML + '<p><br></p>';
  }

  function insertCodeBlock(editor) {
    insertHtmlAtSelection(editor, buildCodeBlockHtml());
    highlightCodeBlocks(editor);
  }

  function insertLink(editor) {
    var url = window.prompt('Enter URL', 'https://');
    if (!url) return;

    focusContent(editor);
    var selection = window.getSelection();
    var selectedText = selection ? selection.toString() : '';

    if (selectedText) {
      execCommand('createLink', url);
    } else {
      insertHtmlAtSelection(
        editor,
        '<a href="' + escapeAttr(url) + '">' + escapeHtml(url) + '</a>'
      );
    }
    saveSelection(editor);
  }

  function insertImage(editor) {
    var url = window.prompt('Enter image URL', 'https://');
    if (!url) return;

    insertHtmlAtSelection(
      editor,
      '<img src="' + escapeAttr(url) + '" alt="" class="editor-inline-image">'
    );
    saveSelection(editor);
  }

  function handleToolbarCommand(editor, command, value) {
    if (INLINE_COMMANDS[command]) {
      applyInlineFormat(editor, command);
      return;
    }

    if (command === 'inlineCode') {
      focusContent(editor);
      var selection = window.getSelection();
      var text = selection && selection.toString ? selection.toString() : 'code';
      insertHtmlAtSelection(editor, '<code>' + escapeHtml(text) + '</code>');
      return;
    }

    if (command === 'codeBlock') {
      insertCodeBlock(editor);
      return;
    }

    if (command === 'createLink') {
      insertLink(editor);
      return;
    }

    if (command === 'insertImage') {
      insertImage(editor);
      return;
    }

    if (command === 'formatBlock') {
      execOnEditor(editor, 'formatBlock', normalizeBlockValue(value || 'p'));
      saveSelection(editor);
      return;
    }

    if (command === 'removeFormat') {
      execOnEditor(editor, 'removeFormat');
      execCommand('unlink');
      saveSelection(editor);
      return;
    }

    if (command === 'insertHorizontalRule') {
      execOnEditor(editor, 'insertHorizontalRule');
      saveSelection(editor);
      return;
    }

    if (command === 'fullscreen') {
      var active = editor.getAttribute('data-editor-fullscreen') === 'true';
      editor.setAttribute('data-editor-fullscreen', active ? 'false' : 'true');
      return;
    }

    execOnEditor(editor, command, value);
    saveSelection(editor);
  }

  function bindSelectionTracking(editor) {
    var content = getContent(editor);
    if (!content) return;

    ['keyup', 'mouseup', 'focus'].forEach(function (eventName) {
      content.addEventListener(eventName, function () {
        saveSelection(editor);
      });
    });

    if (trackedEditors) trackedEditors.add(editor);
  }

  function initEditorToolbar(editor) {
    var content = getContent(editor);
    if (!content) return;

    bindSelectionTracking(editor);

    editor.querySelectorAll('[data-editor-command]').forEach(function (button) {
      button.addEventListener('mousedown', function (event) {
        event.preventDefault();
      });
      button.addEventListener('click', function (event) {
        event.preventDefault();
        handleToolbarCommand(
          editor,
          button.getAttribute('data-editor-command'),
          button.getAttribute('data-editor-value')
        );
      });
    });

    var headingSelect = editor.querySelector('[data-editor-heading]');
    if (headingSelect) {
      headingSelect.addEventListener('change', function () {
        execOnEditor(editor, 'formatBlock', normalizeBlockValue(headingSelect.value));
        saveSelection(editor);
      });
    }

    editor.addEventListener('change', function (event) {
      if (!event.target.matches('[data-editor-code-lang]')) return;
      var block = event.target.closest('[data-slot="editor-code-block"]');
      var code = block && block.querySelector('code');
      if (!code) return;

      var lang = event.target.value;
      var sample = LANGUAGE_SAMPLES[lang];
      if (sample) code.textContent = sample;
      highlightCodeBlock(code, lang);
    });
  }

  function initEditorFullItem(editor) {
    var toggle = editor.querySelector('[data-editor-full-item]');
    if (!toggle) return;

    toggle.addEventListener('click', function () {
      window.requestAnimationFrame(function () {
        var on = toggle.getAttribute('aria-checked') === 'true';
        editor.setAttribute('data-full-item', on ? 'true' : 'false');
      });
    });
  }

  if (!window.__editorSelectionListener) {
    document.addEventListener('selectionchange', function () {
      if (!trackedEditors) return;
      trackedEditors.forEach(function (editor) {
        saveSelection(editor);
      });
    });
    window.__editorSelectionListener = true;
  }

  window.initEditors = function (root) {
    if (window.hljs && typeof window.hljs.configure === 'function') {
      hljs.configure({ ignoreUnescapedHTML: true });
    }

    try {
      document.execCommand('styleWithCSS', false, false);
    } catch (e) {}

    (root || document).querySelectorAll('[data-slot="editor"]').forEach(function (editor) {
      if (editor.dataset.editorBound === 'true') return;
      editor.dataset.editorBound = 'true';
      initEditorToolbar(editor);
      initEditorFullItem(editor);
      highlightCodeBlocks(editor);
    });
  };
})();
