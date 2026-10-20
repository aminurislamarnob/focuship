import type { Faq, Hub, LandingPage, Section } from "@/lib/pages";

/** Timer and Pomodoro landing pages. Each opens on the Timer tab with its lengths set. */

const SHARED_FAQ: Faq[] = [
  {
    q: "Will the timer keep time if I switch tabs or lock my phone?",
    a: "Yes. The timer counts against the real clock rather than ticking in the background, so it stays accurate when the tab is hidden or the screen is off. Turn on notifications in the timer settings to be told when a session ends.",
  },
  {
    q: "Does the timer work offline?",
    a: "Yes. Once Focuship has loaded, or is installed to your home screen, the timer, the chime and the generated noises all work without a connection.",
  },
];

const howToUse = (length: string): Section => ({
  heading: "How to use it",
  body: [
    {
      list: [
        `Press **Start**. The ${length} countdown runs in the ring, and a soft chime marks the end.`,
        "Add sound from the Mix or Sounds tab. A steady background such as rain or [brown noise](/sounds/brown-noise) makes it easier to stay in the session.",
        "Open focus mode (the expand button, or press V) for a large, distraction-free countdown that keeps the screen awake.",
        "Change any length in the timer settings; the next session uses it.",
      ],
    },
  ],
});

interface TimerSpec {
  minutes: number;
  slug: string;
  /** "25-minute", "1-hour". */
  length: string;
  title: string;
  description: string;
  intro: string;
  about: string[];
  ideas: string[];
  /** A page-specific paragraph on making a session of this length work. */
  more: string;
  pairing: string;
  faq: Faq[];
  related: string[];
}

const timerPage = (spec: TimerSpec): LandingPage => ({
  type: "timer",
  slug: spec.slug,
  wave: 1,
  title: spec.title,
  description: spec.description,
  heading: `${spec.length[0].toUpperCase()}${spec.length.slice(1)} timer`,
  intro: spec.intro,
  intent: { label: `${spec.length[0].toUpperCase()}${spec.length.slice(1)} timer`, tab: "timer", timer: { focus: spec.minutes } },
  copy: [
    { heading: `What a ${spec.length} block is good for`, body: [...spec.about, { list: spec.ideas }] },
    { heading: `Making a ${spec.length} session work`, body: [spec.more] },
    howToUse(spec.length),
    { heading: "Sound to pair with it", body: [spec.pairing] },
  ],
  faq: [...spec.faq, ...SHARED_FAQ],
  related: spec.related,
});

interface PomodoroSpec {
  work: number;
  rest: number;
  long: number;
  hero?: boolean;
  heading: string;
  title: string;
  description: string;
  intro: string;
  copy: Section[];
  faq: Faq[];
  related: string[];
}

const pomodoroPage = (spec: PomodoroSpec): LandingPage => ({
  type: "pomodoro",
  slug: `${spec.work}-${spec.rest}`,
  wave: 1,
  hero: spec.hero,
  title: spec.title,
  description: spec.description,
  heading: spec.heading,
  intro: spec.intro,
  intent: { label: `${spec.work}/${spec.rest} Pomodoro`, tab: "timer", timer: { focus: spec.work, short: spec.rest, long: spec.long } },
  copy: [...spec.copy, howToUse(`${spec.work}-minute`)],
  faq: [...spec.faq, ...SHARED_FAQ],
  related: spec.related,
});

