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
  const [error] = errors;
  const feedbackElement = document.createElement('div');
  feedbackElement.classList.add('invalid-feedback');
  feedbackElement.innerHTML = error.message;
  element.classList.add('is-invalid');
  element.after(feedbackElement);
};

const renderFeeds = (wrapper, { name, id }) => {
  const section = document.createElement('section');
  const title = document.createElement('h2');
  const list = document.createElement('ul');
  list.setAttribute('data-list-id', id);
  section.setAttribute('data-section-id', id);
  title.textContent = name;
  section.append(title, list);
  wrapper.prepend(section);
};

const renderPosts = (allPosts) => {
  const sectionsColl = document.querySelectorAll('[data-section-id]');
  sectionsColl.forEach((s) => {
    const currentFeedId = s.dataset.sectionId;
    const list = s.querySelector(`[data-list-id="${currentFeedId}"]`);
    const currentFeedPosts = allPosts.filter(({ feedId }) => {
      // console.log('feedId', feedId);
      // console.log('currentFeedId', currentFeedId);
      const result = feedId === currentFeedId;
      return result;
    });
    // console.log('currentFeedPosts', currentFeedPosts);
    // console.log('allPosts', allPosts);
    // console.log('oldPosts', oldPosts);
    // const currentFeedOldPosts = oldPosts.filter(({ feedId }) => feedId === currentFeedId);
    // const currentFeedNewPosts = currentFeedPosts.filter(
    //   (post) => !currentFeedOldPosts.some((oldPost) => oldPost.id === post.id),
    // );
    const listItems = currentFeedPosts.map(({ title, link }) => `<li><a href="${link}">${title}</li>`).join('');
    list.innerHTML = listItems;
  });
};

export { renderErrors, renderFeeds, renderPosts };
