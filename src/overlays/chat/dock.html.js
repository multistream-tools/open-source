import {
  // Constants.
  event,
  message,
  // Utilities.
  ensureArray,
  isTrue,
  validateNumber,
  // Aliases.
  stringify,
  // URL helpers.
  parameters,
  // Elements,
  enable,
  // Event listeners.
  Listener,
  ClickListener,
  // I18n.
  i18n
} from '../../overlay.js';

import { feature, hide, emitter } from '../featured/common.js';

import { observe } from './common.js';

i18n({ fr: { hide: 'Cacher Featured' } });

/****************
 ** PARAMETERS **
 ****************/

let { limit, colors, badges } = parameters;

limit = validateNumber(limit, 100);
colors = colors !== false; // DRY
badges = badges !== false; // DRY

// TODO: doc encode # => %23
const token = location.hash.slice(1); // DRY?

/*************
 ** HELPERS **
 *************/

const request = async (...args) => {
  const response = await fetch(...args);
  return response.ok ? response : Promise.reject(response);
};

// prettier-ignore
const api = (id, message) => request(
  `https://api.streamelements.com/kappa/v2/bot/${id}/say`, // TODO: decouple
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` // FIXME: configure in dock
    },
    body: stringify({ message })
  }
);

/****************
 ** REAL MAGIC **
 ****************/

let ids;

// TODO: if token
// prettier-ignore
const keyUp = new Listener('keyup', async ({ key }) => {
  if (key === 'Enter') {
    const message = $message.value.trim();

    if (message) {
      keyUp.off();

      try {
        await Promise.all(ids.map(id => api(id, message))); // TODO: alias?
        $message.value = null;
      } finally {
        keyUp.on();
      }
    }
  }
}, $message);

new ClickListener(() => emitter.emit(hide), $hideFeatured);

new ClickListener(({ target }) => {
  target = target.closest(`.${event}`);

  if (target) {
    emitter.emit(feature, target.outerHTML);
  }
}, chat);

observe({
  limit,
  colors,
  badges,
  textClass: message,
  messageClass: event,
  load({ platforms, data }) {
    ids = ensureArray(platforms.map(platform => data[platform].channel?.id)); // TODO: document data structure

    enable($message, !!token && ids.length > 0);
    enable($hideFeatured); // TODO
  },
  build(full) {
    return full(true);
  },
  show(append/*, message*/) {
    const { clientHeight, scrollHeight, scrollTop } = chat;

    append();

    // https://stackoverflow.com/a/34550171
    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 3) { // FIXME
      // message.scrollIntoView({ /*behavior: 'smooth'*/ /*block: 'end'*/ });
      chat.scrollTop = scrollHeight;
    }
  }
});
