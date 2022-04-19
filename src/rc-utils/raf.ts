
let _raf = (callback: FrameRequestCallback) => +setTimeout(callback, 16);
let _caf = (num: number) => clearTimeout(num);

if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
  _raf = (callback: FrameRequestCallback) =>
    window.requestAnimationFrame(callback);
  _caf = (handle: number) => window.cancelAnimationFrame(handle);
}

let rafUUID = 0;
const rafIds = new Map<number, number>();

function cleanup(id: number) {
  rafIds.delete(id);
}

export default function wrapperRaf(callback: () => void, times = 1): number {
  rafUUID += 1;
  const id = rafUUID;

  function callRef(leftTimes: number) {
    if (leftTimes === 0) {
      cleanup(id);
      callback();
    } else {
      const realId = _raf(() => {
        callRef(leftTimes - 1);
      });
      rafIds.set(id, realId);
    }
  }

  callRef(times);

  return id;
}

wrapperRaf.cancel = (id: number) => {
  const realId: number | undefined = rafIds.get(id);
  cleanup(realId as number);
  return _caf(realId as number);
};