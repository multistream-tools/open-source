import {
  // Two way communication.
  Emitter
} from '../../overlay.js';

/***************
 ** CONSTANTS **
 ***************/

export const feature = 'feature';
export const hide = 'hide';

/***************************
 ** TWO WAY COMMUNICATION **
 ***************************/

export const emitter = new Emitter();
