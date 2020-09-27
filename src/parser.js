const getItem = (element) => ({
  title: element.querySelector('title').textContent,
  link: element.querySelector('link').textContent,
  id: element.querySelector('guid').textContent,
});

const parse = (str) => {
  const domParser = new DOMParser();
  const xmlDocument = domParser.parseFromString(str, 'text/xml');
  return {
    name: xmlDocument.querySelector('title').textContent,
    items: [...xmlDocument.querySelectorAll('item')].map(getItem),
  };
};

export default parse;
