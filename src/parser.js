const parse = (str) => {
  const domparser = new DOMParser();
  const xmlDoc = domparser.parseFromString(str, 'text/xml');
  return xmlDoc;
};

export default parse;
