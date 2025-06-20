import {
  // Constants
  twitch,
  message,
  // Elements.
  element,
  button,
  input,
  label,
  fieldset,
  div,
  span,
  replaceChildren,
  enable,
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
  // Constants.
  activate,
  group,
  image,
  platforms,
  messages,
  sound,
  volume,
  // Helpers.
  getKey,
  groupKey,
  // Mappings.
  mappings,
  // i18n.
  alertMessages,
  // Two way communication.
  alertTest,
  settingsChange
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
    [activate]: 'Activate',
    test: 'Emulate',
    ...alertMessages[defaultLang]
  },
  fr: {
    [subscriberGift]: 'Cadeau',
    [sound]: 'Son',
    [platforms]: 'Plateformes',
    [activate]: 'Activer',
    test: 'Tester',
    apply: 'Appliquer',
    ...alertMessages.fr
  }
});

/**************
 ** ELEMENTS **
 **************/

const Input = (name, properties) => input({
  ...properties,
  classes: 'input',
  name
});

const Label = content => span({ classes: 'label', content });

const Field = (event, name, properties, extraClass) => label({
  title: properties.placeholder ?? '',
  classes: ['field', extraClass],
  content: [
    Input(getKey(event, name), properties),
    Label(translations[name])
  ]
});

const Legend = content => element('legend', { classes: 'label', content });

const Row = (...content) => div({ classes: 'row', content });

const TestButton = (event, root) => button({
  classes: [alertTest, 'button', 'info'],
  [alertTest]: { event, root },
  content: translations.test
});

const Fields = (mapping, legend, event = mapping) => {
  const urlProperties = { type: 'url', pattern: 'https://.+' };

  return fieldset({
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
          activate,
          { type: 'checkbox', checked: true },
          'not-flexible'
        ),
        TestButton(mapping.toString(), event !== mapping)
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

new Form($form, {
  persisted: true,
  submit() {
    settingsChange.emit();
  }
}, true);

new ClickListener(
  target => alertTest.emit(
    { name: 'TheFrenchBiff', amount: 9001 },
    { ...target[alertTest], platform: twitch }
  ),
  $fields,
  { delegate: `[class~='${alertTest}']` }
);

replaceChildren(fields, $fields);
enable($platforms);
enable($messages);
enable($apply);
