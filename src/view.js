import onChange from 'on-change';
import i18next from 'i18next';
import _ from 'lodash';
/* eslint no-param-reassign:
["error", { "props": true, "ignorePropertyModificationsFor": ["button"] }] */

const periodForRemoveELement = 5000;
const hintElement = document.querySelector('.hint');
const formElement = document.querySelector('.rss-form');
const fieldElement = document.querySelector('.form-control');
const wrapper = document.querySelector('.feeds');
const mainTitleElement = document.querySelector('.main-title');
const submitButtonElement = document.querySelector('.submit-btn');
const copyrightElement = document.querySelector('.copyright');
const promoElement = document.querySelector('.info');
const toggleLanguageElement = document.querySelector('.toggle-lang');

const renderErrors = (state) => {
  switch (state.form.processState) {
    case 'filling': {
      const { error } = state.form;
      const errorElement = document.querySelector('.feedback');
      if (errorElement) {
        fieldElement.classList.remove('is-invalid');
        errorElement.remove();
      }
      if (_.isNull(error)) {
        return;
      }
      const { message } = error;
      const feedbackElement = document.createElement('div');
      feedbackElement.classList.add('feedback', 'invalid-feedback');
      feedbackElement.innerHTML = i18next.t(message);
      fieldElement.classList.add('is-invalid');
      fieldElement.after(feedbackElement);
      break;
    }
    case 'failed': {
      const { error } = state;
      const alertErrorElement = document.createElement('div');
      alertErrorElement.classList.add('alert', 'alert-danger');
      alertErrorElement.setAttribute('role', 'alert');
      alertErrorElement.textContent = i18next.t(`networkErrors.${error.errorStatus}`);
      hintElement.after(alertErrorElement);
      setTimeout(() => alertErrorElement.remove(), periodForRemoveELement);
      break;
    }
    default:
      break;
  }
};

const renderFeeds = (feeds) => {
  const { name, id } = feeds[feeds.length - 1];
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

const renderSpinner = (processState, element) => {
  const turnOnSpinner = (button) => {
    const spinnerElement = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
    const textElement = document.createElement('span');
    textElement.textContent = i18next.t('loading');
    button.disabled = true;
    button.innerHTML = spinnerElement;
    button.appendChild(textElement);
  };

  const turnOffSpinner = (button) => {
    button.disabled = false;
    button.innerHTML = i18next.t('addButton');
  };

  if (processState === 'processing') {
    turnOnSpinner(element);
  } else {
    turnOffSpinner(element);
  }
};

const renderText = () => {
  mainTitleElement.textContent = i18next.t('mainTitle');
  hintElement.textContent = i18next.t('example');
  submitButtonElement.textContent = i18next.t('addButton');
  promoElement.textContent = i18next.t('promo');
  copyrightElement.textContent = i18next.t('copyright');
  fieldElement.placeholder = i18next.t('placeholder');
  toggleLanguageElement.textContent = i18next.t('toggleLang');
};

const resetForm = () => {
  formElement.reset();
};

const toggleAccessButton = (flag) => {
  submitButtonElement.disabled = !flag;
};

const getWatchedState = (state) => {
  const watchedState = onChange(state, (path, newValue) => {
    switch (path) {
      case 'form.valid':
        toggleAccessButton(newValue);
        break;
      case 'form.error':
        renderErrors(watchedState);
        break;
      case 'form.processState':
        renderSpinner(newValue, submitButtonElement);
        break;
      case 'form.fields.rssLink':
        resetForm();
        break;
      case 'error':
        renderErrors(watchedState);
        break;
      case 'feeds':
        renderFeeds(newValue);
        break;
      case 'posts':
        renderPosts(newValue);
        break;
      default:
        break;
    }
  });
  return watchedState;
};

export { getWatchedState, renderText };
