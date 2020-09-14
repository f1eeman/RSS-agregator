import axios from 'axios';
import _ from 'lodash';
import parse from './parser';

const proxy = 'https://cors-anywhere.herokuapp.com/';

const autoUpdate = (links, period, watchedState) => {
  const urls = links.map((link) => `${proxy}${link}`);
  urls.forEach((url) => {
    axios.get(url)
      .then((response) => parse(response.data))
      .then((data) => {
        const newFeed = { id: _.uniqueId(), name: data.name };
        const newPosts = data.items.map(
          ({ title, link, id }) => ({
            feedId: newFeed.id, title, link, id,
          }),
        );
        const postsIds = watchedState.form.posts.map((post) => post.id);
        const filtredPosts = newPosts.filter(({ id }) => !postsIds.includes(id));
        watchedState.form.posts.push(...filtredPosts);
      });
  });
  setTimeout(autoUpdate.bind(null, links, period, watchedState), period);
};

export default autoUpdate;
