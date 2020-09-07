import 'bootstrap/dist/css/bootstrap.min.css';

const f = () => {
  const bodyEl = document.body;
  const containerEl = document.createElement('div');
  const jumbotronEl = document.createElement('div');
  const formEl = document.createElement('form');
  const fieldEl = document.createElement('input');
  const submitEl = document.createElement('button');
  jumbotronEl.classList.add('jumbotronEl');
  containerEl.classList.add('container');
  fieldEl.type = 'text';
  submitEl.type = 'submit';
  submitEl.textContent = 'Отправить';
  formEl.append(fieldEl, submitEl);
  jumbotronEl.append(formEl);
  containerEl.append(jumbotronEl);
  bodyEl.append(containerEl);
};

f();
