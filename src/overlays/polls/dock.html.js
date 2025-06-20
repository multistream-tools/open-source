import {
  // Utilities.
  alias,
  // Elements.
  removeChildren,
  input,
  label,
  li,
  enable,
  getValue,
  // Event listeners.
  ClickListener,
  // Forms.
  Form,
  // I18n.
  i18n
} from '../../overlay.js';

import {
  // Constants.
  event,
  ended,
  closed,
  // Two way communication.
  emitter
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

const { subject, blank, position } = $settings;

/*************
 ** HELPERS **
 *************/

const emit = data => emitter.emit(event, data);

const emitPosition = () => emit(getValue(position));

const ChoiceInput = alias(input, {
  classes: 'input',
  name: 'choices',
  required: true
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
    const choices = getValue($settings.choices, true);

    if (blank.checked) {
      choices.push(blankVote);
    }

    if (choices.length > 1) {
      let poll = getValue(subject);

      emit({ poll, choices });
      enable($end);
      enable($close);
    }
  },
  reset() {
    enable($end, false);
    enable($close, false);
    removeChildren($choices);
    subject.focus();
    emit(closed);
  }
});

form.addRemovableFieldOnClick($addChoice, $choices, Choice, remove);
new ClickListener(alias(emit, ended), $end);
emitPosition();
