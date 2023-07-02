const parsePost = (post) => {
  const title = post.querySelector('title').textContent;
  const descripton = post.querySelector('description').textContent;
  const link = post.querySelector('link').textContent;
  const date = post.querySelector('pubDate').textContent;
  return {
    title,
    descripton,
    link,
    date,
  };
};

export default (rss, url) => {
  const parser = new DOMParser();
  const data = parser.parseFromString(rss, 'text/xml');
  const parseError = data.querySelector('parsererror');
  if (parseError) {
    const error = new Error(parseError.textContent);
    error.isParsingError = true;
    throw error;
  }
  const feedTitile = data.querySelector('title').textContent;
  const feedDescription = data.querySelector('description').textContent;
  const feed = {
    link: url,
    title: feedTitile,
    description: feedDescription,
  };
  const posts = [...data.querySelectorAll('item')].map((item) => parsePost(item));
  return { feed, posts };
};
