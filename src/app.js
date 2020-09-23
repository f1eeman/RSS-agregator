import _ from 'lodash';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import {
  renderErrors,
  renderFeeds,
  renderPosts,
  renderSpinner,
  renderText,
  resetForm,
  toggleAccessButton,
  changeLanguage,
} from './view.js';
import parse from './parser.js';
import resources from './locales/index.js';

/* eslint no-param-reassign:
  ["error", { "props": true, "ignorePropertyModificationsFor": ["watchedState"] }] */

const runApp = () => {
  const periodForUpdatePosts = 5000;
  const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  const formElement = document.querySelector('.rss-form');
  const fieldElement = document.querySelector('.form-control');
  const submitButtonElement = document.querySelector('.submit-btn');
  const toggleLanguageElement = document.querySelector('.toggle-lang');

  formElement.reset();
  fieldElement.select();

  const state = {
    language: 'ru',
    form: {
      processState: 'filling',
      fields: {
        rssLink: '',
      },
      feeds: [],
      posts: [],
      valid: true,
      errors: {},
    },
  };

  i18next.init({
    lng: state.language,
    resources,
  }).then(renderText);

  const schema = yup
    .string('validUrl')
    .required('required')
    .url('validUrl');

  const validate = (rssLink, addedRssLinks) => {
    try {
      schema
        .notOneOf(addedRssLinks, 'double')
        .validateSync(rssLink, { abortEarly: false });
      return {};
    } catch (error) {
      return error;
    }
  };

  const updateValidationState = (watchedState) => {
    const addedRssLinks = watchedState.form.feeds.map(({ rssLink }) => rssLink);
    const error = validate(watchedState.form.fields.rssLink, addedRssLinks);
    watchedState.form.valid = _.isEqual(error, {});
    watchedState.form.errors = error;
  };

  const processStateHandler = (processState) => {
    switch (processState) {
      case 'processing':
        renderSpinner(submitButtonElement);
        break;
      case 'finished':
        resetForm();
        renderSpinner(submitButtonElement);
        break;
      case 'failed':
        renderSpinner(submitButtonElement);
        break;
      default:
        throw new Error(`Unknown state's process: ${processState}`);
    }
  };

  const watchedState = onChange(state, (path, currentValue) => {
    switch (path) {
      case 'language':
        changeLanguage(currentValue);
        break;
      case 'form.valid':
        toggleAccessButton(currentValue);
        break;
      case 'form.errors':
        renderErrors(currentValue);
        break;
      case 'form.processState':
        processStateHandler(currentValue);
        break;
      case 'form.feeds':
        renderFeeds(currentValue);
        break;
      case 'form.posts':
        renderPosts(currentValue);
        break;
      default:
        break;
    }
  });

  const autoUpdate = (feeds) => {
    feeds.forEach(({ rssLink, id: feedId }) => {
      axios.get(rssLink)
        .then((response) => parse(response.data))
        .then((data) => {
          const newPosts = data.items.map(
            ({ title, link, id }) => ({
              feedId, title, link, id,
            }),
          );
          const exisitingPostsIds = watchedState.form.posts.map((post) => post.id);
          const filtredPosts = newPosts.filter(({ id }) => !exisitingPostsIds.includes(id));
          if (filtredPosts.length > 0) {
            watchedState.form.posts.push(...filtredPosts);
          }
        });
    });
    setTimeout(autoUpdate.bind(null, feeds), periodForUpdatePosts);
  };

  toggleLanguageElement.addEventListener('click', (e) => {
    e.preventDefault();
    watchedState.language = watchedState.language === 'en' ? 'ru' : 'en';
  });

  fieldElement.addEventListener('change', ({ target }) => {
    watchedState.form.fields.rssLink = target.value;
    updateValidationState(watchedState);
  });

  formElement.addEventListener('submit', (e) => {
    e.preventDefault();
    if (watchedState.form.processState === 'processing' || !watchedState.form.valid) {
      return;
    }
    watchedState.form.processState = 'processing';
    const { rssLink } = watchedState.form.fields;
    axios.get(`${proxyUrl}${watchedState.form.fields.rssLink}`)
      .then((response) => parse(response.data))
      .then((data) => {
        const feedId = _.uniqueId();
        const newFeed = {
          id: feedId,
          name: data.name,
          rssLink,
        };
        const newPosts = data.items.map(
          ({ title, link, id }) => ({
            feedId, title, link, id,
          }),
        );
        watchedState.form.feeds.push(newFeed);
        watchedState.form.posts.push(...newPosts);
        watchedState.form.processState = 'finished';
      })
      .catch((error) => {
        watchedState.form.errors = { errorStatus: error.response.status };
        watchedState.form.processState = 'failed';
        throw error;
      });
  });
  autoUpdate(watchedState.form.feeds);
};

export default runApp;
