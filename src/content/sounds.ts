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
          "The name comes from Robert Brown and the random “Brownian” motion of particles, not from the colour. It is sometimes called red noise. Next to it sit [pink noise](/sounds/pink-noise), which falls off half as steeply and sounds like steady rain, and [white noise](/sounds/white-noise), which has equal energy at every frequency and sounds bright and hissy.",
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
    related: ["/guides/brown-vs-white-vs-pink-noise", "/sounds/pink-noise", "/sounds/white-noise", "/sounds/binaural-beats", "/timer/25-minutes", "/sounds"],
  },
  {
    type: "sound",
    slug: "white-noise",
    hero: true,
    wave: 1,
    title: "White noise generator: free, seamless and offline",
    description:
      "Play free white noise in your browser: an even, bright hiss generated on your device that masks voices and sudden sounds. No ads, no sign-up, works offline.",
    heading: "White noise",
    intro: "An even, bright hiss that covers voices and clatter. Tap play.",
    intent: { label: "White noise", layers: { "white-noise": 0.45 } },
    copy: [
      {
        heading: "What white noise is",
        body: [
          "White noise contains every audible frequency at the same strength, much as white light contains every colour. Because our ears are more sensitive to high frequencies, it sounds bright: like static on an old television, a strong fan or air rushing from a vent.",
          "It is the brightest of the common noise colours. [Pink noise](/sounds/pink-noise) rolls off the highs and sounds like steady rain, and [brown noise](/sounds/brown-noise) rolls them off further still into a deep rumble.",
        ],
      },
      {
        heading: "Why it works as a mask",
        body: [
          "Speech is easiest to understand in the higher frequencies where consonants live, and that is exactly where white noise is strongest. A low layer of white noise makes nearby conversation blur into the background, which is why it is a long-standing choice for open offices, therapy waiting rooms and light sleepers.",
          "The trade-off is that some people find it harsh over long sessions. If it starts to feel tiring, switch to pink or brown noise, or mix a little white noise under softer sounds such as rain so it adds masking without dominating.",
        ],
      },
      {
        heading: "Tips for using white noise",
        body: [
          {
            list: [
              "Start quiet and turn it up only until voices stop pulling your attention.",
              "Place speakers between you and the noise source, such as a door or a shared wall, rather than right next to your head.",
              "For babies, keep machines well away from the cot and at a low volume; tests of infant sleep machines have found some can be surprisingly loud at full volume.",
              "Pair it with a [25 minute timer](/timer/25-minutes) so your focus sessions have a clear start and end.",
            ],
          },
          "Focuship generates white noise on your device with a seamless loop, so there is no repeating pattern to notice and it keeps playing offline.",
        ],
      },
    ],
    faq: [
      {
        q: "Is white noise good for studying?",
        a: "It can help if your problem is distracting speech or background chatter, because it masks voices well. If you find it fatiguing, try [pink noise](/sounds/pink-noise) or [brown noise](/sounds/brown-noise), which are softer.",
      },
      {
        q: "What is the difference between white, pink and brown noise?",
        a: "They differ in how much energy sits in the high frequencies. White noise is equal at every frequency and sounds bright, pink noise has less treble and sounds like rain, and brown noise has the least and sounds like a deep rumble.",
      },
      {
        q: "Can I fall asleep to white noise?",
        a: "Many people do. Keep the volume low and steady, and use a timer if you prefer it to stop after you fall asleep.",
      },
      {
        q: "Does it work offline?",
        a: "Yes. The noise is generated in your browser, so it needs no download and keeps working without a connection.",
      },
    ],
    related: ["/sounds/pink-noise", "/sounds/brown-noise", "/timer/25-minutes", "/sounds"],
  },
  {
    type: "sound",
    slug: "pink-noise",
    hero: true,
    wave: 1,
    title: "Pink noise generator: free, steady and offline",
    description:
      "Play free pink noise in your browser: a balanced, rain-like sound generated on your device, softer than white noise. Mix it with nature sounds and add a focus timer.",
    heading: "Pink noise",
    intro: "A balanced, rain-like hush, softer than white noise. Tap play.",
    intent: { label: "Pink noise", layers: { "pink-noise": 0.5 } },
    copy: [
      {
        heading: "What pink noise is",
        body: [
          "Pink noise is random sound with equal energy in every octave, so each step up in pitch gets a little quieter (about 3 dB per octave). To our ears it sounds balanced: closer to steady rain, wind in leaves or a waterfall than to the bright hiss of [white noise](/sounds/white-noise).",
          "It sits between white noise and [brown noise](/sounds/brown-noise), which drops off twice as steeply and sounds deeper. Audio engineers use pink noise to tune speakers because it matches how we perceive loudness across the range.",
        ],
      },
      {
        heading: "Pink noise for focus and sleep",
        body: [
          "As a background for work, pink noise masks distracting sounds while staying gentle enough for long sessions. Many people who find white noise too sharp settle on pink.",
          "It has also been studied in sleep research. In some laboratory studies, short bursts of pink noise timed to the slow waves of deep sleep were linked to better memory the next day. Those experiments used precisely timed sound, not a continuous track, so they don’t show that leaving pink noise on all night will do the same, but they help explain the interest.",
        ],
      },
      {
        heading: "Ways to use it",
        body: [
          {
            list: [
              "Use it as a neutral bed under [rain sounds](/mix/rain-sounds) or a café to smooth out quiet gaps.",
              "Keep it on through a [Pomodoro session](/pomodoro/25-5) and pause it during breaks, so silence marks your rest.",
              "At night, set a low volume and a timer so it fades out after you fall asleep.",
            ],
          },
          "Like the other noises in Focuship, pink noise is generated on your device with a seamless loop and works offline.",
        ],
      },
    ],
    faq: [
      {
        q: "Is pink noise better than white noise?",
        a: "It is softer, which many people prefer for long sessions and sleep. White noise masks speech a little more strongly. Try both at the same low volume.",
      },
      {
        q: "Does pink noise improve sleep?",
        a: "Some lab studies link precisely timed pink noise during deep sleep to better memory, but evidence for ordinary all-night playback is limited. If it helps you fall asleep, that is reason enough to use it.",
      },
      {
        q: "Can I mix pink noise with other sounds?",
        a: "Yes. Add rain, wind, a café or a fireplace from the Sounds tab; each layer has its own volume.",
      },
    ],
    related: ["/sounds/white-noise", "/sounds/brown-noise", "/mix/rain-sounds", "/pomodoro/25-5", "/sounds"],
  },
  {
    type: "sound",
    slug: "ocean-waves",
    hero: true,
    wave: 1,
    title: "Ocean waves sounds for focus, relaxing and sleep",
    description:
      "Play free ocean wave sounds in your browser: slow surf on the shore that you can layer with seagulls, wind or rain. No ads, no sign-up, works offline once played.",
    heading: "Ocean waves",
    intro: "Slow surf rolling onto the shore. Tap play.",
    intent: { label: "Ocean waves", layers: { waves: 0.65 } },
    copy: [
      {
        heading: "Why waves are so easy to listen to",
        body: [
          "Waves combine two things that make good background sound: a broad, noise-like wash that masks distractions, and a slow, irregular rhythm that never becomes a beat you have to follow. The swell and retreat is long enough to feel like breathing, which is why waves are a favourite for winding down.",
          "Unlike music, there is nothing to anticipate, so your attention stays on your work, or drifts toward sleep, rather than on the sound.",
          "Sea sounds are also one of the oldest relaxation tools: long before sound machines, people slept by open windows near the coast. The spread of frequencies in breaking surf overlaps with the noise colours that people choose for masking, which may be part of why it feels so natural to listen to for hours.",
        ],
      },
      {
        heading: "Building a seaside soundscape",
        body: [
          {
            list: [
              "Add a little wind for an open beach, or seagulls for the full Coastline preset.",
              "Layer [pink noise](/sounds/pink-noise) underneath to fill the quiet moments between waves.",
              "For a stormy coast, add heavy rain and a distant rumble of thunder.",
            ],
          },
          "The recording is streamed once and then saved on your device, so after the first play it works offline. Save every sound at once from About & offline.",
        ],
      },
      {
        heading: "Waves for focus and rest",
        body: [
          "For work, keep the waves low so the rhythm stays in the background; for a break, turn them up and step away from the screen. A [5 minute timer](/timer/5-minutes) with waves makes a short, proper rest between sessions, and a longer timer with waves alone is an easy way to fall asleep.",
        ],
      },
    ],
    faq: [
      {
        q: "Are ocean sounds good for sleep?",
        a: "Many people find them relaxing because the rhythm is slow and predictable. Use a low volume and a timer if you would like the sound to stop later.",
      },
      {
        q: "Can I use ocean waves while working?",
        a: "Yes, at a low volume. If the rhythm is too noticeable, mix in pink or brown noise to smooth it out.",
      },
      {
        q: "Is this a real recording?",
        a: "Yes. It is a field recording of surf, looped smoothly so you can listen for as long as you like.",
      },
    ],
    related: ["/mix/thunderstorm", "/sounds/pink-noise", "/timer/5-minutes", "/sounds"],
  },
  {
    type: "sound",
    slug: "fireplace",
    hero: true,
    wave: 1,
    title: "Fireplace sounds: crackling fire for focus and calm",
    description:
      "Play a free crackling fire in your browser: warm pops and hiss that you can layer with rain, wind or night sounds. No ads, no sign-up, works offline once played.",
    heading: "Fireplace sounds",
    intro: "A crackling fire, close and warm. Tap play.",
    intent: { label: "Fireplace", layers: { campfire: 0.6 } },
    copy: [
      {
        heading: "The sound of a fire",
        body: [
          "A wood fire makes a soft, wide hiss with irregular crackles and pops on top. The hiss works like a gentle noise layer, while the crackles add just enough detail to feel alive without asking for attention. This recording is of an outdoor campfire, which sounds much like a fireplace in a quiet room.",
          "Fire sounds are strongly associated with warmth, evenings and rest, so many people use them to make a working session feel calmer, or to signal the end of the day.",
          "That association is useful. Playing the same fire every evening when you stop work, read or wind down turns the sound into a cue: after a few days, hearing it is enough to tell your brain the demanding part of the day is over. Equally, a low fire behind a work session can make long tasks feel less like a grind and more like time spent somewhere pleasant.",
        ],
      },
      {
        heading: "Mixes to try",
        body: [
          {
            list: [
              "Fire and rain: crackling wood with rain on the window, the classic cosy evening.",
              "Night camp: fire with crickets and a distant owl.",
              "Winter cabin: fire with wind and a ticking clock.",
              "Reading nook: fire under the hush of a library.",
            ],
          },
        ],
      },
      {
        heading: "Using it for focus",
        body: [
          "Because the crackles are irregular, a fire works best at a low volume behind steady sounds such as [brown noise](/sounds/brown-noise) or rain. On its own, it suits lighter work, reading and winding down. Pair it with a [30 minute timer](/timer/30-minutes) for an evening reading session.",
          "After the first play the recording is stored on your device, so it keeps working offline.",
        ],
      },
    ],
    faq: [
      {
        q: "Is this a real fire recording?",
        a: "Yes. It is a field recording of a wood fire, looped seamlessly.",
      },
      {
        q: "Can I combine the fire with rain?",
        a: "Yes. Open the Sounds tab and add light rain or rain on a window, then balance the two with their sliders.",
      },
      {
        q: "Is it good for sleeping?",
        a: "Some people love it; others find the pops too lively. If so, lower the fire and add brown or pink noise underneath.",
      },
    ],
    related: ["/mix/rain-sounds", "/sounds/brown-noise", "/timer/30-minutes", "/sounds"],
  },
  {
    type: "sound",
    slug: "coffee-shop",
    hero: true,
    wave: 1,
    title: "Coffee shop sounds: café ambience for focus and creativity",
    description:
      "Play free coffee shop ambience in your browser: murmured chatter, cups and the hum of a busy café. Research links moderate noise like this to creative thinking.",
    heading: "Coffee shop sounds",
    intro: "Murmured chatter, clinking cups, the hum of a busy café. Tap play.",
    intent: { label: "Coffee shop", layers: { cafe: 0.6 } },
    copy: [
      {
        heading: "Why people work in cafés",
        body: [
          "Plenty of writers, students and programmers do their best work in a busy café. The sound is a big part of it: a steady murmur of voices you can’t quite make out, the clink of cups and the hiss of the espresso machine. It is lively enough to feel like company, but too blurred to follow.",
          "There is research behind the habit. A 2012 study published in the Journal of Consumer Research found that a moderate level of ambient noise, around 70 dB (roughly the level of a busy café), improved performance on creative tasks compared with a quiet room, while louder noise made it worse. The researchers suggested that mild distraction nudges the mind toward more abstract thinking.",
        ],
      },
      {
        heading: "Getting the level right",
        body: [
          "The finding depends on the noise being moderate. Set the café loud enough to fill the room, but not so loud that you strain to think. For detailed, analytical work you may prefer a quieter setting or steadier sound such as [brown noise](/sounds/brown-noise).",
          {
            list: [
              "Corner café: café chatter with light rain outside.",
              "Café at the desk: café with quiet keyboard typing.",
              "Late-night diner: a lower café level with a ticking clock.",
            ],
          },
        ],
      },
      {
        heading: "A café without the queue",
        body: [
          "Focuship gives you the sound of a café wherever you are, without the noise spikes of a real one: no sudden laughter beside you, no milk steamer in your ear. Pair it with a [Pomodoro timer](/pomodoro/25-5) and you have a portable writing room. After the first play the recording is saved on your device and works offline.",
        ],
      },
    ],
    faq: [
      {
        q: "Does café noise really help creativity?",
        a: "A 2012 study found that moderate ambient noise around 70 dB improved creative performance compared with quieter and louder conditions. It is one line of research, so treat it as a reason to try it, not a guarantee.",
      },
      {
        q: "Is café ambience good for studying?",
        a: "For reading and creative work many people find it helps. For memorising or detailed problem solving, steadier sound such as brown or pink noise may distract less.",
      },
      {
        q: "Can I add rain to the café?",
        a: "Yes. The Corner café preset already pairs café chatter with light rain, and you can add any other sound from the Sounds tab.",
      },
    ],
    related: ["/guides/why-cafe-noise-helps-creativity", "/mix/rain-sounds", "/sounds/brown-noise", "/pomodoro/25-5", "/sounds"],
  },
  {
    type: "sound",
    slug: "binaural-beats",
    hero: true,
    wave: 1,
    title: "Binaural beats for focus: free alpha, beta, theta and gamma",
    description:
      "Play free binaural beats in your browser: theta, alpha, beta and gamma tones generated on your device, alone or under rain and noise. Headphones required.",
    heading: "Binaural beats",
    intro: "Put on headphones: a 10 Hz alpha beat is loaded. Tap play.",
    intent: { label: "Alpha binaural beat", layers: { alpha: 0.45 } },
    copy: [
      {
        heading: "How binaural beats work",
        body: [
          "A binaural beat is an illusion your brain creates. Play a tone of 200 Hz in one ear and 210 Hz in the other, and you perceive a slow pulse at the difference, 10 Hz, even though neither ear hears it. Because each ear must get its own tone, **binaural beats only work with headphones**.",
          "Beats are usually grouped by the brainwave bands they are named after. Focuship generates four:",
          {
            list: [
              "**Theta, 6 Hz**: associated with drowsiness and daydreaming; often used for relaxation.",
              "**Alpha, 10 Hz**: associated with relaxed alertness; a popular choice for calm focus.",
              "**Beta, 16 Hz**: associated with active, engaged thinking.",
              "**Gamma, 40 Hz**: associated with high-level processing; the most studied band in recent research.",
            ],
          },
        ],
      },
      {
        heading: "What the research says",
        body: [
          "The idea is that a beat can nudge brain activity toward the matching band, an effect called entrainment. The evidence is mixed: some studies report small effects on attention, anxiety or memory, while others find none, and a 2023 systematic review described the results as inconsistent. Treat binaural beats as something to try, not a proven treatment.",
          "What is clear is that they are a gentle, steady sound that many people find pleasant to work to. If you have epilepsy or a seizure disorder, talk to a doctor before using rhythmic audio.",
        ],
      },
      {
        heading: "How to use them",
        body: [
          {
            list: [
              "Wear headphones and keep the volume low; the beat should be a soft pulse, not a buzz.",
              "Layer a beat under [brown noise](/sounds/brown-noise) or rain. The Deep work preset pairs alpha with brown noise.",
              "Give it a full session, such as a [25 minute timer](/timer/25-minutes), before judging whether it helps you.",
            ],
          },
          "All four tones are generated on your device as two pure tones, one per ear, so they loop seamlessly and work offline.",
        ],
      },
    ],
    faq: [
      {
        q: "Do I need headphones for binaural beats?",
        a: "Yes. Each ear must receive its own tone for the beat to form. On speakers the two tones mix in the air and the effect disappears.",
      },
      {
        q: "Which binaural beat is best for focus?",
        a: "Alpha (10 Hz) and beta (16 Hz) are the usual choices for focus, and gamma (40 Hz) is popular for demanding work. Evidence for any one band is limited, so try each for a session.",
      },
      {
        q: "Are binaural beats safe?",
        a: "At a comfortable volume they are generally considered safe. People with epilepsy or a seizure disorder should check with a doctor first.",
      },
      {
        q: "Can I mix binaural beats with other sounds?",
        a: "Yes. Add rain, noise or a café from the Sounds tab, and keep the beat a little quieter than the other layers.",
      },
    ],
    related: ["/guides/do-binaural-beats-help-focus", "/sounds/brown-noise", "/timer/25-minutes", "/pomodoro/50-10", "/sounds"],
  },
];
