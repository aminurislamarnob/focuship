import type { LandingPage } from "@/lib/pages";

/** Later-wave activity pages. */
export const MORE_ACTIVITY_PAGES: LandingPage[] = [
  {
    type: "activity",
    slug: "studying",
    wave: 2,
    title: "Study sounds: background noise for studying",
    description: "Background sounds for studying: library ambience, rain and pink noise with a study timer. Free in your browser, no lyrics, no ads, works offline.",
    heading: "Sounds for studying",
    intro: "A calm library with soft rain outside, tuned for study. Tap play.",
    intent: { label: "Study mix", layers: { library: 0.55, "light-rain": 0.3, "pink-noise": 0.15 } },
    copy: [
      {
        heading: "What makes a good study sound",
        body: [
          "Studying asks you to read, understand and remember, all of which lean on verbal working memory. That is why songs with lyrics tend to make it harder: research on the irrelevant speech effect shows that background words interfere with exactly that kind of processing, even when you try to ignore them.",
          "The best study sounds are wordless, steady and calm. This mix starts with a [library](/sounds/library), the most study-associated sound there is, adds [light rain](/sounds/light-rain) for a sheltered feel, and a little [pink noise](/sounds/pink-noise) to mask household noise.",
          "A study session also benefits from a clear start ritual. Clear the desk, put your phone away, choose the topic, then press play and start the timer together. Over a few days the sound becomes the cue, and starting gets easier.",
        ],
      },
      {
        heading: "A study routine that works",
        body: [
          {
            list: [
              "**Time-box it.** Use a [Pomodoro timer](/pomodoro/25-5) for revision, or a [45 minute timer](/timer/45-minutes) to mirror a class period.",
              "**Test yourself.** Spend the last minutes of each session recalling what you learned without notes; it beats re-reading.",
              "**Take real breaks.** Stand up and move between sessions.",
              "**Keep the same mix.** The same sound each session becomes a cue to focus.",
            ],
          },
          "For exam practice, consider silence: if the exam room will be quiet, rehearse in quiet too.",
        ],
      },
      {
        heading: "Other study sounds to try",
        body: [
          "If the library feels too quiet, try the [corner café mix](/mix/corner-cafe) for a livelier room, or [brown noise](/sounds/brown-noise) for a deeper, more neutral mask. For maths and problem solving, steadier sounds usually beat lively ones.",
        ],
      },
    ],
    faq: [
      { q: "Is it better to study in silence or with background noise?", a: "Silence is ideal if your space is quiet. Background sound helps when there is noise to mask, or when it helps you settle into a session." },
      { q: "Is music with lyrics bad for studying?", a: "For reading and memorising, research suggests lyrics make it harder. Instrumental music or ambient sound distracts less." },
      { q: "What is the best noise colour for studying?", a: "Pink noise is a good all-round choice; brown noise is softer, white noise masks voices most. Try each for a session." },
    ],
    related: ["/sounds/library", "/pomodoro/25-5", "/timer/45-minutes", "/guides/brown-vs-white-vs-pink-noise", "/sounds-for"],
  },
  {
    type: "activity",
    slug: "reading",
    wave: 2,
    title: "Reading sounds: ambience for reading books",
    description: "Ambient sounds for reading: a crackling fire, rain on the window and a quiet room. Free in your browser, wordless and calm, with a reading timer.",
    heading: "Sounds for reading",
    intro: "Rain on the window and a fire in the grate. Tap play and open your book.",
    intent: { label: "Reading mix", layers: { "rain-on-window": 0.45, campfire: 0.4, clock: 0.08 } },
    copy: [
      {
        heading: "Why the right sound helps you read",
        body: [
          "Reading is easily broken by sound you can’t ignore: a conversation, a television in the next room, notifications. Words are the worst offenders, because your brain automatically processes speech it hears. A 2014 study found reading comprehension dropped with lyrical music, whether people liked it or not.",
          "Wordless, cosy sound does the opposite. This mix pairs [rain on the window](/sounds/rain-on-window) with a [crackling fire](/sounds/fireplace) and a barely-there clock, the sound of a quiet room on a wet evening, built to disappear once you are absorbed in the page.",
          "The fire and rain are chosen because they never compete with the page. Neither has a melody or a rhythm to follow, and both sit low in the background, so once you are absorbed in a book you stop hearing them altogether. That is the sign the sound is doing its job.",
        ],
      },
      {
        heading: "Building a reading habit",
        body: [
          {
            list: [
              "**Read at the same time each day** with the same sound; it quickly becomes a cue.",
              "**Set a gentle target** such as a [30 minute timer](/timer/30-minutes), and keep going if you are enjoying it.",
              "**Put your phone in another room.** Sound can mask noise, not notifications.",
              "**Use focus mode** on a tablet or laptop as a large clock if you read on paper.",
            ],
          },
        ],
      },
      {
        heading: "Other reading moods",
        body: [
          "For study reading, the [reading room mix](/mix/reading-room) recreates a library. For long journeys, try the [sleeper car](/mix/sleeper-car). For summer, swap the fire for crickets and a gentle breeze, and for a beach read, try ocean waves.",
        ],
      },
    ],
    faq: [
      { q: "Can I listen to music while reading?", a: "Instrumental music is fine for many people, but research suggests lyrics reduce comprehension. Ambient sound is the safest choice." },
      { q: "What is the best sound for reading?", a: "Something cosy, steady and wordless: rain, a fire, a library or soft noise." },
      { q: "Will the sound keep playing if my screen turns off?", a: "Yes. Playback continues in the background and with the screen locked, with controls on your lock screen." },
    ],
    related: ["/mix/rain-and-fireplace", "/mix/reading-room", "/timer/30-minutes", "/sounds-for"],
  },
  {
    type: "activity",
    slug: "writing",
    wave: 2,
    title: "Writing sounds: ambience for writers",
    description: "Background sounds for writing: café murmur, rain and a typewriter, with a timer for writing sprints. Free in your browser, no lyrics, no ads.",
    heading: "Sounds for writing",
    intro: "A café murmur, rain outside and the odd typewriter clack. Tap play and write.",
    intent: { label: "Writing mix", layers: { cafe: 0.45, "light-rain": 0.3, typewriter: 0.15 } },
    copy: [
      {
        heading: "Sound for each stage of writing",
        body: [
          "Writing has two very different modes, and they suit different sounds. **Drafting** is generative: you want ideas to flow, and a lively, blurred background can help. A 2012 study found moderate ambient noise, around the level of a busy café, improved creative thinking. **Editing** is detailed: you need to notice every word, and steadier, quieter sound works better.",
          "This mix is built for drafting: [café chatter](/sounds/coffee-shop) for energy, [light rain](/sounds/light-rain) for shelter and a quiet [typewriter](/sounds/typewriter) as a cue that words are being made. For editing, switch to [brown noise](/sounds/brown-noise) or the [reading room mix](/mix/reading-room).",
          "Sound can also help with the hardest part of writing, which is starting. Pressing play and starting a sprint timer turns “I should write” into a small, concrete action, and the familiar sound tells your brain what kind of session this is.",
        ],
      },
      {
        heading: "Writing sprints",
        body: [
          {
            list: [
              "**Sprint with a timer.** A [25 minute timer](/timer/25-minutes) is a classic writing sprint: no editing, no research, just words.",
              "**Track words, not hours.** Note your count after each sprint.",
              "**Leave a sentence half-finished** at the end of a session so the next one starts easily.",
              "**Keep a separate list** for things to look up later, so research doesn’t break the flow.",
            ],
          },
        ],
      },
      {
        heading: "Other moods for writers",
        body: [
          "For fiction, try a scene-setting mix: a [thunderstorm](/mix/thunderstorm) for drama, [night camp](/mix/night-camp) for warmth, or [deep space](/mix/deep-space) for science fiction. Matching the sound to the scene can help you write it, and gives each project its own sound to return to.",
        ],
      },
    ],
    faq: [
      { q: "Is café noise good for writing?", a: "For drafting and brainstorming, many writers find it helps, and a 2012 study supports moderate noise for creativity. For editing, quieter sound is usually better." },
      { q: "Should I write with music?", a: "Lyrics compete with the words you are writing. Instrumental music or ambient sound distracts less." },
      { q: "Is the typewriter too loud?", a: "It is kept quiet in this mix. Lower or remove it if the bell distracts you." },
    ],
    related: ["/sounds/coffee-shop", "/sounds/typewriter", "/guides/why-cafe-noise-helps-creativity", "/timer/25-minutes", "/sounds-for"],
  },
  {
    type: "activity",
    slug: "sleep",
    wave: 2,
    title: "Sleep sounds: rain, noise and ambience for sleep",
    description: "Free sleep sounds in your browser: soft rain, brown noise and a night train, with a sleep timer. No ads, no account, works offline and with the screen off.",
    heading: "Sounds for sleep",
    intro: "Soft rain over brown noise, kept low for sleep. Tap play.",
    intent: { label: "Sleep mix", layers: { "light-rain": 0.4, "brown-noise": 0.35 } },
    copy: [
      {
        heading: "How sleep sounds help",
        body: [
          "Most sleep sounds work by masking: a steady background makes sudden noises, such as traffic, a door, a partner snoring or the building settling, less likely to stand out and wake you. The best sleep sounds are steady, low and free of sudden peaks.",
          "This mix combines soft [light rain](/sounds/light-rain) with [brown noise](/sounds/brown-noise), the deepest and softest of the noise colours. Together they give gentle texture and strong, low masking without any hiss.",
          "If you share a room, a steady sound can also cover a partner’s snoring or early alarm, and many people find a familiar sleep sound helps in unfamiliar places such as hotels, where every new noise is noticeable.",
        ],
      },
      {
        heading: "Sleeping with sound",
        body: [
          {
            list: [
              "**Keep it quiet.** Quieter than a conversation; steady sound still counts toward your noise exposure.",
              "**Pause from the lock screen.** Media controls let you stop the sound without unlocking your phone or turning on the screen.",
              "**Place your phone or speaker away from your head**, especially for children.",
              "**Keep it consistent.** The same sound each night becomes part of your wind-down routine.",
            ],
          },
          "Focuship keeps playing with the screen locked, and works offline once sounds have been played, so it is ready on a plane or in a hotel.",
        ],
      },
      {
        heading: "Other sleep sounds",
        body: [
          "Different sounds suit different people, so try a few over a week. Try the [sleeper car](/mix/sleeper-car) for a night train, [airplane cabin](/sounds/airplane-cabin) noise for a deep hum, [rain on a tent](/sounds/rain-on-tent) for a night camping, or [pink noise](/sounds/pink-noise) for a balanced, neutral sound.",
        ],
      },
    ],
    faq: [
      { q: "Is it safe to sleep with noise all night?", a: "At a low volume it is generally considered fine for adults. Keep it quiet, and keep speakers away from babies’ cots." },
      { q: "What is the best sound for sleep?", a: "Something steady, low and without sudden peaks: brown or pink noise, soft rain or a train hum. The best one is the one you stop noticing." },
      { q: "Will it keep playing with the screen off?", a: "Yes. Playback continues in the background and with the screen locked." },
    ],
    related: ["/sounds/brown-noise", "/mix/sleeper-car", "/sounds/light-rain", "/sounds/pink-noise", "/sounds/airplane-cabin", "/sounds-for"],
  },
  {
    type: "activity",
    slug: "relaxing",
    wave: 2,
    title: "Relaxing sounds: calming ambience to unwind",
    description: "Free relaxing sounds in your browser: ocean waves, wind and soft rain to unwind after work. Mix your own calm soundscape. No ads, works offline.",
    heading: "Sounds for relaxing",
    intro: "Ocean waves, soft wind and a distant shore. Tap play and breathe out.",
    intent: { label: "Relaxing mix", layers: { waves: 0.55, wind: 0.2, "pink-noise": 0.12 } },
    copy: [
      {
        heading: "Sound for winding down",
        body: [
          "Relaxing is a skill, and the right sound makes it easier. Slow, broad, rhythmic sounds such as waves and wind give your attention something gentle to rest on, and their slow swells can encourage slower breathing. Steady masking also shuts out the small noises that keep a busy mind busy.",
          "This mix pairs [ocean waves](/sounds/ocean-waves) with soft [wind](/sounds/wind) and a whisper of [pink noise](/sounds/pink-noise) to fill the gaps between waves.",
          "Calm sound is also a useful bridge between work and rest. Many people find it hard to switch off straight after a demanding session; a few minutes of waves or wind gives the mind a gentle place to land before the evening begins. Try it as a deliberate end-of-day ritual for a week and notice whether the evenings feel calmer.",
        ],
      },
      {
        heading: "Ways to unwind",
        body: [
          {
            list: [
              "**Breathe with the waves.** Inhale as a wave rolls in, exhale as it draws back.",
              "**Take a proper break.** A [5 minute timer](/timer/5-minutes) with your eyes closed is a real reset between work sessions.",
              "**Mark the end of the day.** Play the same calm sound when you stop work, so it becomes a signal to switch off.",
              "**Move away from screens.** Put the phone face down and just listen.",
            ],
          },
        ],
      },
      {
        heading: "Other calming sounds",
        body: [
          "Each of these has a different mood, so it is worth trying a few. Try the [night camp](/mix/night-camp) mix for a warm evening, [rain and fireplace](/mix/rain-and-fireplace) for the coziest room, a [cat purring](/sounds/cat-purring) for company, or [whale song](/sounds/whale-song) for something slow and otherworldly.",
        ],
      },
    ],
    faq: [
      { q: "What are the most relaxing sounds?", a: "Slow, steady natural sounds such as waves, rain, wind and a fire are popular, but the best one is whatever you find calming." },
      { q: "Can sounds reduce stress?", a: "Many people find calm sounds help them unwind, and some studies link nature sounds with lower stress, though effects vary. They are a helpful tool, not a treatment." },
      { q: "How long should I listen?", a: "Even five minutes with your eyes closed can help you reset. For winding down at night, longer sessions are fine." },
    ],
    related: ["/sounds/ocean-waves", "/mix/coastline", "/mix/rain-and-fireplace", "/timer/5-minutes", "/sounds-for"],
  },
  {
    type: "activity",
    slug: "meditation",
    wave: 2,
    title: "Meditation sounds: calm ambience for meditating",
    description: "Free meditation sounds in your browser: a singing bowl, a temple and soft water to anchor your attention, with a meditation timer. No ads, works offline.",
    heading: "Sounds for meditation",
    intro: "A temple's calm, a slow singing bowl and dripping water. Tap play and settle.",
    intent: { label: "Meditation mix", layers: { temple: 0.45, "singing-bowl": 0.35, droplets: 0.2 } },
    copy: [
      {
        heading: "Sound as an anchor",
        body: [
          "Many meditation practices use an anchor, something to return your attention to when it wanders. The breath is the classic anchor; sound is another. Slow, sparse sounds such as a [singing bowl](/sounds/singing-bowl) fading out or [drops of water](/sounds/water-droplets) falling into a pool give you something gentle to follow, and each time you notice your mind has drifted, you return to the sound.",
          "This mix sets those sounds in the calm, echoing space of a [temple](/sounds/temple).",
          "Sound meditation suits people who find focusing on the breath difficult, because a sound outside you can be easier to notice and return to. It is also a good way to take a short, deliberate break during the working day: a few minutes of listening resets attention more effectively than scrolling.",
        ],
      },
      {
        heading: "A simple sound meditation",
        body: [
          {
            list: [
              "**Set a timer** for [10 minutes](/timer/10-minutes) and sit comfortably.",
              "**Close your eyes** and listen to the whole space first, then pick one sound to follow.",
              "**When your mind wanders**, notice it without judgement and return to the sound.",
              "**At the chime**, take a moment before opening your eyes.",
            ],
          },
          "If you are new to meditation, start with five minutes and build up. A short, regular practice is more useful than an occasional long one, and the same sound each time helps you settle faster.",
        ],
      },
      {
        heading: "Other sounds for meditation",
        body: [
          "Some people prefer a continuous anchor: [ocean waves](/sounds/ocean-waves) for breathing, a [river](/sounds/river) for flow, or [brown noise](/sounds/brown-noise) to simply quiet the room. [Wind chimes](/sounds/wind-chimes) add gentle, random tones to follow.",
        ],
      },
    ],
    faq: [
      { q: "Do I need sound to meditate?", a: "No. Silence works well too; sound can help as an anchor or to mask a noisy room." },
      { q: "How long should I meditate?", a: "Start with five or ten minutes. Consistency matters more than length." },
      { q: "Can I use headphones?", a: "Yes. Headphones help in noisy places and make the sound feel closer." },
    ],
    related: ["/sounds/singing-bowl", "/sounds/temple", "/timer/10-minutes", "/sounds/ocean-waves", "/sounds-for"],
  },
];
