import { object, string, setLocale } from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import watch from './view.js';
import resources from './locales/index.js';
import parse from './parser.js';

export default async () => {
  const initialState = {
    form: {
      lng: 'ru',
      error: '',
      feedback: '',
      url: '',
      posts: [],
      feeds: [],
      displayedPost: {},
    },
  };

  const i18n = i18next.createInstance();
  await i18n.init({
    debug: false,
    lng: 'ru',
    resources,
  });

  setLocale({
    string: {
      url: () => ({ key: 'notUrl' }),
    },
    mixed: {
      notOneOf: () => ({ key: 'alreadyInList' }),
    },
  });

  const makeSchema = (links) => object().shape({
    url: string().url().nullable().notOneOf(links),
  });

  const elements = {
    input: document.getElementById('url-input'),
    form: document.querySelector('form'),
    feedback: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    modalTitle: document.querySelector('.modal-title'),
    modalDescription: document.querySelector('.modal-body'),
    modalLink: document.querySelector('.modal-footer a'),
  };

  const watchedState = watch(elements, initialState, i18n);

  const addProxy = (url) => {
    const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
    proxyUrl.searchParams.append('disableCache', 'true');
    proxyUrl.searchParams.append('url', url);
    return proxyUrl.toString();
  };

  const getData = (url) => axios.get(addProxy(url));

  const addIdsForPosts = (posts, feedId) => {
    const newPosts = posts.map((post) => {
      const newPost = post;
      newPost.id = uniqueId();
      newPost.feedId = feedId;
      return newPost;
    });
    return newPosts;
  };

  const updatePosts = async () => {
    watchedState.form.feeds.forEach(async (feed) => {
      try {
        const response = await getData(feed.link);
        const { posts } = parse(response.data.contents);
        const postsFromState = watchedState.form.posts;
        const postsWithCurrentId = postsFromState.filter((post) => post.feedId === feed.id);
        const displayedPostLinks = postsWithCurrentId.map((post) => post.link);
        const newPosts = posts.filter((post) => !displayedPostLinks.includes(post.link));
        addIdsForPosts(newPosts, feed.id);
        watchedState.form.posts.unshift(...newPosts);
      } catch (error) {
        console.log(error);
      }
    });
    return setTimeout(updatePosts, 5000);
  };

  const handleData = (data) => {
    const { feed, posts } = data;
    feed.id = uniqueId();
    watchedState.form.feeds.push(feed);
    const newPosts = addIdsForPosts(posts, feed.id);
    watchedState.form.posts.push(...newPosts);
  };

  const handleError = (error) => {
    if (error.isParsingError) {
      return 'notRss';
    }
    if (axios.isAxiosError(error)) {
      return 'networkError';
    }
    return error.message.key ?? 'unknown';
  };

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(elements.form);
    const newUser = Object.fromEntries(data);
    try {
      const links = initialState.form.feeds.map((feed) => feed.link);
      const schema = makeSchema(links);
      await schema.validate(newUser, { abortEarly: false });
      watchedState.form.valid = true;
      const text = data.get('url');
      const response = await getData(text);
      const content = response.data.contents;
      const url = data.get('url');
      const dateParser = parse(content, url);
      watchedState.form.feedback = 'success';
      handleData(dateParser);
    } catch (error) {
      console.log(error);
      watchedState.form.feedback = handleError(error);
      watchedState.form.valid = false;
    }
  });
  elements.posts.addEventListener('click', (e) => {
    const postId = e.target.dataset.id;
    if (postId) {
      const postForDisplay = watchedState.form.posts.filter((post) => post.id === postId);
      watchedState.form.displayedPost = postForDisplay;
    }
  });
  updatePosts();
};
