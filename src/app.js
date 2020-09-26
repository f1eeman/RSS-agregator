import _ from 'lodash';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import { getWatchedState, renderText } from './view.js';
import parse from './parser.js';
import resources from './locales/index.js';

/* eslint no-param-reassign:
  ["error", { "props": true, "ignorePropertyModificationsFor": ["condition"] }] */

const runApp = () => {
  const periodForUpdatePosts = 5000;
  const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  const formElement = document.querySelector('.rss-form');
  const fieldElement = document.querySelector('.form-control');
  const toggleLanguageElement = document.querySelector('.toggle-lang');

  formElement.reset();
  fieldElement.select();

  const state = {
    language: 'en',
    form: {
      processState: 'filling',
      fields: {
        rssLink: '',
      },
      valid: null,
      error: null,
    },
    error: null,
    feeds: [],
    posts: [],
  };

  i18next.init({
    lng: state.language,
    resources,
  }).then(renderText);

  const schema = yup
    .string('validUrl')
    .required('required')
    .url('validUrl');

  const watchedState = getWatchedState(state);

  const validate = (rssLink, addedRssLinks) => {
    try {
      schema
        .notOneOf(addedRssLinks, 'double')
        .validateSync(rssLink, { abortEarly: false });
      return null;
    } catch (error) {
      return error;
    }
  };

  const updateValidationState = (link, condition) => {
    const addedRssLinks = condition.feeds.map(({ rssLink }) => rssLink);
    const error = validate(link, addedRssLinks);
    condition.form.valid = _.isNull(error);
    condition.form.error = error;
  };

  const autoUpdate = (feeds) => {
    feeds.forEach(({ rssLink, id: feedId }) => {
      axios.get(`${proxyUrl}${rssLink}`)
        .then((response) => parse(response.data))
        .then((data) => {
          const newPosts = data.items.map(
            ({ title, link, id }) => ({
              feedId, title, link, id,
            }),
          );
          const exisitingPostsIds = watchedState.posts.map((post) => post.id);
          const filtredPosts = newPosts.filter(({ id }) => !exisitingPostsIds.includes(id));
          if (filtredPosts.length > 0) {
            watchedState.posts.push(...filtredPosts);
          }
        });
    });
    setTimeout(autoUpdate.bind(null, feeds), periodForUpdatePosts);
  };

  toggleLanguageElement.addEventListener('click', () => {
    watchedState.language = watchedState.language === 'en' ? 'ru' : 'en';
    i18next.changeLanguage(watchedState.language, renderText);
  });

  fieldElement.addEventListener('input', ({ target }) => {
    const rssLink = target.value;
    updateValidationState(rssLink, watchedState);
  });

  formElement.addEventListener('submit', (e) => {
    e.preventDefault();
    if (watchedState.form.processState === 'processing' || !watchedState.form.valid) {
      return;
    }
    watchedState.form.processState = 'processing';
    const formData = new FormData(e.target);
    const rssLink = formData.get('url');
    axios.get(`${proxyUrl}${rssLink}`)
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
        watchedState.feeds.push(newFeed);
        watchedState.posts.push(...newPosts);
        watchedState.form.fields.rssLink = rssLink;
        watchedState.form.processState = 'filling';
      })
      .catch((error) => {
        watchedState.form.processState = 'failed';
        watchedState.error = { errorStatus: error.response.status };
        throw error;
      });
  });
  autoUpdate(watchedState.feeds);
};

export default runApp;
