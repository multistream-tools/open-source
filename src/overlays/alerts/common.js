import {
  // Constants.
  message,
  // Strings mapping.
  subscriberMapping,
  cheerMapping,
  tipMapping,
  merchMapping,
  followerMapping,
  raidMapping,
  shareMapping,
  likeMapping,
  // I18n.
  defaultLang,
  // Two way communication.
  Emitter
} from '../../overlay.js';

/***************
 ** CONSTANTS **
 ***************/

export const platforms = 'platforms';
export const messages = `${message}s`;
export const group = 'group';

export const image = 'image';
export const sound = 'sound';
export const volume = 'volume';
export const activate = 'activate';

/*************
 ** HELPERS **
 *************/

export const getKey = (...args) => args.join('.');

export const groupKey = mapping => getKey(mapping, group);

/***************************
 ** TWO WAY COMMUNICATION **
 ***************************/

export const { alertTest, settingsChange } = new Emitter();

/****************
 ** REAL MAGIC **
 ****************/

export const mappings = [
  subscriberMapping,
  cheerMapping,
  tipMapping,
  merchMapping,
  followerMapping,
  raidMapping,
  shareMapping,
  likeMapping
];

const subscriberGift = getKey(subscriberMapping, group);

export const alertMessages = {
  [defaultLang]: {
    [subscriberMapping]: 'New {event} - {name} - {amount} month(s)',
    [subscriberGift]: 'New {event} gift - {name} - x{amount}',
    [cheerMapping]: 'New {event} - {name} - x{amount}',
    [tipMapping]: 'New {event} - {name} - ${amount}',
    [merchMapping]: 'New {event} purchase - {name}',
    [followerMapping]: 'New {event} - {name}',
    [raidMapping]: 'New {event} - {name} - {amount} viewer(s)',
    [shareMapping]: 'New share - {name}',
    [likeMapping]: 'New like - {name}'
  },
  fr: {
    [subscriberMapping]: 'Nouveau {event} - {name} - {amount} mois',
    [subscriberGift]: 'Nouveau {event} offert - {name} - x{amount}',
    [cheerMapping]: 'Nouveau {event} - {name} - x{amount}',
    [tipMapping]: 'Nouveau {event} - {name} - {amount}€',
    [merchMapping]: 'Nouvel achat de {event} - {name}',
    [followerMapping]: 'Nouveau {event} - {name}',
    [raidMapping]: 'Nouveau {event} - {name} - {amount} spectateur(s)',
    [shareMapping]: 'Nouveau partage - {name}',
    [likeMapping]: 'Nouveau like - {name}'
  }
};
