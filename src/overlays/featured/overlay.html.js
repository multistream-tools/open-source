import {
  // Utilities.
  alias,
  // URL helpers.
  parameters,
  validateNumber,
  // Elements.
  removeChildren,
  // Queue.
  Queue,
  // Two way communication.
  Observer,
  // Theming.
  loadFonts,
  // I18n.
  i18n
} from '../../overlay.js';

import { feature, hide, emitter } from './common.js';

loadFonts('Nunito+Sans:700');
i18n();

/****************
 ** PARAMETERS **
 ****************/

// FIXME: queueDuration?
let { duration } = parameters;

duration = validateNumber(duration, 20);

/*************
 ** HELPERS **
 *************/

const clear = alias(removeChildren, featured);

/****************
 ** REAL MAGIC **
 ****************/

const queue = new Queue(duration, true);

const skip = () => queue.skip();

new Observer({
  [emitter.key(feature)]({ data }) {
    skip();
    queue.add(() => (featured.innerHTML = data), clear);
  },
  [emitter.key(hide)]: skip
});
