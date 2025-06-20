import {
  // Utilities.
  alias,
  // Elements.
  removeChildren,
  input,
  label,
  li,
  enable,
  getInputValue,
  // Event listeners.
  ClickListener,
  // Forms.
  Form,
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

const { blankVote, remove } = i18n({
  fr: {
    add: 'Ajouter',
    blankVote: 'Sans avis',
    bottomLeft: 'Bas gauche',
    bottomMiddle: 'Bas milieu',
    bottomRight: 'Bas droite',
    choices: 'Choix',
    close: 'Fermer',
    end: 'Terminer',
    middle: 'Milieu',
    middleLeft: 'Milieu gauche',
    middleRight: 'Milieu droite',
    remove: 'Retirer',
    start: 'Démarrer',
    subject: 'Sujet',
    topLeft: 'Haut gauche',
    topMiddle: 'Haut milieu',
    topRight: 'Haut droite',
  }
});

const choice = 'choice';
const { subject, blank, position } = $settings;

/*************
 ** HELPERS **
 *************/

const emit = data => event.emit(data);

const emitPosition = () => emit(getInputValue(position));

const focusSubject = () => $subject.focus();

/**************
 ** ELEMENTS **
 **************/

const ChoiceInput = alias(input, {
  classes: 'input',
  required: true,
  name: choice
});

const ChoiceField = () => label({ classes: 'field', content: ChoiceInput() });

const Choice = button =>
  li({ classes: 'row', content: [ChoiceField(), button] });

/****************
 ** REAL MAGIC **
 ****************/

const positionName = position[0].name;

const form = new Form($settings, {
  persisted: [blank.name, positionName],
  change(name) {
    if (name === positionName) {
      emitPosition();
    }
  },
  submit() {
    const choices = getInputValue($settings[choice], true); // FIXME: avoid dupes

    if (blank.checked) {
      choices.push(blankVote);
    }

    if (choices.length > 1) {
      let poll = getInputValue(subject);

      emit({ poll, choices });
      enable($end);
      enable($close);
    }
  },
  reset() {
    enable($end, false);
    enable($close, false);
    removeChildren($choices);
    focusSubject();
    emit(closed);
  }
}, true);

form.addRemovableFieldOnClick($addChoice, $choices, Choice, remove);

new ClickListener(alias(emit, ended), $end);

enable($position);
enable($subject);
enable($blank);
enable($start);

focusSubject();
emitPosition();
