import {
  // Constants
  twitch,
  message,
  // Elements.
  element,
  button,
  input,
  label,
  span,
  replaceChildren,
  // Event listeners.
  ClickListener,
  // Forms.
  Form,
  // Strings mapping.
  subscriberMapping,
  // I18n.
  defaultLang,
  i18n
} from '../../overlay.js';

import {
  alertMessages,
  alertTest,
  emitter,
  enable,
  getKey,
  groupKey,
  group,
  image,
  mappings,
  messages,
  platforms,
  settingsChange,
  sound,
  storeID,
  volume
} from './common.js';

const groupDescription = mapping => getKey(group, mapping);

const subscriberGift = groupDescription(subscriberMapping);

const translations = i18n({
  [defaultLang]: {
    [subscriberGift]: 'Gift',
    [message]: 'Message',
    [image]: 'Image',
    [sound]: 'Sound',
    [volume]: 'Volume',
    [enable]: 'Enable',
    test: 'Emulate',
    ...alertMessages[defaultLang]
  },
  fr: {
    [subscriberGift]: 'Cadeau',
    [sound]: 'Son',
    [platforms]: 'Plateformes',
    [enable]: 'Activer',
    test: 'Tester',
    apply: 'Appliquer',
    ...alertMessages.fr
  }
});

/**************
 ** ELEMENTS **
 **************/

const Input = (name, properties) => input({ // DRY?
  ...properties,
  classes: 'input',
  name
});

const Label = content => span({ classes: 'label', content }); // DRY?

const Field = (event, name, properties, extraClass) => label({ // DRY?
  title: properties.placeholder ?? '',
  classes: ['field', extraClass],
  content: [
    Input(getKey(event, name), properties),
    Label(translations[name])
  ]
});

const Legend = content => element('legend', { classes: 'label', content }); // DRY?

const Row = (...content) => element('div', { classes: 'row', content }); // DRY?

const TestButton = (mapping, root) => {
  const host = button({
    classes: ['button', 'info'],
    content: translations.test,
    type: 'button'
  });

  new ClickListener(() => emitter.emit( // TODO: event delegation?
    alertTest,
    { name: 'TheFrenchBiff', amount: 9001 },
    { platform: twitch, event: mapping.toString(), root }
  ), host);

  return host;
};

const Fields = (mapping, legend, event = mapping) => {
  const urlProperties = { type: 'url', pattern: 'https://.+' };

  return element('fieldset', {
    classes: 'fields',
    content: [
      Legend(legend),
      Field(event, message, { placeholder: translations[event] }),
      Field(event, image, urlProperties),
      Field(event, sound, urlProperties),
      Row(
        Field(event, volume, { type: 'number', min: 0, max: 1, step: 0.1 }),
        Field(
          event,
          enable,
          { type: 'checkbox', checked: true },
          'not-flexible'
        ),
        TestButton(mapping, event !== mapping)
      )
    ]
  });
};

/****************
 ** REAL MAGIC **
 ****************/

$platforms.name = platforms;
$messages.name = messages;

const fields = mappings.flatMap(mapping => {
  const legend = mapping.format();
  const fieldset = Fields(mapping, legend);

  return mapping.group ? [
    fieldset,
    Fields(
      mapping,
      `${legend} - ${translations[groupDescription(mapping)]}`,
      groupKey(mapping)
    ),
  ] : fieldset;
});

replaceChildren(fields, $fields);

new Form($form, {
  persisted: true,
  reset: false,
  submit() {
    emitter.emit(settingsChange);
  }
}, storeID);
