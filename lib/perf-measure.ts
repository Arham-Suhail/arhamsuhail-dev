/**
 * Performance measurement and logging module for intro & splash transition
 * Active in development only (behind process.env.NODE_ENV !== "production")
 */

interface PerfTimestamps {
  splashMount?: number;
  videoLoadedMetadata?: { time: number; duration: number };
  videoPlaying?: number;
  mediaEnd?: number;
  exitTrigger?: number;
  exitFadeStart?: number;
  exitFadeEnd?: number;
  heroEntrance?: number;
  shaderMount?: number;
  shaderFirstFrame?: number;
}

interface LongTaskEntry {
  startTime: number;
  duration: number;
}

class PerfTracker {
  private isDev = process.env.NODE_ENV !== "production";
  public timestamps: PerfTimestamps = {};
  public longTasks: LongTaskEntry[] = [];
  private observer: PerformanceObserver | null = null;
  private summaryPrinted = false;

  constructor() {
    if (typeof window !== "undefined" && this.isDev) {
      this.initLongTaskObserver();
    }
  }

  private initLongTaskObserver() {
    if (typeof PerformanceObserver !== "undefined") {
      try {
        const supported = PerformanceObserver.supportedEntryTypes || [];
        if (supported.includes("longtask")) {
          this.observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              this.longTasks.push({ startTime: entry.startTime, duration: entry.duration });
              console.log(
                `%c[Perf: Long Task]%c startTime=${entry.startTime.toFixed(2)}ms duration=${entry.duration.toFixed(2)}ms`,
                "color: #ff9800; font-weight: bold",
                "color: inherit"
              );
            }
          });
          this.observer.observe({ entryTypes: ["longtask"] });
        }
      } catch {
        // Observer not supported
      }
    }
  }

  log(event: keyof PerfTimestamps, data?: unknown) {
    if (!this.isDev || typeof window === "undefined") return;
    const now = performance.now();

    if (event === "videoLoadedMetadata") {
      const dur = typeof data === "number" ? data : 0;
      this.timestamps.videoLoadedMetadata = { time: now, duration: dur };
      console.log(`[Perf] 2. video loadedmetadata: ${now.toFixed(2)}ms (duration: ${dur.toFixed(2)}s)`);
    } else {
      (this.timestamps as Record<string, number>)[event] = now;
      const labels: Record<string, string> = {
        splashMount: "1. splash mount",
        videoPlaying: "3. video playing",
        mediaEnd: "4. video ended (or exit trigger)",
        exitTrigger: "4b. exit trigger",
        exitFadeStart: "5. exit fade start",
        exitFadeEnd: "6. exit fade end and unmount",
        heroEntrance: "7. Hero entrance animation start",
        shaderMount: "8. shader mount",
        shaderFirstFrame: "9. shader first frame",
      };
      console.log(`[Perf] ${labels[event] || event}: ${now.toFixed(2)}ms`);
    }
  }

  onSplashGone() {
    if (!this.isDev || typeof window === "undefined" || this.summaryPrinted) return;
    this.log("exitFadeEnd");

    setTimeout(() => {
      this.printSummary();
    }, 1500);
  }

  printSummary() {
    if (this.summaryPrinted) return;
    this.summaryPrinted = true;
    this.observer?.disconnect();

    const t = this.timestamps;
    const exitStart = t.exitFadeStart ?? 0;
    const mediaEnd = t.mediaEnd ?? (t.videoLoadedMetadata ? (t.splashMount ?? 0) + t.videoLoadedMetadata.duration * 1000 : exitStart);
    const exitEnd = t.exitFadeEnd ?? 0;

    const gapMediaEndToExitStart = exitStart - mediaEnd;
    const gapExitStartToSplashGone = exitEnd - exitStart;

    let biggestLongTask: LongTaskEntry | null = null;
    for (const task of this.longTasks) {
      if (!biggestLongTask || task.duration > biggestLongTask.duration) {
        biggestLongTask = task;
      }
    }

    console.log(
      `\n%c=================== [STEP 1 PERF MEASUREMENT SUMMARY] ===================\n` +
      `Gap between media end and exit start: ${gapMediaEndToExitStart.toFixed(2)}ms\n` +
      `Gap between exit start and splash gone: ${gapExitStartToSplashGone.toFixed(2)}ms\n` +
      `Biggest long task: ${
        biggestLongTask
          ? `${biggestLongTask.duration.toFixed(2)}ms (at startTime: ${biggestLongTask.startTime.toFixed(2)}ms)`
          : "None (>50ms)"
      }\n` +
      `========================================================================\n`,
      "color: #70b8ff; font-weight: bold"
    );
  }
}

export const perfTracker = new PerfTracker();
