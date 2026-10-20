import type { LandingPage } from "@/lib/pages";

/** Mix landing pages: several layers preloaded together. Every layer stays adjustable. */
export const MIX_PAGES: LandingPage[] = [
  {
    type: "mix",
    slug: "rain-sounds",
    hero: true,
    wave: 1,
    title: "Rain sounds for focus, study and sleep",
    description:
      "Play free rain sounds in your browser: light rain, rain on a window and rain on leaves, layered into one steady shower you can adjust. No ads, works offline.",
    heading: "Rain sounds",
    intro: "Light rain, rain on the window and rain on leaves, layered. Tap play.",
    intent: { label: "Rain sounds", layers: { "light-rain": 0.55, "rain-on-window": 0.35, "rain-on-leaves": 0.25 } },
    copy: [
      {
        heading: "Why rain helps you settle",
        body: [
          "Rain is nature’s noise machine. Thousands of drops make a broad, even sound that covers distracting noises, much like [pink noise](/sounds/pink-noise), while small variations, such as a drop on glass or a gust through leaves, keep it from feeling artificial.",
          "It also carries a feeling of shelter: being indoors, dry and undisturbed while the weather does its thing. That makes rain one of the most popular backgrounds for studying, writing and falling asleep.",
          "Layering several rain recordings is what makes this mix work for long sessions. A single loop can start to feel repetitive after a while, but three layers with different textures overlap in ever-changing ways, so your ear never catches a pattern.",
        ],
      },
      {
        heading: "What’s in this mix",
        body: [
          {
            list: [
              "**Light rain** as the steady base.",
              "**Rain on a window** for close, crisp detail.",
              "**Rain on leaves** for a softer, outdoor texture.",
            ],
          },
          "Each layer has its own slider. Turn up the window for a cosy desk, the leaves for a forest, or add rain on a tent, a car roof or an umbrella from the Sounds tab. Focuship has eight different rain recordings to choose from.",
        ],
      },
      {
        heading: "Rain mixes to try",
        body: [
          {
            list: [
              "Rainy desk: rain on the window, quiet keyboard and a little pink noise.",
              "Rain and fire: add a crackling [fireplace](/sounds/fireplace) for a cosy evening.",
              "Rainy café: add [coffee shop](/sounds/coffee-shop) chatter for a busy, sheltered feeling.",
              "Storm: swap to heavy rain and add thunder, or open the [thunderstorm mix](/mix/thunderstorm).",
            ],
          },
          "The recordings are saved on your device after the first play, so your rain keeps falling offline.",
        ],
      },
    ],
    faq: [
      {
        q: "Are rain sounds good for studying?",
        a: "For many people, yes. Rain masks background noise and is predictable enough to fade into the background. Keep it at a low volume and pair it with a [25 minute timer](/timer/25-minutes).",
      },
      {
        q: "Can I fall asleep to rain sounds?",
        a: "Yes. Lower the window layer so the sound is soft and even, and set a timer if you would like it to stop later.",
      },
      {
        q: "Can I add thunder?",
        a: "Yes. Add thunder from the Sounds tab, or open the [thunderstorm mix](/mix/thunderstorm) for heavy rain, thunder and wind.",
      },
    ],
    related: ["/mix/thunderstorm", "/sounds/fireplace", "/sounds/pink-noise", "/timer/25-minutes", "/mix"],
  },
  {
    type: "mix",
    slug: "thunderstorm",
    hero: true,
    wave: 1,
    title: "Thunderstorm sounds: heavy rain, thunder and wind",
    description:
      "Play a free thunderstorm in your browser: heavy rain, rolling thunder and wind you can balance yourself. For deep focus, relaxing or sleep. No ads, works offline.",
    heading: "Thunderstorm sounds",
    intro: "Heavy rain, rolling thunder and wind. Tap play.",
    intent: { label: "Thunderstorm", layers: { "heavy-rain": 0.65, thunder: 0.45, wind: 0.2 } },
    copy: [
      {
        heading: "A storm you can control",
        body: [
          "A thunderstorm is the most dramatic kind of rain: a dense downpour that drowns out the room, with thunder rolling in the distance. The heavy rain does the work of a strong masking noise, while the thunder adds slow, low swells that make the soundscape feel vast.",
          "Because you control every layer, you can keep the storm cosy rather than startling: push the thunder back for a distant storm, or bring it forward when you want something more intense.",
          "Storm sounds are a favourite for people who find gentle rain too quiet to cover a noisy home or office. The weight of the downpour hides traffic, voices and household noise, and the thunder gives the soundscape a sense of scale that makes a small room feel far away from everything. For many people that sense of distance is exactly what makes it easier to sink into a task, a book or sleep.",
        ],
      },
      {
        heading: "What’s in this mix",
        body: [
          {
            list: [
              "**Heavy rain**: a steady, full downpour.",
              "**Thunder**: rolling, distant rumbles.",
              "**Wind**: gusts that give the storm space.",
            ],
          },
          "Try adding rain on a window for a view from indoors, or [brown noise](/sounds/brown-noise) to deepen the low end for long sessions.",
        ],
      },
      {
        heading: "Storms for focus and sleep",
        body: [
          "For work, keep thunder low so the rumbles don’t pull your attention; heavy rain alone is one of the strongest natural maskers for noisy homes and offices. For sleep, lower everything a little and let the storm fade with a timer.",
          "If the thunder is too much, switch to the gentler [rain sounds mix](/mix/rain-sounds). After the first play the recordings are stored on your device and work offline.",
        ],
      },
    ],
    faq: [
      {
        q: "Is thunderstorm sound good for sleep?",
        a: "Many people find it deeply relaxing. Keep the thunder low so sudden rumbles don’t wake you, and add brown noise to even out the sound.",
      },
      {
        q: "Can I turn off the thunder?",
        a: "Yes. Drag the thunder slider to zero, or remove the layer, and you are left with heavy rain and wind.",
      },
      {
        q: "Will this work for deep work?",
        a: "Yes, especially in noisy places, because heavy rain masks voices and traffic well. Pair it with a [50/10 Pomodoro](/pomodoro/50-10) for long sessions.",
      },
    ],
    related: ["/mix/rain-sounds", "/sounds/brown-noise", "/sounds/ocean-waves", "/pomodoro/50-10", "/mix"],
  },
];
