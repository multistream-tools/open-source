import {
  // Constants.
  message,
  deleteMessage,
  deleteMessages,
  // Aliases.
  assign,
  // Utilities.
  alias,
  // URL helpers.
  parameters,
  validateSet,
  // Elements.
  append,
  element,
  crossOrigin,
  setVariable,
  select,
  // Two way communication.
  Observer
} from '../../overlay.js';

/****************
 ** PARAMETERS **
 ****************/

let { ignored } = parameters;

const sanitizeName = name => name.toLowerCase(); // DRY?

ignored = validateSet(ignored, undefined, sanitizeName);

/*************
 ** HELPERS **
 *************/

const prefix = (platform, id) => `${platform}_${id}`; // TODO: namespace?

const remove = host => host.remove();

/**************
 ** ELEMENTS **
 **************/

// TODO: accessibility/semantics
const Div = (classes, content, other) =>
  element('div', assign({ classes, content }, other));

// Build the platform icon.
const Platform = platform => Div(['source', platform]);

// Build a badge image.
// prettier-ignore
const Badge = ({ url }) => element('img', crossOrigin({
  classes: 'badge',
  src: url
}));

// Build the message user.
const User = (
  { displayName, displayColor, badges },
  { colors, badges: showBadges }
) => {
  const user = Div(
    'user',
    (showBadges && badges?.map(Badge).concat(displayName)) || displayName,
    { title: displayName } // FIXME: highlight contrast issue instead of title + title only for dock?
  );

  return colors ? setVariable('accentColor', displayColor, user) : user;
};

// Build the message content.
const Text = (html, { isAction }, { textClass }) => {
  // The message is an action.
  const classes = [textClass, isAction && 'action'];

  // TODO: https://github.com/cure53/DOMPurify
  // TODO: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/require-trusted-types-for
  return Div(classes, null, { innerHTML: html });
};

// Build the entire message.
const Message = (
  platform,
  html,
  { tags, userId, msgId, ...data },
  { build, messageClass, ...options }
) => {
  const classes = [messageClass];

  if (tags) {
    const first = 'first';
    const highlighted = 'highlighted';

    // TODO: youtube/trovo/facebook/tiktok?
    classes.push(
      // First message on the channel.
      tags[`${first}-msg`] === '1' && first,
      // The message should be highlighted.
      tags['msg-id'] === `${highlighted}-${message}` && highlighted
    );
  }

  const text = Text(html, data, options);

  const content = build(
    platforms => [
      platforms && Platform(platform),
      User(data, options),
      text
    ],
    text,
    userId
  );

  return Div(classes, content, {
    data: { userId: prefix(platform, userId) },
    id: prefix(platform, msgId)
  });
};

/****************
 ** REAL MAGIC **
 ****************/

// Build and display a message.
const addMessage = (
  platform,
  { renderedText, data: { nick, ...data } },
  { limit, show, ...options }
) => {
  // Don't show commands and messages from ignored users like bots.
  if (renderedText.startsWith('!') || ignored.has(sanitizeName(nick))) { // FIXME: YouTube support, use displayName always?
    return;
  }

  const { length, [0]: oldest } = chat.children;

  if (length === limit) {
    remove(oldest);
  }

  const message = Message(platform, renderedText, data, options);
  show(alias(append, message, chat), message);
};

// Remove displayed messages.
const removeMessages = (platform, data, attribute, property) => {
  const selector = `[${attribute}='${prefix(platform, data[property])}']`;
  select(selector, chat).forEach(remove);
};

// prettier-ignore
export const observe = ({ load, ...options }) => new Observer({
  load,
  chat({ platform, event, data }) {
    switch (event) {
      case message:
        return addMessage(platform, data, options);

      case deleteMessage:
        return removeMessages(platform, data, 'id', 'msgId');

      case deleteMessages:
        return removeMessages(platform, data, 'data-user-id', 'userId');
    }
  }
});
