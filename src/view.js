import _ from 'lodash';

const renderErrors = (element, errors) => {
  const errorElement = element.nextElementSibling;
  if (errorElement) {
    element.classList.remove('is-invalid');
    errorElement.remove();
  }
  if (_.isEqual(errors, {}) || !errors) {
    return;
  }
  const feedbackElement = document.createElement('div');
  feedbackElement.classList.add('invalid-feedback');
  feedbackElement.innerHTML = errors[0].message;
  element.classList.add('is-invalid');
  element.after(feedbackElement);
};

const renderFeeds = (container, { name }) => {
  const title = document.createElement('h2');
  title.textContent = name;
  container.appendChild(title);
};

const renderPosts = (container, posts) => {
  const items = posts.map(({ title, link }) => `<li><a href="${link}">${title}</li>`).join('');
  const list = document.createElement('ul');
  list.innerHTML = items;
  container.appendChild(list);
};

export { renderErrors, renderFeeds, renderPosts };
