"use client";

import { useCallback, useEffect, useRef } from "react";

const CRY_SRC = "/sounds/baby-cry.mp3";
const SLEEP_SRC = "/sounds/baby-sleep.mp3";

const CRY_GAIN = 0.85;
const SLEEP_GAIN = 0.5;
const FADE_S = 0.9;

type Rig = {
  ctx: AudioContext | null;
  cryEl: HTMLAudioElement;
  sleepEl: HTMLAudioElement;
  cryGain: GainNode | null;
  sleepGain: GainNode | null;
};

export function useNurseryAudio(enabled: boolean, crying: boolean) {
  const rigRef = useRef<Rig | null>(null);

  useEffect(() => {
    const cryEl = new Audio(CRY_SRC);
    const sleepEl = new Audio(SLEEP_SRC);

    [cryEl, sleepEl].forEach((audio) => {
      audio.loop = true;
      audio.preload = "auto";
    });

    let rig: Rig;

    try {
      const Ctx =
        window.AudioContext ??
        (
          window as unknown as {
            webkitAudioContext: typeof AudioContext;
          }
        ).webkitAudioContext;

      const ctx = new Ctx();

      const cryGain = ctx.createGain();
      const sleepGain = ctx.createGain();

      cryGain.gain.value = 0;
      sleepGain.gain.value = 0;

      ctx
        .createMediaElementSource(cryEl)
        .connect(cryGain)
        .connect(ctx.destination);

      ctx
        .createMediaElementSource(sleepEl)
        .connect(sleepGain)
        .connect(ctx.destination);

      rig = {
        ctx,
        cryEl,
        sleepEl,
        cryGain,
        sleepGain,
      };
    } catch (error) {
      console.warn("Web Audio unavailable, using normal audio volume.", error);

      cryEl.volume = 0;
      sleepEl.volume = 0;

      rig = {
        ctx: null,
        cryEl,
        sleepEl,
        cryGain: null,
        sleepGain: null,
      };
    }

    rigRef.current = rig;

    return () => {
      rig.cryEl.pause();
      rig.sleepEl.pause();

      rig.cryEl.src = "";
      rig.sleepEl.src = "";

      if (rig.ctx) {
        void rig.ctx.close().catch(() => {});
      }

      rigRef.current = null;
    };
  }, []);

  /*
   * This function is called directly from a real user click.
   * That is important because browsers block autoplay until
   * the user interacts with the page.
   */
  const unlockAudio = useCallback(async () => {
    const rig = rigRef.current;

    if (!rig) {
      console.warn("Audio rig is not ready yet.");
      return;
    }

    const { ctx, cryEl, sleepEl } = rig;

    try {
      if (ctx && ctx.state === "suspended") {
        await ctx.resume();
      }

      await Promise.allSettled([
        cryEl.play(),
        sleepEl.play(),
      ]);

      console.log("Nursery audio unlocked successfully.");
    } catch (error) {
      console.error("Could not unlock nursery audio:", error);
    }
  }, []);

  useEffect(() => {
    const rig = rigRef.current;

    if (!rig) return;

    const { cryEl, sleepEl, cryGain, sleepGain } = rig;

    const fade = (cryTo: number, sleepTo: number) => {
      if (cryGain && sleepGain && rig.ctx) {
        const t = rig.ctx.currentTime;

        for (const [gain, to] of [
          [cryGain.gain, cryTo],
          [sleepGain.gain, sleepTo],
        ] as const) {
          gain.cancelScheduledValues(t);
          gain.setValueAtTime(gain.value, t);
          gain.linearRampToValueAtTime(to, t + FADE_S);
        }
      } else {
        cryEl.volume = cryTo;
        sleepEl.volume = sleepTo;
      }
    };

    if (!enabled) {
      fade(0, 0);

      const id = setTimeout(() => {
        cryEl.pause();
        sleepEl.pause();

        cryEl.currentTime = 0;
        sleepEl.currentTime = 0;
      }, (FADE_S + 0.25) * 1000);

      return () => clearTimeout(id);
    }

    /*
     * Once audio has been unlocked by the user's click,
     * keep both audio tracks running silently and crossfade
     * between them.
     */
    if (rig.ctx && rig.ctx.state === "running") {
      void cryEl.play().catch((error) => {
        console.error("Baby cry audio failed:", error);
      });

      void sleepEl.play().catch((error) => {
        console.error("Baby sleep audio failed:", error);
      });
    }

    fade(
      crying ? CRY_GAIN : 0,
      crying ? 0 : SLEEP_GAIN
    );

    return undefined;
  }, [enabled, crying]);

  return {
    unlockAudio,
  };
}