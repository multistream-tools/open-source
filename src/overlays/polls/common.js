import {
  // Two way communication.
  Emitter
} from '../../overlay.js';

/***************
 ** CONSTANTS **
 ***************/

export const ended = null;
export const closed = false;

/***************************
 ** TWO WAY COMMUNICATION **
 ***************************/

export const { event } = new Emitter();
