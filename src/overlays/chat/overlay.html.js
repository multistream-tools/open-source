import {
  // Constants.
  message,
  // Utilities.
  isTrue,
  notFalse,
  validateNumber,
  // URL helpers.
  parameters,
  // Theming.
  loadFonts,
  // I18n.
  i18n
} from '../../overlay.js';

import { observe } from './common.js';

loadFonts('Nunito+Sans:700');
i18n();

/****************
 ** PARAMETERS **
 ****************/

let { limit, badges, colors, platforms } = parameters;

limit = validateNumber(limit, 20);
platforms = notFalse(platforms);
badges = isTrue(badges);
colors = isTrue(colors);

/****************
 ** REAL MAGIC **
 ****************/

 // Store the id of the previous message sender to group messages.
let senderId;

observe({
  limit,
  colors,
  badges,
  textClass: 'text',
  messageClass: message,
  build(full, text, userId) {
    if (senderId !== userId) {
      senderId = userId;
      return full(platforms);
    }

    return text;
  },
  show(append, message) {
    append();

    // TODO: Replace with pure CSS?
    gsap.fromTo(
      message,
      0.5,
      { width: 0 },
      { width: 'auto', ease: Power1.easeOut }
    );
  }
});
