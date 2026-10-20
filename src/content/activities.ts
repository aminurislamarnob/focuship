import type { LandingPage } from "@/lib/pages";

/** Activity landing pages: a mix tuned for one kind of work. */
export const ACTIVITY_PAGES: LandingPage[] = [
  {
    type: "activity",
    slug: "coding",
    hero: true,
    wave: 1,
    title: "Music for coding: focus sounds for programming",
    description:
      "Background sound for programming without lyrics or ads: brown noise, rain and binaural beats, a Pomodoro timer and keyboard shortcuts. Free, open source, works offline.",
    heading: "Sounds for coding",
    intro: "Brown noise and rain on the window, tuned for long programming sessions. Tap play.",
    intent: { label: "Coding mix", layers: { "brown-noise": 0.45, "rain-on-window": 0.3, alpha: 0.2 } },
    copy: [
      {
        heading: "Why lyrics and coding don’t mix",
        body: [
          "Programming leans hard on working memory: you hold variable names, the shape of a data structure and the next three steps in your head at once. Psychologists have long found that background speech, including sung lyrics, interferes with exactly that kind of work, even when you try to ignore it. The effect is called the irrelevant speech effect, and it is why many developers who love music still reach for something wordless when the problem gets hard.",
          "Steady ambient sound gives you the benefits of music, such as masking an open-plan office and marking the start of a session, without the words. This mix pairs [brown noise](/sounds/brown-noise) for a deep, constant bed, rain on a window for gentle texture and a quiet alpha [binaural beat](/sounds/binaural-beats) underneath.",
        ],
      },
      {
        heading: "Built for developers",
        body: [
          {
            list: [
              "**Keyboard first.** Space plays and pauses, M mutes, V opens focus mode, F goes full screen, and 1 to 3 switch tabs, so you never need to leave the keyboard.",
              "**Lives in a tab or the dock.** Install it as an app on desktop or phone; it keeps playing in the background with media-key and lock-screen controls.",
              "**No account, no ads, no tracking cookies.** Nothing interrupts a session, and nothing phones home.",
              "**Open source.** Focuship is MIT-licensed on GitHub, a static site with a hand-written Web Audio engine. Read the code, fork it or send a pull request.",
            ],
          },
        ],
      },
      {
        heading: "A coding session that sticks",
        body: [
          "Sound works best as part of a routine. Pick one mix for deep work and use it every time, so pressing play becomes the signal to start. Pair it with a [50/10 Pomodoro](/pomodoro/50-10) for long stretches, or a [90/20 block](/pomodoro/90-20) for the hardest problem of the day, and open focus mode on a second screen as a visible reminder that you are heads-down.",
          "If rain isn’t your thing, swap the layers: a quiet [coffee shop](/sounds/coffee-shop) suits lighter work such as code review, [white noise](/sounds/white-noise) is strongest against office chatter, and the [thunderstorm mix](/mix/thunderstorm) covers noisy homes. Share a mix with your team as a link.",
        ],
      },
    ],
    faq: [
      {
        q: "What is the best background sound for programming?",
        a: "Something steady and wordless that you can forget about. Brown noise, rain and low café chatter are popular choices; lyrics tend to compete with the reading and reasoning that coding needs.",
      },
      {
        q: "Is lo-fi music good for coding?",
        a: "Many developers like it, and instrumental music is far less distracting than songs with lyrics. If you notice yourself following the music, switch to ambient sound for the hardest parts of the day.",
      },
      {
        q: "Does Focuship work offline and in the background?",
        a: "Yes. Generated noises and tones need no download, recordings are saved after the first play, and playback continues with the tab in the background or the screen locked.",
      },
      {
        q: "Is it open source?",
        a: "Yes. Focuship is MIT-licensed and the code is on GitHub.",
      },
    ],
    related: ["/sounds/brown-noise", "/pomodoro/50-10", "/pomodoro/90-20", "/sounds/binaural-beats", "/sounds-for"],
  },
];
