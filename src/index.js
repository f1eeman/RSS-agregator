import 'bootstrap/dist/css/bootstrap.min.css';
import _ from 'lodash';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import { renderErrors, renderFeeds, renderPosts } from './view.js';
import parse from './parser.js';
import resources from './locales.js';

const period = 5000;
const proxy = 'https://cors-anywhere.herokuapp.com/';
const formElement = document.querySelector('[data-form="rss-form"]');
const fieldElement = document.querySelector('input[name="url"]');
const submitBtn = document.querySelector('[data-btn="submit-btn"]');
const dataContainer = document.querySelector('[data-container="content"]');
const mainTitle = document.querySelector('[data-title="main-title"]');
const hint = document.querySelector('[data-hint="hint"]');
const info = document.querySelector('[data-info="info"]');
const copyright = document.querySelector('[data-copyright="by-hexlet"]');

fieldElement.select();

i18next.init({
  lng: 'en',
  debug: true,
  resources,
})
  .then(() => {
    mainTitle.textContent = i18next.t('mainTitle');
  })
  .then(() => {
    hint.textContent = i18next.t('hint');
  })
  .then(() => {
    submitBtn.textContent = i18next.t('buttonText');
  })
  .then(() => {
    info.textContent = i18next.t('info');
  })
  .then(() => {
    copyright.textContent = i18next.t('copyright');
  })
  .then(() => {
    fieldElement.placeholder = i18next.t('placeholder');
  });

const schema = yup
  .string()
  .required()
  .url(i18next.t('validUrl'));

const errorMessages = {
  network: {
    error: 'Network problems. Try again.',
  },
};

const validate = (link, addedLinks) => {
  try {
    schema
      .notOneOf(addedLinks, i18next.t('double'))
      .validateSync(link, { abortEarly: false });
    return {};
  } catch (e) {
    return e.inner;
  }
};

const updateValidationState = (watchedState) => {
  const addedLinks = watchedState.form.addedLinks.map(({ link }) => link);
  const errors = validate(watchedState.form.fields.link, addedLinks);
  // console.log('errors', errors);
  /* eslint no-param-reassign:
    ["error", { "props": true, "ignorePropertyModificationsFor": ["watchedState"] }] */
  watchedState.form.valid = _.isEqual(errors, {});
  watchedState.form.errors = errors;
};

const state = {
  form: {
    processState: 'filling',
    processError: null,
    fields: {
      link: '',
    },
    addedLinks: [],
    feeds: [],
    posts: [],
    valid: true,
    errors: {},
  },
};

const processStateHandler = (processState) => {
  switch (processState) {
    case 'failed':
      submitBtn.disabled = false;
      break;
    case 'filling':
      submitBtn.disabled = false;
      break;
    case 'processing':
      submitBtn.disabled = true;
      break;
    default:
      throw new Error(`Unknown state's process: ${processState}`);
  }
};

const watchedState = onChange(state, (path, currentValue) => {
  switch (path) {
    case 'form.valid':
      submitBtn.disabled = !currentValue;
      break;
    case 'form.errors':
      renderErrors(fieldElement, currentValue);
      break;
    case 'form.processState':
      processStateHandler(currentValue);
      break;
    case 'form.feeds':
      // console.log('value', value);
      // console.log(dataContainer);
      renderFeeds(dataContainer, currentValue[currentValue.length - 1]);
      break;
    case 'form.posts':
      // console.log(dataContainer);
      // console.log('++++++++++++++++++++');
      // console.log('value', currentValue);
      // console.log('prevValue', prevValue);
      // console.log('++++++++++++++++++++');
      renderPosts(currentValue);
      break;
    default:
      break;
  }
});

const autoUpdate = (links) => {
  const urls = links.map(({ link, feedId }) => ({ url: `${proxy}${link}`, feedId }));
  urls.forEach(({ url, feedId }) => {
    axios.get(url)
      .then((response) => parse(response.data))
      .then((data) => {
        const newPosts = data.items.map(
          ({ title, link, id }) => ({
            feedId, title, link, id,
          }),
        );
        const exisitingPostsIds = watchedState.form.posts.map((post) => post.id);
        const filtredPosts = newPosts.filter(({ id }) => !exisitingPostsIds.includes(id));
        // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        // console.log('watchedState.form.posts', watchedState.form.posts);
        // console.log('postsIds', postsIds);
        // console.log('newPosts', newPosts);
        // console.log('filtredPosts', filtredPosts);
        if (filtredPosts.length > 0) {
          watchedState.form.posts.push(...filtredPosts);
        }
        // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
      });
  });
  setTimeout(autoUpdate.bind(null, links), period);
};

fieldElement.addEventListener('change', ({ target }) => {
  watchedState.form.fields.link = target.value;
  updateValidationState(watchedState);
});

formElement.addEventListener('submit', (e) => {
  e.preventDefault();
  // const formData = new FormData(e.target);
  // const url = formData.get('url');
  // watchedState.form.fields.link = url;
  // // console.log(state);
  // updateValidationState(watchedState);
  // // console.log(watchedState);
  // if (!watchedState.form.valid) {
  //   return;
  // }

  watchedState.form.processState = 'processing';
  axios.get(`${proxy}${watchedState.form.fields.link}`)
    // .then((response) => console.log(response.data))
    .then((response) => parse(response.data))
    .then((data) => {
      const feedId = _.uniqueId();
      const newFeed = { id: feedId, name: data.name };
      const newPosts = data.items.map(
        ({ title, link, id }) => ({
          feedId, title, link, id,
        }),
      );
      watchedState.form.feeds.push(newFeed);
      watchedState.form.posts.push(...newPosts);
      watchedState.form.addedLinks.push({ link: watchedState.form.fields.link, feedId });
      autoUpdate(watchedState.form.addedLinks, period, watchedState);
    })
    .then(() => {
      watchedState.form.processState = 'filling';
    })
    .catch((error) => {
      watchedState.form.processError = errorMessages.network.error;
      watchedState.form.processState = 'failed';
      throw error;
    });
});
