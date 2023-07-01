import { SPEED_MAPPING } from './constants';
import { AnimationType } from './types';

class Timer {
  id: NodeJS.Timeout;
  start: number;
  remaining: number;
  callback: () => void;
  animationType: AnimationType;

  constructor(
    callback: () => void,
    delay: number,
    animationType: AnimationType
  ) {
    this.start = Date.now();
    this.remaining = delay;
    this.callback = callback;
    this.id = setTimeout(this.callback, delay);
    this.animationType = animationType;
  }

  pause() {
    clearTimeout(this.id);
    this.remaining = this.remaining - (Date.now() - this.start);
  }

  resume() {
    clearTimeout(this.id);
    this.start = Date.now();
    this.id = setTimeout(this.callback, this.remaining);
  }

  clear() {
    clearTimeout(this.id);
  }

  setRemainingByFactor(factor: number) {
    this.remaining *= factor;
  }
}

export default Timer;