export const TIMER_PAGES: LandingPage[] = [
  pomodoroPage({
    work: 25,
    rest: 5,
    long: 15,
    hero: true,
    heading: "Pomodoro timer",
    title: "Pomodoro timer: 25/5 with ambient sound",
    description:
      "A free Pomodoro timer: 25 minutes of focus, 5-minute breaks and a longer break after four rounds. Add rain, café or brown noise and work offline. No sign-up.",
    intro: "25 minutes of focus, 5 minutes of rest. Press start.",
    copy: [
      {
        heading: "How the Pomodoro Technique works",
        body: [
          "The Pomodoro Technique, created by Francesco Cirillo in the late 1980s and named after his tomato-shaped kitchen timer, breaks work into short, timed rounds. You pick one task, work on it for 25 minutes without switching, then take a 5-minute break. After four rounds you take a longer break of 15 to 30 minutes.",
          "The fixed length does two jobs. It makes starting easier, because 25 minutes is a small commitment, and it turns breaks into something you earn rather than drift into. Counting rounds also gives you an honest picture of how much focused time a task really takes.",
          "Cirillo also recommends planning your rounds at the start of the day and reviewing them at the end: how many rounds you estimated a task would take, and how many it really took. That simple loop, more than the timer itself, is what makes people better at planning their work.",
        ],
      },
      {
        heading: "Getting more out of each round",
        body: [
          {
            list: [
              "Decide the task before you press start, and write down distractions instead of acting on them.",
              "Take the break away from the screen: stand up, drink water, look out of a window.",
              "If 25 minutes feels too short for deep work, try the [50/10 split](/pomodoro/50-10) or the [52/17 split](/pomodoro/52-17).",
              "Focuship counts completed rounds for the day and moves to the long break automatically after the fourth.",
            ],
          },
        ],
      },
    ],
    faq: [
      {
        q: "Why 25 minutes?",
        a: "It is long enough to make real progress and short enough that starting doesn’t feel daunting. It isn’t magic: many people settle on longer rounds once the habit is established.",
      },
      {
        q: "What should I do during the 5-minute break?",
        a: "Something that rests your attention: stand up, stretch, refill your drink or look into the distance. Checking messages tends to pull you into another task.",
      },
    ],
    related: ["/timer", "/timer/25-minutes", "/pomodoro/50-10", "/pomodoro/52-17", "/sounds/brown-noise"],
  }),
  pomodoroPage({
    work: 50,
    rest: 10,
    long: 30,
    heading: "50/10 Pomodoro timer",
    title: "50/10 Pomodoro timer for longer focus sessions",
    description:
      "A free 50/10 timer: 50 minutes of focus and 10 minutes of rest, for work that needs longer stretches than a classic Pomodoro. Add ambient sound and work offline.",
    intro: "50 minutes on, 10 minutes off. Press start.",
    copy: [
      {
        heading: "Why stretch the Pomodoro to 50 minutes",
        body: [
          "The classic 25-minute round suits admin and study, but writing, programming and design often need longer to load the problem into your head. A 50/10 split keeps the rhythm of the Pomodoro Technique while giving each session twice the depth, with fewer restarts per hour.",
          "It also lines up neatly with the clock: one round per hour, so it is easy to plan a morning as three or four sessions.",
          "Because each round is longer, the break matters more. Ten minutes is enough to walk, refill a drink and let your eyes rest on something far away, which helps the second half of the day feel less draining than back-to-back screen time. If you work with others, a 50/10 rhythm also gives teammates a predictable window, ten minutes before each hour, when you are reachable.",
        ],
      },
      {
        heading: "Who it suits",
        body: [
          {
            list: [
              "Developers and writers who lose momentum when a round ends mid-thought.",
              "Anyone who already finds 25 minutes easy and wants more depth.",
              "People working in quiet, uninterrupted blocks, such as early mornings.",
            ],
          },
          "If you find your attention fading well before the 50 minutes are up, step back to the [classic 25/5 timer](/pomodoro/25-5) for a while.",
        ],
      },
    ],
    faq: [
      {
        q: "Is a 10-minute break too long?",
        a: "For a 50-minute session it keeps the same work-to-rest ratio as the classic Pomodoro (five to one). Use the time to move and rest your eyes.",
      },
      {
        q: "Should I still take a long break?",
        a: "Yes. After three or four rounds take 20 to 30 minutes. Focuship sets a 30-minute long break on this page.",
      },
    ],
    related: ["/timer", "/pomodoro/25-5", "/pomodoro/90-20", "/timer/1-hour"],
  }),
  pomodoroPage({
    work: 52,
    rest: 17,
    long: 30,
    heading: "52/17 timer",
    title: "52/17 timer: the work rhythm of top performers",
    description:
      "A free 52/17 focus timer: 52 minutes of work, 17 minutes of rest, based on a widely quoted analysis of how the most productive people take breaks. Add ambient sound.",
    intro: "52 minutes of work, 17 minutes of real rest. Press start.",
    copy: [
      {
        heading: "Where 52/17 comes from",
        body: [
          "In 2014 the time-tracking company DeskTime looked at how its most productive users actually worked. On average they worked for about 52 minutes and then took a break of about 17 minutes, fully away from the task, rather than working for long unbroken stretches.",
          "It is one company’s observational data, not a controlled experiment, so treat the exact numbers loosely. The useful idea is that generous, genuine breaks can sit alongside long focused sessions.",
          "The rhythm works best for people who can control their own schedule. With roughly an hour and ten minutes per cycle, three cycles fill a long morning, and the long breaks leave room for the small jobs, such as messages, errands and conversations, that would otherwise interrupt your focused time.",
        ],
      },
      {
        heading: "Making the long break count",
        body: [
          {
            list: [
              "Leave your desk for the 17 minutes. A walk, a snack or a conversation counts; scrolling doesn’t really.",
              "Use the 52 minutes for a single task, with notifications silenced.",
              "Pair it with a steady soundscape so returning to work feels like returning to a place.",
            ],
          },
        ],
      },
    ],
    faq: [
      {
        q: "Is 52/17 better than the Pomodoro Technique?",
        a: "Neither is proven better. 52/17 suits people who like longer sessions and longer breaks; the [25/5 Pomodoro](/pomodoro/25-5) suits people who find starting hard. Try both for a week.",
      },
      {
        q: "Can I adjust the lengths?",
        a: "Yes. Change focus and break lengths in the timer settings at any time.",
      },
    ],
    related: ["/timer", "/pomodoro/25-5", "/pomodoro/50-10", "/timer/45-minutes"],
  }),
  pomodoroPage({
    work: 90,
    rest: 20,
    long: 30,
    heading: "90/20 deep work timer",
    title: "90-minute deep work timer with 20-minute breaks",
    description:
      "A free 90/20 timer for deep work: 90-minute focus blocks and 20-minute breaks. Pair it with brown noise, rain or a café and keep working offline.",
    intro: "One long, deep block, then a proper rest. Press start.",
    copy: [
      {
        heading: "Why 90 minutes",
        body: [
          "Sleep researcher Nathaniel Kleitman proposed that the body runs on roughly 90-minute cycles during the day as well as at night. The idea has been popularised as a way to plan work: one deep block that lasts about an hour and a half, followed by real recovery.",
          "The science behind daytime cycles is less settled than the advice suggests, but the format works well in practice for tasks that take a long time to get into, such as writing, research or complex code.",
          "The long break is not optional. Twenty minutes away from the task lets you return with fresh eyes, and it is often during the break, while walking or making tea, that a stuck problem quietly resolves itself. If you only manage one 90-minute block a day, put it where your energy is highest and protect it like a meeting.",
        ],
      },
      {
        heading: "Planning a day around 90-minute blocks",
        body: [
          {
            list: [
              "Two or three blocks a day is a realistic ceiling for most people.",
              "Put the hardest task in the first block, before messages and meetings start.",
              "Spend the 20-minute break moving or resting, away from screens if you can.",
            ],
          },
        ],
      },
    ],
    faq: [
      {
        q: "Is 90 minutes too long to concentrate?",
        a: "It can be at first. Build up from [50-minute sessions](/pomodoro/50-10), and allow yourself a short pause inside the block if you need it.",
      },
      {
        q: "What sound helps with long sessions?",
        a: "Steady, low-detail sound is easiest to listen to for a long time: [brown noise](/sounds/brown-noise), steady rain or a distant café.",
      },
    ],
    related: ["/timer", "/pomodoro/50-10", "/timer/90-minutes", "/sounds/brown-noise"],
  }),

  timerPage({
    minutes: 5,
    slug: "5-minutes",
    length: "5-minute",
    title: "5 minute timer with a gentle chime",
    description: "A free 5 minute timer with a soft chime and optional ambient sound. Use it for breaks, quick tasks or a short reset. Works offline, no ads.",
    intro: "Five minutes, a soft chime at the end. Press start.",
    about: [
      "Five minutes is the length of a Pomodoro break and a good unit for anything you keep putting off. Committing to just five minutes lowers the barrier to starting, and you will often keep going once the timer ends.",
    ],
    ideas: [
      "A screen break: stand, stretch and rest your eyes.",
      "A two-minute rule task that grew a little: answer one email, clear one pile.",
      "A short breathing exercise or meditation.",
      "Planning the next focus session before you begin it.",
    ],
    more: "Short timers work best with a clear finish line. Decide what “done” looks like before you press start, whether that is an empty sink, a sent reply or three slow breaths, and stop when the chime sounds even if you could keep going. That habit makes the next five-minute promise to yourself believable, which is the whole trick. If you are using it as a break, step away from the screen; a break spent on another screen rarely feels like rest.",
    pairing:
      "For a break, choose something restful and open such as ocean waves or birdsong. For a quick task, keep the same background you work with so the switch back is seamless.",
    faq: [
      { q: "Why use a timer for only five minutes?", a: "It keeps short breaks short and makes reluctant tasks feel small enough to start." },
    ],
    related: ["/timer", "/timer/10-minutes", "/pomodoro/25-5"],
  }),
  timerPage({
    minutes: 10,
    slug: "10-minutes",
    length: "10-minute",
    title: "10 minute timer with ambient sound",
    description: "A free 10 minute timer with a soft chime and optional rain, café or noise. Good for quick tasks, longer breaks and short study sprints. Works offline.",
    intro: "Ten minutes on the clock. Press start.",
    about: [
      "Ten minutes is enough to finish a small, defined task or to take a break that really resets you. It is also the break length in a [50/10 Pomodoro](/pomodoro/50-10).",
    ],
    ideas: [
      "A tidy-up sprint: desk, inbox or downloads folder.",
      "Reviewing notes or flashcards before a session.",
      "A walk around the block between focus blocks.",
      "Warming up on a hard task before committing to a longer session.",
    ],
    more: "Ten minutes is long enough that you can lose track of it, which is exactly why a timer helps. Use it to protect a break from turning into twenty, or to put a fence around a chore so it doesn’t swallow the afternoon. Many people use a ten-minute sprint to break the ice on a task they are dreading: once the hardest first minutes are behind you, carrying on is much easier. Write down where you stopped so the next session starts quickly.",
    pairing: "A light, familiar mix works best for short sprints: [brown noise](/sounds/brown-noise) under soft rain, or a quiet café. Short sessions don’t need much: one layer at a low volume is plenty, and it gives your brain a clear signal that the sprint has started and when it has ended.",
    faq: [{ q: "Can I run several 10-minute timers in a row?", a: "Yes. Turn on auto-start in the timer settings to roll from one session into a break and back." }],
    related: ["/timer", "/timer/5-minutes", "/timer/15-minutes"],
  }),
  timerPage({
    minutes: 15,
    slug: "15-minutes",
    length: "15-minute",
    title: "15 minute timer for study sprints and breaks",
    description: "A free 15 minute timer with an optional ambient soundscape. Use it for study sprints, long breaks or a quick power-down. Works offline, no sign-up.",
    intro: "A quarter of an hour. Press start.",
    about: [
      "Fifteen minutes is the classic long break in the Pomodoro Technique and a comfortable sprint for revision or reading. It is short enough to stay sharp from start to finish.",
    ],
    ideas: [
      "The long break after four Pomodoro rounds.",
      "A focused reading or revision sprint.",
      "A short rest with your eyes closed.",
      "Timeboxing a task that tends to expand, such as email.",
    ],
    more: "Fifteen minutes is a good length for active recall: close your notes and write down everything you remember, then check what you missed. It is also a sensible cap for checking email or messages, which tend to expand to fill whatever time they are given. If you are taking a long break between Pomodoro rounds, use the full fifteen minutes; skipping long breaks is one of the quickest ways to run out of focus by mid-afternoon.",
    pairing: "For study, try a library or reading-room mix; for rest, slow ocean waves or rain on a window. Keep the volume low enough that you would notice someone speaking to you. For a long break between rounds, switching to a different, calmer sound helps mark the change from work to rest.",
    faq: [{ q: "Is 15 minutes long enough to study?", a: "For review and recall practice, yes. Several short sprints with breaks often beat one long, tired session." }],
    related: ["/timer", "/timer/10-minutes", "/timer/20-minutes", "/pomodoro/25-5"],
  }),
  timerPage({
    minutes: 20,
    slug: "20-minutes",
    length: "20-minute",
    title: "20 minute timer with rain, café or noise",
    description: "A free 20 minute timer with a soft chime and optional ambient sound, for short naps, workouts or focused tasks. Works offline, no ads, no sign-up.",
    intro: "Twenty minutes, then a soft chime. Press start.",
    about: [
      "Twenty minutes is a popular length for a short nap that leaves you refreshed rather than groggy, and a good block for a task you can finish in one sitting.",
    ],
    ideas: [
      "A short afternoon nap.",
      "A home workout or stretching routine.",
      "Writing a first draft of a short message or plan.",
      "A focus session when 25 minutes feels like too much.",
    ],
    more: "Twenty minutes is long enough to get properly into a small task, but short enough to fit almost anywhere in a day: before a meeting, after lunch, or while something cooks. If you are napping, set the timer before you lie down and keep the sound low and constant so it fades into the background. For focused work, a twenty-minute session is a gentle way to rebuild the habit after a break, before moving up to a full Pomodoro.",
    pairing: "For a nap, choose low, steady sound such as [brown noise](/sounds/brown-noise) or heavy rain; for a task, a café or keyboard mix. If you nap, try the same sound every time; over a few days it becomes a cue that helps you drift off faster, and the chime at the end is gentle enough not to jolt you awake.",
    faq: [{ q: "Why are short naps around 20 minutes?", a: "Short naps tend to end before deep sleep, so waking is easier. Set the timer and lie down straight away." }],
    related: ["/timer", "/timer/15-minutes", "/timer/25-minutes"],
  }),
  timerPage({
    minutes: 25,
    slug: "25-minutes",
    length: "25-minute",
    title: "25 minute timer with ambient sound",
    description: "A free 25 minute timer: one Pomodoro of focus with a soft chime at the end, plus optional rain, café or brown noise. Works offline, no sign-up.",
    intro: "One Pomodoro. Press start and work until the chime.",
    about: [
      "Twenty-five minutes is the length of one round in the Pomodoro Technique: long enough to make real progress, short enough that starting feels easy. This page sets a single 25-minute countdown; the [Pomodoro timer](/pomodoro/25-5) adds the breaks and rounds.",
    ],
    ideas: [
      "One focused round on a single task.",
      "A study session followed by a five-minute review.",
      "A timeboxed attempt at a problem you’ve been avoiding.",
      "A daily writing habit.",
    ],
    more: "The value of a 25-minute session comes from protecting it. Silence notifications, close unrelated tabs and keep a scrap of paper next to you for anything that pops into your head. When the chime sounds, stop and take a short break, even if you are mid-flow: ending on a high note makes it easier to start the next round. Over a day, counting how many 25-minute sessions a task took is a surprisingly honest measure of your work.",
    pairing: "The Deep work preset, [brown noise](/sounds/brown-noise) with a slow alpha tone, was made for exactly this. Keep the same mix for every round in a day so the sound becomes part of the ritual of starting, and switch it off during breaks so the contrast tells you it is time to rest.",
    faq: [{ q: "What is the difference between this and the Pomodoro timer?", a: "Nothing in length. The Pomodoro page also sets 5-minute breaks and a long break after four rounds." }],
    related: ["/timer", "/pomodoro/25-5", "/timer/30-minutes", "/sounds/brown-noise"],
  }),
  timerPage({
    minutes: 30,
    slug: "30-minutes",
    length: "30-minute",
    title: "30 minute timer for focus, reading and workouts",
    description: "A free 30 minute timer with optional ambient sound and a soft chime. Use it for focused work, reading, workouts or cooking. Works offline, no sign-up.",
    intro: "Half an hour. Press start.",
    about: [
      "Half an hour is a natural unit for planning: two per hour, easy to fit between meetings. It suits reading, practice and any task that needs a little warm-up before it flows.",
    ],
    ideas: ["A reading session.", "Instrument or language practice.", "A workout or run.", "A focused block between meetings."],
    more: "Thirty minutes is a comfortable middle ground between a quick sprint and a deep work block. It suits anything that needs a short warm-up: you spend the first few minutes settling in, then have a solid twenty-five minutes of real progress. For practice, such as an instrument or a language, a daily thirty-minute session is a classic, sustainable target. Pair it with the same sound each day and the sound itself becomes a cue that it is time to practise.",
    pairing: "For reading, a quiet library with turning pages; for practice, a neutral bed of pink or brown noise. Avoid music with lyrics while you read or practise a language: words compete with the words you are trying to process, while steady ambience stays in the background where it belongs.",
    faq: [{ q: "Can I pause the timer?", a: "Yes. Pause and resume at any time; the remaining time is kept even if you reload the page." }],
    related: ["/timer", "/timer/25-minutes", "/timer/45-minutes"],
  }),
  timerPage({
    minutes: 45,
    slug: "45-minutes",
    length: "45-minute",
    title: "45 minute timer for deep work and study",
    description: "A free 45 minute timer with ambient sound, the length of a class period or a solid deep work block. Soft chime, works offline, no ads.",
    intro: "A class period's worth of focus. Press start.",
    about: [
      "Forty-five minutes is the length of a typical school or university class, which makes it a familiar unit for study. It is also a solid block for deep work that still leaves room for a break each hour.",
    ],
    ideas: ["A study block that mirrors a class period.", "A deep work session followed by a 15-minute break.", "Practice exams under time pressure.", "A long focused read."],
    more: "A forty-five-minute block gives you the warm-up of a longer session without the fatigue of a full hour. Students revising for exams often use it because it matches the rhythm of a lesson, which makes study sessions feel familiar and easy to plan. For deep work, decide on one outcome for the block, such as a section drafted or a bug fixed, and use the last five minutes to note where to pick up next time.",
    pairing: "Rain on a window with quiet keyboard sounds (the Rainy desk preset) suits long desk sessions. Over forty-five minutes, a mix with a little variety, such as rain with an occasional rumble of thunder, can keep the soundscape from fading into silence without ever demanding your attention.",
    faq: [{ q: "What break should follow 45 minutes?", a: "Around 10 to 15 minutes works well, which fits an hour neatly." }],
    related: ["/timer", "/timer/30-minutes", "/timer/1-hour", "/pomodoro/52-17"],
  }),
  timerPage({
    minutes: 60,
    slug: "1-hour",
    length: "1-hour",
    title: "1 hour timer with ambient sound",
    description: "A free 1 hour timer with an optional ambient soundscape and a soft chime at the end. For deep work, study and long tasks. Works offline, no sign-up.",
    intro: "Sixty minutes on the clock. Press start.",
    about: [
      "An hour is a big enough block to make serious progress on a hard task, and easy to plan around. Pair it with a short break so the next hour starts fresh.",
    ],
    ideas: ["A deep work block on one problem.", "A study session with a self-test at the end.", "Timeboxing a meeting or call.", "Cooking, baking or a long workout."],
    more: "An hour-long session rewards a little preparation. Gather what you need before you start, put your phone in another room and tell people you are unavailable until the chime. If an hour feels long, split the work into a clear sequence of smaller steps so you always know what to do next. Afterwards, take a real break of ten minutes or more; stacking hour-long sessions without rest tends to produce long, unproductive afternoons.",
    pairing: "For an hour of focus, keep the sound low and steady: [brown noise](/sounds/brown-noise), a distant café or steady rain. A mix of two or three quiet layers lasts better over an hour than a single sound. Set the volume once at the start, then leave the controls alone until the chime.",
    faq: [{ q: "Is one hour too long to focus?", a: "Many people manage it once the habit is built. If not, split it into a [50/10 Pomodoro](/pomodoro/50-10)." }],
    related: ["/timer", "/timer/45-minutes", "/timer/90-minutes", "/pomodoro/50-10"],
  }),
  timerPage({
    minutes: 90,
    slug: "90-minutes",
    length: "90-minute",
    title: "90 minute timer for deep work",
    description: "A free 90 minute timer for long deep work sessions, with optional brown noise, rain or café sound and a soft chime at the end. Works offline.",
    intro: "An hour and a half of deep work. Press start.",
    about: [
      "Ninety minutes is a popular size for a single deep work block, loosely based on the idea of 90-minute daily rhythms. It suits writing, research and complex code: work that takes time to load into your head.",
    ],
    ideas: ["One deep work block first thing in the morning.", "Long-form writing.", "A full practice exam.", "A movie-length creative session."],
    more: "A ninety-minute session is a big investment, so schedule it rather than hoping for it. Many people protect one such block each morning for their most important work and keep meetings and messages for later in the day. Have water to hand, decide the single outcome you are aiming for, and allow yourself to stand and stretch without leaving the task. When the chime sounds, take a proper break of fifteen to twenty minutes before anything else demanding.",
    pairing: "Low, unobtrusive sound wears best over 90 minutes: [brown noise](/sounds/brown-noise), steady rain or a submarine hum. Set the volume a little lower than feels necessary at the start; over a long session your ears adjust, and a quiet bed of sound is easier to forget about than a loud one.",
    faq: [{ q: "Should I take a break inside 90 minutes?", a: "If your focus fades, a short pause is better than pushing through. The [90/20 timer](/pomodoro/90-20) adds a 20-minute break after each block." }],
    related: ["/timer", "/timer/1-hour", "/timer/2-hours", "/pomodoro/90-20"],
  }),
  timerPage({
    minutes: 120,
    slug: "2-hours",
    length: "2-hour",
    title: "2 hour timer with ambient sound",
    description: "A free 2 hour timer with a soft chime and optional ambient sound, for exams, long study sessions and marathon tasks. Works offline, no sign-up.",
    intro: "Two hours on the clock. Press start.",
    about: [
      "Two hours is the length of many exams and a good container for a long, single-minded push. Most people will want a short pause inside it; the timer simply keeps the overall shape.",
    ],
    ideas: ["A full-length practice exam.", "A long writing or editing session.", "A focused cleaning or packing marathon.", "A board-game or study-group time limit."],
    more: "Two-hour sessions are best kept for work that genuinely needs them, such as a timed practice exam or a long editing pass. Treat the timer as the outer boundary and take small pauses inside it: stand up, look away from the screen and drink water every half hour or so. Running a full exam to the real time limit, with the timer visible in focus mode, is one of the best ways to prepare for the pressure of the real thing.",
    pairing: "Choose something you can forget about: a quiet library, distant rain or pink noise at a low volume. For a practice exam, consider no sound at all if the real exam room will be silent, so that your rehearsal matches the conditions you will face on the day.",
    faq: [{ q: "Can the timer go longer than two hours?", a: "Focus sessions go up to 120 minutes. For longer stretches, run several sessions with auto-start." }],
    related: ["/timer", "/timer/90-minutes", "/pomodoro/90-20"],
  }),
];

