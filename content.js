(() => {
  'use strict';

  const BUTTON_CLASS = 'caprover-redeploy-button';
  const CELL_MARKER = 'caproverRedeployReady';
  const PAGE_PATH_PATTERN = /\/apps\/details\/[^/]+/;
  const IMAGE_HEADER_LABELS = ['image name', 'имя образа'];
  const METHOD_LABELS = [
    'deploy via imagename',
    'развернуть по имени образа',
  ];
  const DEPLOY_BUTTON_LABELS = ['deploy now', 'развернуть сейчас'];

  // ReloadOutlined from @ant-design/icons (MIT).
  const refreshIcon = `
    <svg viewBox="0 0 1024 1024" aria-hidden="true" focusable="false">
      <path d="M909.1 209.3l-56.4 44.1C775.8 155.1 656.2 92 521.9 92 290 92 102.3 279.5 102 511.5 101.7 743.7 289.8 932 521.9 932c181.3 0 335.8-115 394.6-276.1 1.5-4.2-.7-8.9-4.9-10.3l-56.7-19.5a8 8 0 0 0-10.1 4.8c-1.8 5-3.8 10-5.9 14.9-17.3 41-42.1 77.8-73.7 109.4A344.77 344.77 0 0 1 655.9 829c-42.3 17.9-87.4 27-133.8 27-46.5 0-91.5-9.1-133.8-27A341.5 341.5 0 0 1 279 755.2a342.16 342.16 0 0 1-73.7-109.4c-17.9-42.4-27-87.4-27-133.9s9.1-91.5 27-133.9c17.3-41 42.1-77.8 73.7-109.4 31.6-31.6 68.4-56.4 109.3-73.8 42.3-17.9 87.4-27 133.8-27 46.5 0 91.5 9.1 133.8 27a341.5 341.5 0 0 1 109.3 73.8c9.9 9.9 19.2 20.4 27.8 31.4l-60.2 47a8 8 0 0 0 3 14.1l175.6 43c5 1.2 9.9-2.6 9.9-7.7l.8-180.9c-.1-6.6-7.8-10.3-13-6.2z" />
    </svg>`;

  function normalizeText(value) {
    return (value || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function containsLabel(value, labels) {
    const normalized = normalizeText(value);
    return labels.some((label) => normalized.includes(label));
  }

  function isDeploymentPage() {
    return PAGE_PATH_PATTERN.test(
      `${window.location.pathname}${window.location.hash}`
    );
  }

  function findImageColumnIndex(table) {
    const headers = [...table.querySelectorAll('thead th')];
    const labeledColumnIndex = headers.findIndex((header) =>
      containsLabel(header.textContent, IMAGE_HEADER_LABELS)
    );
    if (labeledColumnIndex >= 0) return labeledColumnIndex;

    // AppVersionTable has five fixed columns and deployedImageName is the fourth.
    // This fallback keeps the extension working with every CapRover locale.
    return headers.length === 5 ? 3 : -1;
  }

  function findImageName(cell) {
    const clone = cell.cloneNode(true);
    clone.querySelectorAll(`.${BUTTON_CLASS}`).forEach((button) => button.remove());
    return (clone.textContent || '').trim();
  }

  function findMethodSixContainer() {
    const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')];
    const heading = headings.find((item) =>
      containsLabel(item.textContent, METHOD_LABELS)
    );

    if (!heading) {
      const imageInput = [...document.querySelectorAll('input')].find((input) =>
        normalizeText(input.placeholder).includes('nginxdemos/hello')
      );
      return imageInput?.closest('div[style*="padding"]') || null;
    }

    let sibling = heading.nextElementSibling;
    while (sibling && !sibling.querySelector('input')) {
      if (/^H[1-6]$/.test(sibling.tagName)) return null;
      sibling = sibling.nextElementSibling;
    }
    return sibling;
  }

  function findDeployButton(container) {
    const buttons = [...container.querySelectorAll('button')];
    return (
      buttons.find((button) =>
        containsLabel(button.textContent, DEPLOY_BUTTON_LABELS)
      ) || buttons.find((button) => button.classList.contains('ant-btn-primary'))
    );
  }

  function setReactInputValue(input, value) {
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;

    if (!setter) throw new Error('Unable to update the CapRover image input.');

    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function waitForReactRender() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  async function deployImage(imageName, sourceButton) {
    const container = findMethodSixContainer();
    const input = container?.querySelector('input');

    if (!container || !input) {
      throw new Error('Method 6: Deploy via ImageName was not found on this page.');
    }

    sourceButton.disabled = true;
    sourceButton.classList.add('is-loading');
    sourceButton.title = `Deploying ${imageName}…`;

    setReactInputValue(input, imageName);
    await waitForReactRender();

    const deployButton = findDeployButton(container);
    if (!deployButton || deployButton.disabled) {
      throw new Error('The CapRover “Deploy Now” button is unavailable.');
    }

    deployButton.click();
    sourceButton.classList.remove('is-loading');
    sourceButton.classList.add('is-done');
    sourceButton.title = `Deployment started for ${imageName}`;

    setTimeout(() => {
      sourceButton.disabled = false;
      sourceButton.classList.remove('is-done');
      sourceButton.title = `Deploy this image again: ${imageName}`;
    }, 3000);
  }

  function createRedeployButton(imageName) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = BUTTON_CLASS;
    button.innerHTML = refreshIcon;
    button.title = `Deploy this image again: ${imageName}`;
    button.setAttribute('aria-label', `Deploy image ${imageName} again`);

    button.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopPropagation();

      try {
        await deployImage(imageName, button);
      } catch (error) {
        button.disabled = false;
        button.classList.remove('is-loading');
        button.classList.add('is-error');
        button.title = error instanceof Error ? error.message : String(error);
        console.error('[CapRover Redeploy]', error);
        setTimeout(() => button.classList.remove('is-error'), 3000);
      }
    });

    return button;
  }

  function enhanceVersionTable(table) {
    const imageColumnIndex = findImageColumnIndex(table);
    if (imageColumnIndex < 0) return;

    table.querySelectorAll('tbody tr').forEach((row) => {
      const cells = row.querySelectorAll(':scope > td');
      const cell = cells[imageColumnIndex];
      if (!cell) return;

      const imageName = findImageName(cell);
      if (!imageName || imageName === 'n/a') return;

      const existingButton = cell.querySelector(`.${BUTTON_CLASS}`);
      if (existingButton?.dataset.imageName === imageName) return;

      existingButton?.remove();

      cell.dataset[CELL_MARKER] = 'true';
      cell.classList.add('caprover-redeploy-image-cell');
      const button = createRedeployButton(imageName);
      button.dataset.imageName = imageName;
      cell.append(button);
    });
  }

  function enhancePage() {
    if (!isDeploymentPage()) return;
    document.querySelectorAll('.ant-table table').forEach(enhanceVersionTable);
  }

  let updateScheduled = false;
  function scheduleEnhancement() {
    if (updateScheduled) return;
    updateScheduled = true;
    queueMicrotask(() => {
      updateScheduled = false;
      enhancePage();
    });
  }

  const observer = new MutationObserver(scheduleEnhancement);
  observer.observe(document.documentElement, {
    childList: true,
    characterData: true,
    subtree: true,
  });
  window.addEventListener('hashchange', scheduleEnhancement);
  window.addEventListener('popstate', scheduleEnhancement);
  scheduleEnhancement();
})();
