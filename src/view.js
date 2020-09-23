import _ from 'lodash';
import i18next from 'i18next';

/* eslint no-param-reassign:
["error", { "props": true, "ignorePropertyModificationsFor": ["element"] }] */

const periodForRemoveELement = 5000;

const renderErrors = (error) => {
  if (error.errorStatus) {
    const alertErrorElement = document.createElement('div');
    const hintElement = document.querySelector('.hint');
    alertErrorElement.classList.add('alert', 'alert-danger');
    alertErrorElement.setAttribute('role', 'alert');
    alertErrorElement.textContent = i18next.t(`networkErrors.${error.errorStatus}`);
    hintElement.after(alertErrorElement);
    setTimeout(() => alertErrorElement.remove(), periodForRemoveELement);
  } else {
    const fieldElement = document.querySelector('.form-control');
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
    feedbackElement.innerHTML = i18next.t(message);
    fieldElement.classList.add('is-invalid');
    fieldElement.after(feedbackElement);
  }
};

const resetForm = () => {
  const formElement = document.querySelector('.rss-form');
  formElement.reset();
};

const renderFeeds = (feeds) => {
  const { name, id } = feeds[feeds.length - 1];
  const wrapper = document.querySelector('.wrapper');
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

const renderText = () => {
  const mainTitleElement = document.querySelector('.main-title');
  const hintElement = document.querySelector('.hint');
  const submitButtonElement = document.querySelector('.submit-btn');
  const copyrightElement = document.querySelector('.copyright');
  const fieldElement = document.querySelector('.form-control');
  const promoElement = document.querySelector('.info');
  const toggleLanguageElement = document.querySelector('.toggle-lang');
  mainTitleElement.textContent = i18next.t('mainTitle');
  hintElement.textContent = i18next.t('example');
  submitButtonElement.textContent = i18next.t('addButton');
  promoElement.textContent = i18next.t('promo');
  copyrightElement.textContent = i18next.t('copyright');
  fieldElement.placeholder = i18next.t('placeholder');
  toggleLanguageElement.textContent = i18next.t('toggleLang');
};

const changeLanguage = (lang) => {
  i18next.changeLanguage(lang, renderText);
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
  changeLanguage,
};
