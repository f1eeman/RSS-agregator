import 'bootstrap/dist/css/bootstrap.min.css';
import _ from 'lodash';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import renderErrors from './view.js';
import renderPage from './page.js';
import parse from './parser';

renderPage();

const proxy = 'https://cors-anywhere.herokuapp.com/';
const formElement = document.querySelector('[data-form="rss-form"]');
const fieldElement = document.querySelector('input[name="url"]');
const dataContainer = document.querySelector('[data-container="content"]');

const schema = yup
  .string()
  .required()
  .url();

const errorMessages = {
  network: {
    error: 'Network problems. Try again.',
  },
};

const validate = (link) => {
  try {
    schema
      .validateSync(link, { abortEarly: false });
    return {};
  } catch (e) {
    return e.inner;
  }
};

const updateValidationState = (watchedState) => {
  const errors = validate(watchedState.form.fields.link);
  console.log('errors', errors);
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
    valid: true,
    errors: {},
  },
};

const watchedState = onChange(state, (path, value) => {
  switch (path) {
    case 'form.errors':
      renderErrors(fieldElement, value);
      break;
    default:
      break;
  }
});

formElement.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  watchedState.form.fields.link = formData.get('name');
  updateValidationState(watchedState);
  console.log(watchedState);
  if (!watchedState.form.valid) {
    return;
  }
  axios.get(`${proxy}${watchedState.form.fields.link}`)
    .then(console.log)
    .catch((error) => console.log('error', error));
});
