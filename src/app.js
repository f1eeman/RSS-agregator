import _ from 'lodash';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import getViewComponents from './view.js';
import parse from './parser.js';
import resources from './locales/index.js';

const runApp = () => {
  const periodForUpdatePosts = 5000;
  const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  const formElement = document.querySelector('.rss-form');
  const fieldElement = document.querySelector('.form-control');
  const toggleLanguageElement = document.querySelector('.toggle-lang');
  const { renderText, getWatchedState, renderOnMount } = getViewComponents();

  renderOnMount();

  const state = {
    language: 'en',
    form: {
      processState: 'filling',
      fields: {
        rssLink: '',
      },
      valid: true,
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

  const validate = (url, addedRssLinks) => {
    try {
      schema
        .notOneOf(addedRssLinks, 'double')
        .validateSync(url, { abortEarly: false });
      return null;
    } catch (error) {
      return error;
    }
  };

  const updateValidationState = (link) => {
    const feedUrls = watchedState.feeds.map(({ rssLink }) => rssLink);
    const error = validate(link, feedUrls);
    watchedState.form.valid = _.isNull(error);
    watchedState.form.error = error;
  };

  const autoUpdate = (feeds) => {
    feeds.forEach(async ({ rssLink, id: feedId }) => {
      const response = await axios.get(`${proxyUrl}${rssLink}`);
      const parsedData = parse(response.data);
      const newPosts = parsedData.items.map(
        ({ title, link, id }) => ({
          feedId, title, link, id,
        }),
      );
      const filteredPosts = _.differenceWith(
        newPosts, watchedState.posts, (a, b) => a.id === b.id,
      );
      watchedState.posts.push(...filteredPosts);
    });
    setTimeout(autoUpdate.bind(null, feeds), periodForUpdatePosts);
  };

  toggleLanguageElement.addEventListener('click', () => {
    watchedState.language = watchedState.language === 'en' ? 'ru' : 'en';
    i18next.changeLanguage(watchedState.language, renderText);
  });

  fieldElement.addEventListener('input', ({ target }) => {
    const rssLink = target.value.trim();
    updateValidationState(rssLink);
    watchedState.form.fields.rssLink = rssLink;
  });

  formElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (watchedState.form.processState === 'processing' || !watchedState.form.valid) {
      return;
    }
    watchedState.form.processState = 'processing';
    const { rssLink } = watchedState.form.fields;
    try {
      const response = await axios.get(`${proxyUrl}${rssLink}`);
      const parsedData = parse(response.data);
      const feedId = _.uniqueId();
      const newFeed = {
        id: feedId,
        name: parsedData.name,
        rssLink,
      };
      const newPosts = parsedData.items.map(
        ({ title, link, id }) => ({
          feedId, title, link, id,
        }),
      );
      watchedState.feeds.push(newFeed);
      watchedState.posts.push(...newPosts);
      watchedState.form.fields.rssLink = '';
      watchedState.form.processState = 'filling';
    } catch (error) {
      watchedState.form.processState = 'failed';
      watchedState.error = error.response.status;
      throw error;
    }
  });
  autoUpdate(watchedState.feeds);
};

export default runApp;
