const getItem = (element) => ({
  title: element.querySelector('title').textContent,
  link: element.querySelector('link').textContent,
});

const parse = (str) => {
  const domparser = new DOMParser();
  const xmlDoc = domparser.parseFromString(str, 'text/xml');
  return {
    name: xmlDoc.querySelector('title').textContent,
    items: [...xmlDoc.querySelectorAll('item')].map(getItem),
  };
};

export default parse;
