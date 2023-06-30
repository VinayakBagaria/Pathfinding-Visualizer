class Timer {
  id: NodeJS.Timeout;
  start: number;
  remaining: number;
  callback: () => void;

  constructor(callback: () => void, delay: number) {
    this.start = Date.now();
    this.remaining = delay;
    this.callback = callback;
    this.id = setTimeout(this.callback, delay);
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
}

export default Timer;
