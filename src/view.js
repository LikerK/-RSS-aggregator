import onChange from 'on-change';

export default (elements, state, i18n) => {
  const { input, feedback } = elements;
  const renderFeedback = (message) => {
    if (message === 'success') {
      input.classList.remove('is-invalid');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
    } else {
      input.classList.add('is-invalid');
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
    }
    feedback.textContent = i18n.t(`feedback.${message}`);
  };

  const createList = (title) => {
    const card = document.createElement('div');
    const cardBody = document.createElement('div');
    const listGroup = document.createElement('ul');
    const cardTitile = document.createElement('h2');
    // '`-`' \\
    card.classList.add('card', 'border-0');
    cardBody.classList.add('card-body');
    listGroup.classList.add('list-group', 'border-0', 'rounded-0');
    cardTitile.classList.add('card-titile', 'h4');
    // '`-`' \\
    card.append(cardBody);
    card.append(listGroup);
    cardBody.append(cardTitile);
    cardTitile.textContent = i18n.t(title);
    return card;
  };

  const cretePost = (post) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    const button = document.createElement('button');

    item.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );

    link.classList.add('fw-bold');
    link.setAttribute('href', post.link);
    link.setAttribute('target', '_blank');
    link.setAttribute('data-id', post.id);
    link.setAttribute('rel', 'noopener');
    link.setAttribute('noreferrer', 'noreferrer');
    link.textContent = post.title;

    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.setAttribute('data-id', post.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18n.t('view');

    item.append(link);
    item.append(button);
    return item;
  };

  const createFeed = (feed) => {
    const item = document.createElement('li');
    const title = document.createElement('h3');
    const text = document.createElement('p');

    item.classList.add('list-group-item', 'border-0', 'border-end-0');
    title.classList.add('h6', 'm-0');
    title.textContent = feed.title;
    text.classList.add('m-0', 'small', 'text-black-50');
    text.textContent = feed.description;

    item.append(title);
    item.append(text);
    return item;
  };

  const renderFeeds = (feeds) => {
    const feedsElement = document.querySelector('.feeds');
    feedsElement.innerHTML = '';
    feedsElement.append(createList('feeds'));
    const list = feedsElement.querySelector('ul');
    feeds.forEach((feed) => list.append(createFeed(feed)));
  };

  const renderPosts = (posts) => {
    const postElement = document.querySelector('.posts');
    postElement.innerHTML = '';
    postElement.append(createList('posts'));
    const list = postElement.querySelector('ul');
    posts.forEach((post) => list.append(cretePost(post)));
  };

  const renderDisplayPost = (post) => {
    const [{ title, description, link }] = post;
    const { modalTitle, modalDescription, modalLink } = elements;
    modalTitle.textContent = title;
    modalDescription.textContent = description;
    modalLink.setAttribute('href', link);
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.feedback':
        renderFeedback(value);
        break;
      case 'form.posts':
        renderPosts(value);
        break;
      case 'form.feeds':
        renderFeeds(value);
        break;
      case 'form.displayedPost':
        renderDisplayPost(value);
        break;
      default:
        break;
    }
  });
  return watchedState;
};
