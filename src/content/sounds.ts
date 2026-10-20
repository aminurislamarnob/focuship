import type { LandingPage } from "@/lib/pages";

/** Sound landing pages: one recording or generated sound, preloaded in the mixer. */
export const SOUND_PAGES: LandingPage[] = [
  {
    type: "sound",
    slug: "brown-noise",
    hero: true,
    wave: 1,
    title: "Brown noise generator: free, endless and offline",
    description:
      "Play free brown noise in your browser: a deep, seamless rumble generated on your device, with no ads or sign-up. Mix it with rain or binaural beats and add a focus timer.",
    heading: "Brown noise",
    intro: "A deep, steady rumble, generated on your device. Tap play.",
    intent: { label: "Brown noise", layers: { "brown-noise": 0.6 } },
    copy: [
      {
        heading: "What brown noise is",
        body: [
          "Brown noise is random sound whose energy falls as the pitch rises: each octave up is about 6 dB quieter than the one below. That tilt toward the low end is why it sounds like a distant waterfall, heavy rain on a roof or the cabin of a plane, rather than the hiss of a detuned radio.",
          "The name comes from Robert Brown and the random “Brownian” motion of particles, not from the colour. It is sometimes called red noise. Next to it sit **pink noise**, which falls off half as steeply and sounds like steady rain, and **white noise**, which has equal energy at every frequency and sounds bright and hissy.",
        ],
      },
      {
        heading: "Why people use it to focus",
        body: [
          "Brown noise is a masking sound. A steady, low bed of noise makes sudden sounds such as a conversation across the room, traffic or a neighbour’s television less noticeable, because they no longer jump out of silence. Many people also find it calmer than white noise, which can feel sharp at the same loudness.",
          "Research on noise and attention is still limited and the results are mixed: some small studies suggest moderate background noise can help some people concentrate, while others find no effect. Treat it as a tool to try for yourself rather than a guaranteed fix.",
        ],
      },
      {
        heading: "How to get the most out of it",
        body: [
          {
            list: [
              "Keep the volume low: just loud enough to soften the room, quieter than a normal conversation.",
              "Layer it. Brown noise under light rain or a café keeps the texture interesting for long sessions. The Deep work preset pairs it with a slow alpha binaural tone.",
              "Pair it with a timer. Start a 25-minute focus session from the Timer tab and let the noise mark the time you’re working.",
              "Use headphones in shared spaces. Speakers work well at home, where the sound can fill the room.",
            ],
          },
          "Focuship generates its brown noise in your browser instead of streaming a recording, so it loops without a seam, costs no data and keeps working offline once the app is installed.",
        ],
      },
    ],
    faq: [
      {
        q: "Is brown noise better than white noise for focus?",
        a: "Neither is better for everyone. Brown noise is deeper and softer, which many people find easier to listen to for hours; white noise masks high-pitched sounds such as speech more strongly. Try both at a low volume and keep the one you notice least.",
      },
      {
        q: "Is it safe to listen to brown noise for hours?",
        a: "At a low, comfortable volume, steady background noise is generally fine for long sessions. Loud sound over long periods can damage hearing, so keep it quiet and take breaks. If you have tinnitus or a hearing condition, check with a professional.",
      },
      {
        q: "Does this brown noise work offline?",
        a: "Yes. The noise is generated on your device, so once Focuship is loaded (or installed to your home screen) it plays without a connection and never needs to buffer.",
      },
      {
        q: "Can I mix brown noise with other sounds?",
        a: "Yes. Open the Sounds tab and add rain, a café, a fireplace or a binaural tone; each layer has its own volume slider. Share the result as a link.",
      },
      {
        q: "Is Focuship free?",
        a: "Yes. There are no ads, no account and no tracking cookies.",
      },
    ],
    related: ["/sounds", "/"],
  },
  {
    type: "sound",
    slug: "heavy-rain",
    wave: 2,
    title: "Heavy rain sounds for focus and sleep",
    description:
      "Play a steady heavy rain recording in your browser, free and without ads. Layer it with thunder, wind or brown noise and pair it with a focus timer.",
    heading: "Heavy rain",
    intro: "A downpour that drowns out the room. Tap play.",
    intent: { label: "Heavy rain", layers: { "heavy-rain": 0.65 } },
    copy: [
      {
        heading: "A steady downpour",
        body: ["A dense, even rain that covers sudden noises. Add thunder for a storm, or brown noise for a deeper bed."],
      },
    ],
    faq: [],
    related: ["/sounds"],
  },
];
