import 'bootstrap/dist/css/bootstrap.min.css';
import _ from 'lodash';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import renderErrors from './view.js';

const bodyElement = document.body;
bodyElement.classList.add('d-flex', 'flex-column', 'min-vh-100');
const pageMain = document.createElement('main');
const jumbotron = document.createElement('div');
const jumbotronContainer = document.createElement('div');
const jumbotronRow = document.createElement('div');
const jumbotronCol = document.createElement('div');
const title1 = document.createElement('h1');
const info = document.createElement('p');
const formElement = document.createElement('form');
const formRow = document.createElement('div');
const formCol1 = document.createElement('div');
const formCol2 = document.createElement('div');
const fieldElement = document.createElement('input');
const submitElement = document.createElement('button');
const hint = document.createElement('p');
const processInfo = document.createElement('p');
const pageMainContainer = document.createElement('div');
const pageMainRow = document.createElement('div');
const pageMainCol = document.createElement('div');
const pageFooter = document.createElement('footer');
const pageFooterContainer = document.createElement('div');
const pageFooterTextWrap = document.createElement('p');

processInfo.classList.add('processInfo');
hint.textContent = 'Example: https://ru.hexlet.io/lessons.rss';
hint.classList.add('text-muted', 'my-1');
fieldElement.type = 'text';
fieldElement.classList.add('form-control', 'form-control-lg', 'w-100');
fieldElement.name = 'url';
fieldElement.placeholder = 'RSS link';
fieldElement.setAttribute('required', '');
submitElement.type = 'submit';
submitElement.textContent = 'Add';
submitElement.classList.add('btn', 'btn-lg', 'btn-primary', 'px-sm-5');
formCol1.classList.add('col');
formCol1.appendChild(fieldElement);
formCol2.classList.add('col-auto');
formCol2.appendChild(submitElement);
formRow.classList.add('form-row');
formRow.append(formCol1, formCol2);
formElement.appendChild(formRow);
info.textContent = 'Start reading RSS today! It is easy, it is nicely.';
info.classList.add('lead');
title1.textContent = 'RSS Reader';
title1.classList.add('display-3');
jumbotronCol.classList.add('col-md-10', 'col-lg-8', 'mx-auto', 'text-white');
jumbotronCol.append(title1, info, formElement, hint, processInfo);
jumbotronRow.classList.add('row');
jumbotronRow.appendChild(jumbotronCol);
jumbotronContainer.classList.add('container');
jumbotronContainer.appendChild(jumbotronRow);
jumbotron.classList.add('jumbotron', 'jumbotron-fluid', 'bg-dark');
jumbotron.appendChild(jumbotronContainer);
pageMain.classList.add('flex-grow-1');
pageMainCol.classList.add('col-md-10', 'col-lg-8', 'mx-auto', 'feeds');
pageMainRow.classList.add('row');
pageMainContainer.classList.add('container');
pageMain.append(jumbotron, pageMainContainer);
pageFooterTextWrap.textContent = 'created by Hexlet';
pageFooterTextWrap.classList.add('text-center');
pageFooterContainer.classList.add('container');
pageFooterContainer.appendChild(pageFooterTextWrap);
pageFooter.appendChild(pageFooterContainer);
pageFooter.classList.add('footer', 'border-top', 'py-3', 'mt-5');
bodyElement.prepend(pageMain, pageFooter);

const schema = yup
  .string()
  .required()
  .url();

const errorMessages = {
  network: {
    error: 'Network problems. Try again.',
  },
};

const validate = (link, addedLinks = []) => {
  try {
    schema
      .notOneOf(addedLinks)
      .validateSync(link, { abortEarly: false });
    return {};
  } catch (e) {
    return e.inner;
  }
};

const updateValidationState = (watchedState) => {
  const error = validate(watchedState.form.fields.link);
  watchedState.form.valid = _.isEqual(error, {});
  watchedState.form.error = error;
};

const state = {
  form: {
    processState: 'filling',
    processError: null,
    fields: {
      link: '',
    },
    valid: true,
    error: {},
  },
};

const watchedState = onChange(state, (path, value) => {
  switch (path) {
    case 'form.error':
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
  // console.log(watchedState);
});
