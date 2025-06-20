import {
  // Constants.
  message,
  // Utils.
  notFalse,
  template,
  // Theming.
  loadFonts,
  // Elements.
  div,
  span,
  img,
  replaceChildren,
  hide,
  // Data persistence.
  Store,
  // Queue.
  Queue,
  // Anti spam.
  AntiSpam,
  // Audio.
  Sound,
  // Strings mapping.
  followerMapping,
  // Two way communication.
  Observer,
  // I18n.
  i18n
} from '../../overlay.js';

import {
  // Constants.
  activate,
  image,
  messages,
  platforms,
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

loadFonts('Nunito+Sans:700');

const translations = i18n(alertMessages);

/*************
 ** HELPERS **
 *************/

const store = new Store(true);

let showPlatforms;
let showMessages;

const buildAlertData = mapping => {
  const isEnabled = key => notFalse(store.get(key));

  const alertKey = key => getKey(mapping, key);

  showPlatforms = isEnabled(platforms);
  showMessages = isEnabled(messages);

  if (isEnabled(alertKey(activate))) {
    const get = (key, fallback) => store.get(alertKey(key)) || fallback;

    const soundURL = get(sound);
    const imageURL = get(image);

    return {
      message: showMessages && get(message, translations[mapping]),
      sound: soundURL && new Sound(soundURL, get(volume)),
      image: imageURL && Image(imageURL)
    };
  }
};

const hideAlert = hidden => hide(hidden, $alert);

/**************
 ** ELEMENTS **
 **************/

const Image = src => img(src, { classes: image });

const Platform = platform => span({ classes: ['platform', platform] });

const Message = (platform, event, data, key, text) => span({
  classes: [message, key],
  content: template(text, { ...data, platform, event })
});

const Alert = (platform, event, data, key, image, message) => [
  image,
  div({
    classes: 'footer',
    content: [
      showPlatforms && Platform(platform),
      message && Message(platform, event, data, key, message)
    ]
  })
];

/****************
 ** REAL MAGIC **
 ****************/

const antiSpam = new AntiSpam();
const queue = new Queue();

let alertsData;

const settings = () => {
  alertsData = mappings.reduce((reduced, mapping) => {
    const setAlertData = key => {
      const data = buildAlertData(key);
      return data ? reduced.set(key, data) : reduced;
    }

    if (mapping.group) {
      setAlertData(groupKey(mapping));
    }

    return setAlertData(mapping);
  }, new Map());
};

const alerts = ({ platform, event, data, root, group }) => {
  const mapping =
    !group && mappings.find(mapping => mapping.is(event, platform));

  if (mapping && (mapping !== followerMapping || antiSpam.check(mapping))) {
    const key = root && mapping.group ? groupKey(mapping) : mapping;
    const alert = alertsData.get(key);

    if (alert) {
      const { image, message, sound } = alert;

      queue.add(
        () => {
          replaceChildren(
            Alert(platform, event, data, key, image, message),
            $alert
          );

          sound?.play();
          hideAlert(false);
        },
        () => {
          hideAlert();
          sound?.stop();
        }
      );
    }
  }
};

settings();

new Observer({
  alerts,
  [settingsChange]: settings,
  [alertTest](data) {
    queue.clear();
    alerts(data);
  }
});
