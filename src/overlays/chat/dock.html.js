import {
  // Constants.
  event,
  message,
  // Aliases.
  jsonStringify,
  // Utilities.
  alias,
  notFalse,
  getTruthyArray,
  validateNumber,
  // URL helpers.
  parameters,
  // HTTP.
  request,
  // Elements,
  enable,
  // Event listeners.
  Listener,
  ClickListener,
  // I18n.
  i18n
} from '../../overlay.js';

import { feature, hide } from '../featured/common.js';
import { observe } from './common.js';

i18n({ fr: { hide: 'Cacher Featured' } });

/****************
 ** PARAMETERS **
 ****************/

let { limit, colors, badges } = parameters;

limit = validateNumber(limit, 100);
colors = notFalse(colors);
badges = notFalse(badges);

/*************
 ** HELPERS **
 *************/

let ids;
let token; // TODO: don't pass token this way (log queryString) + doc + encode # => %23
let keyUp;

const api = (message, id) => request(
  `//api.streamelements.com/kappa/v2/bot/${id}/say`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` // TODO: configure in dock?
    },
    body: jsonStringify({ message })
  }
);

const setupMessageInput = () => {
  enable($message, false);

  if (keyUp) {
    keyUp.off();
    keyUp = undefined;
  }

  if (token && ids?.length > 0) {
    keyUp = new Listener('keyup', async ({ key }) => {
      if (key === 'Enter') {
        const message = $message.value.trim();

        if (message) {
          keyUp.off();

          try {
            await Promise.all(ids.map(alias(api, message)));
            $message.value = null;
          } finally {
            keyUp.on();
          }
        }
      }
    }, enable($message));
  }
};

const setToken = () => {
  token = location.hash.slice(1);
  setupMessageInput();
};

/****************
 ** REAL MAGIC **
 ****************/

new Listener('hashchange', setToken);

new ClickListener(() => hide.emit(), $hideFeatured);

new ClickListener(
  ({ outerHTML }) => feature.emit(outerHTML),
  chat,
  { delegate: `[class~='${event}']` }
);

setToken();

observe({
  limit,
  colors,
  badges,
  textClass: message,
  messageClass: event,
  load({ platforms, data }) {
    ids = getTruthyArray(
      platforms.map(platform => data[platform].channel?.id) // TODO: document data structure + check if streamelements?
    );

    setupMessageInput();
    enable($hideFeatured);
  },
  build(full) {
    return full(true);
  },
  show(append) {
    const { clientHeight, scrollHeight, scrollTop } = chat;

    append();

    // https://stackoverflow.com/a/34550171
    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 3) {
      chat.scrollTop = scrollHeight;
    }
  }
});
