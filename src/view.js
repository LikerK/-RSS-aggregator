import onChange from 'on-change';

export default (elements, state, i18n) => {
  const { input, feedback } = elements;
  const handleErrors = (key) => {
    input.classList.add('is-invalid');
    feedback.textContent = i18n.t(`errors.${key}`);
  };

  const clearErrors = () => {
    feedback.textContent = '';
    input.classList.remove('is-invalid');
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.errors':
        handleErrors(value);
        break;
      case 'form.valid':
        if (value) {
          clearErrors();
        }
        break;
      default:
        break;
    }
  });
  return watchedState;
};
