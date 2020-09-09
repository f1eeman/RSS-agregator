const renderErrors = (element, error) => {
  const errorElement = element.nextElementSibling;
  if (errorElement) {
    // element.classList.remove('is-invalid');
    errorElement.remove();
  }
  if (!error) {
    return;
  }
  const feedbackElement = document.createElement('div');
  feedbackElement.classList.add('invalid-feedback');
  feedbackElement.innerHTML = error[0].message;
  element.classList.add('is-invalid');
  element.after(feedbackElement);
};

export default renderErrors;
