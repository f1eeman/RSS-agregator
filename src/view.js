import _ from 'lodash';
import i18next from 'i18next';

/* eslint no-param-reassign:
["error", { "props": true, "ignorePropertyModificationsFor": ["element"] }] */

const periodForRemoveELement = 5000;

const renderErrors = (errors) => {
  if (errors.message === 'Request failed with status code 404') {
    const alertErrorElement = document.createElement('div');
    const hintElement = document.querySelector('.hint');
    alertErrorElement.classList.add('alert', 'alert-danger');
    alertErrorElement.setAttribute('role', 'alert');
    alertErrorElement.textContent = i18next.t('networkError');
    hintElement.after(alertErrorElement);
    setTimeout(() => alertErrorElement.remove(), periodForRemoveELement);
  } else {
    const fieldElement = document.querySelector('input[name="url"]');
    const errorElement = fieldElement.nextElementSibling;
    if (errorElement) {
      fieldElement.classList.remove('is-invalid');
      errorElement.remove();
    }
    if (_.isEqual(errors, {})) {
      return;
    }
    const { message } = errors;
    const feedbackElement = document.createElement('div');
    feedbackElement.classList.add('invalid-feedback');
    feedbackElement.innerHTML = i18next.t(message);
    fieldElement.classList.add('is-invalid');
    fieldElement.after(feedbackElement);
  }
};

const resetForm = () => {
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
    const listItems = currentFeedPosts.map(({ title, link }) => `<li><a href="${link}" target="_blank">${title}</li>`).join('');
    list.innerHTML = listItems;
  });
};

const renderSpinner = (element) => {
  if (element.disabled) {
    element.disabled = false;
    element.innerHTML = i18next.t('addButton');
  } else {
    const spinnerElement = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
    const textElement = document.createElement('span');
    textElement.textContent = i18next.t('loading');
    element.disabled = true;
    element.innerHTML = spinnerElement;
    element.appendChild(textElement);
  }
};

const renderText = (translateKeys) => {
  const mainTitleElement = document.querySelector('.main-title');
  const hintElement = document.querySelector('.hint');
  const submitButtonElement = document.querySelector('.submit-btn');
  const copyrightElement = document.querySelector('.copyright');
  const fieldElement = document.querySelector('.form-control');
  const promoElement = document.querySelector('.info');
  mainTitleElement.textContent = i18next.t(translateKeys.mainTitle);
  hintElement.textContent = i18next.t(translateKeys.example);
  submitButtonElement.textContent = i18next.t(translateKeys.addButton);
  promoElement.textContent = i18next.t(translateKeys.promo);
  copyrightElement.textContent = i18next.t(translateKeys.copyright);
  fieldElement.placeholder = i18next.t(translateKeys.placeholder);
};

const toggleAccessButton = (flag) => {
  const submitButtonElement = document.querySelector('.submit-btn');
  submitButtonElement.disabled = !flag;
};

export {
  renderErrors,
  renderFeeds,
  renderPosts,
  renderSpinner,
  renderText,
  resetForm,
  toggleAccessButton,
};
