import {
  // Two way communication.
  Emitter
} from '../../overlay.js';

/***************
 ** CONSTANTS **
 ***************/

export const event = 'poll';

export const ended = null;
export const closed = false;

/***************************
 ** TWO WAY COMMUNICATION **
 ***************************/

export const emitter = new Emitter();
