import {
  // Utilities.
  alias,
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

import { feature, hide } from './common.js';

loadFonts('Nunito+Sans:700');
i18n();

/*************
 ** HELPERS **
 *************/

const clear = alias(removeChildren, featured);

/****************
 ** REAL MAGIC **
 ****************/

const queue = new Queue(undefined, true);

const skip = () => queue.skip();

new Observer({
  [feature]({ data }) {
    skip();

    queue.add(
      () => {
        featured.innerHTML = data;
      },
      clear
    );
  },
  [hide]: skip
});
