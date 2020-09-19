import _ from 'lodash';
import i18next from 'i18next';

const renderErrors = (error) => {
  if (error === 'networkError') {
    const modalOverlayElement = document.querySelector('.modal-overlay');
    const modalErrorElement = document.querySelector('.modal-error');
    const errorTextElement = document.querySelector('.error-text');
    const closeModalElement = document.querySelector('.close-modal');
    modalOverlayElement.classList.add('modal-overlay__show');
    modalErrorElement.classList.add('modal-error__show');
    errorTextElement.textContent = (i18next.t(error));
    closeModalElement.textContent = (i18next.t('closeModalButton'));
    closeModalElement.addEventListener('click', () => {
      modalOverlayElement.classList.remove('modal-overlay__show');
      modalErrorElement.classList.remove('modal-error__show');
    });
  } else {
    const fieldElement = document.querySelector('input[name="url"]');
    const errorElement = fieldElement.nextElementSibling;
    if (errorElement) {
      fieldElement.classList.remove('is-invalid');
      errorElement.remove();
    }
    if (_.isEqual(error, {})) {
      return;
    }
    const { message } = error;
    const feedbackElement = document.createElement('div');
    feedbackElement.classList.add('invalid-feedback');
    feedbackElement.innerHTML = message;
    fieldElement.classList.add('is-invalid');
    fieldElement.after(feedbackElement);
  }
};

const renderForm = () => {
  const formElement = document.querySelector('.rss-form');
  formElement.reset();
};

const renderFeeds = (wrapper, { name, id }) => {
  const sectionElement = document.createElement('section');
  const titleElement = document.createElement('h2');
  const listElement = document.createElement('ul');
  listElement.setAttribute('data-list-id', id);
  sectionElement.setAttribute('data-section-id', id);
  titleElement.textContent = name;
  sectionElement.append(titleElement, listElement);
  wrapper.prepend(sectionElement);
};

const renderPosts = (allPosts) => {
  const sectionsColl = document.querySelectorAll('[data-section-id]');
  sectionsColl.forEach((s) => {
    const currentFeedId = s.dataset.sectionId;
    const list = s.querySelector(`[data-list-id="${currentFeedId}"]`);
    const currentFeedPosts = allPosts.filter(({ feedId }) => feedId === currentFeedId);
    const listItems = currentFeedPosts.map(({ title, link }) => `<li><a href="${link}">${title}</li>`).join('');
    list.innerHTML = listItems;
  });
};

const renderSpinner = (element) => {
  if (element.disabled) {
  /* eslint no-param-reassign:
  ["error", { "props": true, "ignorePropertyModificationsFor": ["element"] }] */
    element.disabled = false;
    element.innerHTML = i18next.t('addContentButton');
  } else {
    const spinnerElement = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
    const textElement = document.createElement('span');
    textElement.textContent = i18next.t('loading');
    element.disabled = true;
    element.innerHTML = spinnerElement;
    element.appendChild(textElement);
  }
};

const renderText = () => {
  const mainTitleElement = document.querySelector('.main-title');
  const hintElement = document.querySelector('.hint');
  const submitButtonElement = document.querySelector('.submit-btn');
  const copyrightElement = document.querySelector('.copyright');
  const fieldElement = document.querySelector('.form-control');
  const infoElement = document.querySelector('.info');
  mainTitleElement.textContent = i18next.t('mainTitle');
  hintElement.textContent = i18next.t('hint');
  submitButtonElement.textContent = i18next.t('addContentButton');
  infoElement.textContent = i18next.t('info');
  copyrightElement.textContent = i18next.t('copyright');
  fieldElement.placeholder = i18next.t('placeholder');
};

const renderButton = (flag) => {
  const submitButtonElement = document.querySelector('.submit-btn');
  submitButtonElement.disabled = !flag;
};

export {
  renderErrors,
  renderFeeds,
  renderPosts,
  renderSpinner,
  renderText,
  renderForm,
  renderButton,
};
