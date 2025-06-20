import {
  // Constants.
  message,
  // Aliases.
  arrayFrom,
  // Utilities.
  isString,
  // URL helpers.
  parameters,
  validateString,
  // Elements.
  replaceChildren,
  hide,
  setClasses,
  setText,
  setVariable,
  li,
  // Data persistence.
  Store,
  // Two way communication.
  Observer,
  // Theming.
  loadFonts,
  // I18n.
  i18n
} from '../../overlay.js';

import {
  // Constants.
  ended,
  closed,
  // Two way communication.
  event
} from './common.js';

loadFonts('Bebas+Neue:400');

i18n({ fr: { help: 'Envoyez 1, 2, ... pour voter !' } });

/****************
 ** PARAMETERS **
 ****************/

let { position } = parameters;

position = validateString(position);

/*************
 ** HELPERS **
 *************/

const votes = new Map();

const setPosition = position =>
  setClasses(position, setClasses(arrayFrom(poll.classList), poll, false));

const setVotes = (value, host = poll) => {
  setVariable('votes', value, host);
  return value;
};

const setSubject = value => setText(value, subject);

const setChoices = list => {
  votes.clear();
  setVotes(list.length > 0 ? 0 : null);

  replaceChildren(
    list.map((choice, i) => {
      const item = li({ content: choice });
      const set = new Set();
      set.style = item.style;
      setVotes(0, set);
      votes.set(`${i + 1}`, set);
      return item;
    }),
    choices
  );
};

const setOpen = open => setClasses('open', choices, open);

const chat = ({ platform, event, data }) => {
  if (event === message) {
    const { text, userId } = data.data;
    const userChoice = votes.get(text);

    if (userChoice) {
      const user = platform + userId;

      if (!userChoice.has(user)) {
        let total = 0;

        votes.forEach(choice => {
          choice[choice === userChoice ? 'add' : 'delete'](user);
          total += setVotes(choice.size, choice);
        });

        setVotes(total);
      }
    }
  }
};

/****************
 ** REAL MAGIC **
 ****************/

setPosition(position || new Store(true).get('position'));

let votesObserver;

new Observer({
  [event]({ data }) {
    switch (true) {
      // Position has changed.
      case isString(data): {
        if (!position) {
          setPosition(data);
        }

        break;
      }

      // Poll is closed.
      case data === closed:
        hide();
        setSubject(null);
        setChoices([]);

      // Poll has ended or is closed.
      case data === ended: {
        setOpen(false);

        if (votesObserver) {
          votesObserver.off();
          votesObserver = undefined;
        }

        break;
      }

      // Poll has started/changed.
      default: {
        const { poll, choices } = data;
        setSubject(poll);
        setChoices(choices);
        setOpen();
        hide(false);

        if (!votesObserver) {
          votesObserver = new Observer({ chat });
        }
      }
    }
  }
});
