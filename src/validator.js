import { object, string, setLocale } from 'yup';
import i18next from 'i18next';
import watch from './view.js';
import resources from './locales/index.js';

export default async () => {
  const initialState = {
    form: {
      lng: 'ru',
      error: '',
      valid: false,
      url: '',
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

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(elements.form);
    const newUser = Object.fromEntries(data);
    try {
      await schema.validate(newUser, { abortEarly: false });
      watchedState.form.valid = true;
    } catch (error) {
      watchedState.form.errors = error.name;
      watchedState.form.valid = false;
    }
  });
};
