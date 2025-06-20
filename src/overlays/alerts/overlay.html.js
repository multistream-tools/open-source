import {
  // Constants.
  message,
  // Utils.
  getSafeMap,
  // Theming.
  loadFonts,
  // Elements.
  element,
  span,
  replaceChildren,
  hide,
  crossOrigin,
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
  alertMessages,
  alertTest,
  emitter,
  enable,
  getKey,
  groupKey,
  image,
  mappings,
  messages,
  platforms,
  settingsChange,
  sound,
  storeID,
  volume
} from './common.js';

loadFonts('Nunito+Sans:700');

const translations = i18n(alertMessages);

/*************
 ** HELPERS **
 *************/

const store = new Store(storeID);

let showPlatforms;
let showMessages;

const buildAlertData = mapping => {
  const isEnabled = key => store.get(key) !== false; // DRY?

  const alertKey = key => getKey(mapping, key);

  showPlatforms = isEnabled(platforms);
  showMessages = isEnabled(messages);

  if (isEnabled(alertKey(enable))) {
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

const template = (message, data) => { // TODO: export?
  data = getSafeMap(data);
  return message.replace(/{([a-z]+)}/g, (tag, key) => data[key] ?? tag);
};

const hideAlert = hidden => hide(hidden, $alert);

/**************
 ** ELEMENTS **
 **************/

const Image = src => element('img', crossOrigin({ classes: image, src })); // DRY?

const Platform = platform => span({ classes: ['platform', platform] }); // DRY?

const Message = (platform, event, data, key, text) => span({
  classes: [message, key],
  content: template(text, { ...data, platform, event })
});

const Alert = (platform, event, data, key, image, message) => [
  image,
  element('div', { // DRY?
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
  [emitter.key(settingsChange)]: settings,
  [emitter.key(alertTest)](data) {
    queue.clear();
    alerts(data);
  }
});
