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
  renderForm,
  renderButton,
} from './view.js';
import parse from './parser.js';
import resources from './locales/en.js';

const runApp = () => {
  const period = 5000;
  const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  const formElement = document.querySelector('.rss-form');
  const fieldElement = document.querySelector('.form-control');
  const submitButtonElement = document.querySelector('.submit-btn');
  const dataContainerElement = document.querySelector('.wrapper');

  fieldElement.select();

  i18next.init({
    lng: 'en',
    resources,
  }).then(renderText.bind(null));

  const schema = yup
    .string(i18next.t('validUrl'))
    .required(i18next.t('required'))
    .url(i18next.t('validUrl'));

  const errorMessages = {
    network: 'networkError',
  };

  const validate = (rssLink, addedRssLinks) => {
    try {
      schema
        .notOneOf(addedRssLinks, i18next.t('double'))
        .validateSync(rssLink, { abortEarly: false });
      return {};
    } catch (e) {
      return e;
    }
  };

  const updateValidationState = (watchedState) => {
    const addedRssLinks = watchedState.form.feeds.map(({ rssLink }) => rssLink);
    const error = validate(watchedState.form.fields.rssLink, addedRssLinks);
    /* eslint no-param-reassign:
      ["error", { "props": true, "ignorePropertyModificationsFor": ["watchedState"] }] */
    watchedState.form.valid = _.isEqual(error, {});
    watchedState.form.error = error;
  };

  const state = {
    form: {
      processState: 'filling',
      fields: {
        rssLink: '',
      },
      feeds: [],
      posts: [],
      valid: true,
      error: {},
    },
  };

  const processStateHandler = (processState) => {
    switch (processState) {
      case 'filling':
        renderForm();
        renderSpinner(submitButtonElement);
        break;
      case 'processing':
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
      case 'form.valid':
        renderButton(currentValue);
        break;
      case 'form.error':
        renderErrors(currentValue);
        break;
      case 'form.processState':
        processStateHandler(currentValue);
        break;
      case 'form.feeds':
        renderFeeds(dataContainerElement, currentValue[currentValue.length - 1]);
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
      const requestUrl = `${proxyUrl}${rssLink}`;
      axios.get(requestUrl)
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
    setTimeout(autoUpdate.bind(null, feeds), period);
  };

  fieldElement.addEventListener('change', ({ target }) => {
    watchedState.form.fields.rssLink = target.value;
    updateValidationState(watchedState);
  });

  formElement.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.processState = 'processing';
    axios.get(`${proxyUrl}${watchedState.form.fields.rssLink}`)
      .then((response) => {
        watchedState.form.processState = 'filling';
        return response;
      })
      .then((response) => parse(response.data))
      .then((data) => {
        const feedId = _.uniqueId();
        const newFeed = {
          id: feedId,
          name: data.name,
          rssLink: watchedState.form.fields.rssLink,
        };
        const newPosts = data.items.map(
          ({ title, link, id }) => ({
            feedId, title, link, id,
          }),
        );
        watchedState.form.feeds.push(newFeed);
        watchedState.form.posts.push(...newPosts);
        autoUpdate(watchedState.form.feeds, period, watchedState);
      })
      .catch(() => {
        watchedState.form.error = errorMessages.network;
        watchedState.form.processState = 'failed';
      });
  });
};

export default runApp;
