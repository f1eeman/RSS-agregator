import _ from 'lodash';

const renderErrors = (element, errors) => {
  const errorElement = element.nextElementSibling;
  if (errorElement) {
    element.classList.remove('is-invalid');
    errorElement.remove();
  }
  if (_.isEqual(errors, {})) {
    return;
  }
  const feedbackElement = document.createElement('div');
  feedbackElement.classList.add('invalid-feedback');
  feedbackElement.innerHTML = errors[0].message;
  element.classList.add('is-invalid');
  element.after(feedbackElement);
};

export default renderErrors;