/** The /timer hub is itself the "focus timer" hero page. */
export const TIMER_HUB: Omit<Hub, "id" | "path" | "label"> = {
  title: "Focus timer: free online timer with ambient sound",
  heading: "Focus timer",
  description:
    "A free online focus timer with ambient sound: Pomodoro rounds, custom lengths from 5 minutes to 2 hours, focus mode and a soft chime. No sign-up, works offline.",
  intro: "Set a length, press start, and let the sound hold the session.",
  intent: { label: "Focus timer", tab: "timer" },
  copy: [
    {
      heading: "A timer built for focus",
      body: [
        "Most timers just count down. Focuship’s focus timer runs alongside an ambient sound mixer, so the same tap that starts your session can start rain, a café or brown noise. When the session ends a soft chime plays, the break starts, and after four rounds you get a longer rest.",
        "Focus mode turns the screen into a large countdown that keeps your display awake, which makes a laptop or phone propped on the desk a good visual reminder that you are in a session.",
      ],
    },
    {
      heading: "Choose a length",
      body: [
        "Short rounds make starting easier; long rounds suit work that takes time to get into. Start with the [Pomodoro timer](/pomodoro/25-5) if you are unsure, then try longer splits such as [50/10](/pomodoro/50-10) or [90/20](/pomodoro/90-20) once the habit sticks.",
      ],
    },
  ],
  faq: [
    { q: "Is the focus timer free?", a: "Yes. No account, no ads and no tracking cookies." },
    {
      q: "Can I use the timer without sound?",
      a: "Yes. The timer works on its own; sound is optional and you can mute it at any time.",
    },
    ...SHARED_FAQ,
  ],
};
