import { useSyncExternalStore } from "react";

export type IntroState = {
  shaderReady: boolean;
  introDone: boolean;
  fallbackTimeoutFired: boolean;
};

let state: IntroState = {
  shaderReady: false,
  introDone: false,
  fallbackTimeoutFired: false,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export const introStore = {
  getState(): IntroState {
    return state;
  },
  setShaderReady() {
    if (!state.shaderReady) {
      state = { ...state, shaderReady: true };
      notify();
    }
  },
  setIntroDone() {
    if (!state.introDone) {
      state = { ...state, introDone: true };
      notify();
    }
  },
  setFallbackTimeoutFired() {
    if (!state.fallbackTimeoutFired) {
      state = { ...state, fallbackTimeoutFired: true };
      notify();
    }
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useIntroStore() {
  return useSyncExternalStore(
    introStore.subscribe,
    introStore.getState,
    introStore.getState
  );
}
