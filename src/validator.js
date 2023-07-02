import { object, string, setLocale } from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import watch from './view.js';
import resources from './locales/index.js';
import parser from './parser.js';

export default async () => {
  const initialState = {
    form: {
      lng: 'ru',
      error: '',
      valid: false,
      url: '',
      posts: [],
      feeds: [],
    },
  };

  const i18n = i18next.createInstance();
  await i18n.init({
    debug: false,
    lng: 'ru',
    resources,
  });

  setLocale({
    mixed: {
      url: () => ({ key: 'errors.ValidationError' }),
    },
  });

  const elements = {
    input: document.getElementById('url-input'),
    form: document.querySelector('form'),
    feedback: document.querySelector('.feedback'),
  };

  const watchedState = watch(elements, initialState, i18n);

  const schema = object().shape({
    url: string().url().nullable(),
  });

  const addProxy = (url) => {
    const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
    proxyUrl.searchParams.append('disableCache', 'true');
    proxyUrl.searchParams.append('url', url);
    return proxyUrl.toString();
  };

  const getDate = (url) => axios.get(addProxy(url));

  const addIdsForPosts = (posts, feedId) => {
    const newPosts = posts.map((post) => {
      const newPost = post;
      newPost.id = uniqueId();
      newPost.feedId = feedId;
      return newPost;
    });
    return newPosts;
  };

  const handleData = (data) => {
    const { feed, posts } = data;
    feed.id = uniqueId();
    watchedState.form.feeds.push(feed);
    const newPosts = addIdsForPosts(posts, feed.id);
    watchedState.form.posts.push(...newPosts);
  };

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(elements.form);
    const newUser = Object.fromEntries(data);
    try {
      await schema.validate(newUser, { abortEarly: false });
      watchedState.form.valid = true;
      const text = data.get('url');
      const response = await getDate(text);
      const content = response.data.contents;
      const url = data.get('url');
      const dateParser = parser(content, url);
      handleData(dateParser);
    } catch (error) {
      console.log(error);
      watchedState.form.errors = error.name;
      watchedState.form.valid = false;
    }
  });
};
