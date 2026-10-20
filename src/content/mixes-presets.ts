import type { Faq, LandingPage } from "@/lib/pages";
import type { Layers } from "@/lib/catalog";

interface MixSpec {
  slug: string;
  wave: number;
  layers: Layers;
  heading: string;
  title: string;
  description: string;
  intro: string;
  about: string[];
  inside: string[];
  goodFor: string[];
  tips: string[];
  /** When in the day or week this mix fits best. */
  when: string[];
  faq: Faq[];
  related: string[];
}

const mixPage = (spec: MixSpec): LandingPage => ({
  type: "mix",
  slug: spec.slug,
  wave: spec.wave,
  title: spec.title,
  description: spec.description,
  heading: spec.heading,
  intro: spec.intro,
  intent: { label: spec.heading, layers: spec.layers },
  copy: [
    { heading: "About this mix", body: spec.about },
    { heading: "What’s in it", body: [{ list: spec.inside }] },
    { heading: "Good for", body: [{ list: spec.goodFor }] },
    { heading: "When to use it", body: spec.when },
    { heading: "Making it yours", body: spec.tips },
  ],
  faq: [
    ...spec.faq,
    {
      q: "Can I change the mix?",
      a: "Yes. Every layer has its own slider; add or remove sounds from the Sounds tab and share your version as a link.",
    },
  ],
  related: spec.related,
});

/** Later-wave mix pages: the presets, plus popular pairs. */
export const PRESET_MIX_PAGES: LandingPage[] = [
  mixPage({
    slug: "deep-work",
    wave: 2,
    layers: { "brown-noise": 0.55, alpha: 0.4 },
    heading: "Deep work mix",
    title: "Deep work mix: brown noise and an alpha beat",
    description: "A deep work soundscape: brown noise with a slow 10 Hz alpha binaural beat, generated on your device. Free, endless and offline. Headphones recommended.",
    intro: "Brown noise with a slow alpha pulse underneath. Tap play.",
    about: [
      "The Deep work mix is Focuship’s default for a reason. A bed of [brown noise](/sounds/brown-noise) masks the room with a deep, soft rumble, and a quiet 10 Hz alpha [binaural beat](/sounds/binaural-beats) pulses gently underneath. There are no recordings, no voices and nothing to follow, which is exactly what demanding work needs.",
      "Both layers are generated live in your browser, so the mix never repeats, never needs to load and keeps working offline. It is the closest thing to a neutral, distraction-free room that you can carry with you.",
    ],
    inside: ["**Brown noise** at a moderate level for masking.", "**Alpha 10 Hz** binaural beat, lower, for a calm, steady pulse (best with headphones)."],
    goodFor: ["Programming, writing and analysis.", "Long sessions where anything with detail would distract.", "Noisy homes and offices.", "Exam revision."],
    tips: [
      "Use headphones to get the binaural effect; on speakers the alpha layer becomes a soft hum, which still works fine. Start the mix together with a [50/10 Pomodoro](/pomodoro/50-10) or a [90/20 block](/pomodoro/90-20), and keep the volume lower than you think you need.",
      "If brown noise feels too heavy, swap in pink noise; if the beat is noticeable, lower it or try beta at 16 Hz instead. The research on binaural beats is mixed, so judge it by how your sessions feel.",
    ],
    when: [
      "Deep work is a morning mix for most people: put your hardest, most important task first, before messages and meetings arrive, and use this mix to mark the start of it. Because nothing in it changes, it is also the mix to reach for when you are tired or distracted and need the least stimulating background possible.",
      "It works just as well late at night for focused sessions, when the house is quiet but small noises feel loud. Many developers keep it as their default and switch to something livelier only for meetings-free afternoons or routine tasks.",
    ],
    faq: [{ q: "Why brown noise rather than white noise?", a: "Brown noise is softer and deeper, so most people can listen to it for hours without fatigue. White noise masks voices a little better but can feel harsh." }, { q: "Do I need headphones for this mix?", a: "For the binaural beat, yes. Without headphones the brown noise still works and the beat becomes a gentle tone." }],
    related: ["/sounds/brown-noise", "/sounds/binaural-beats", "/sounds-for/coding", "/pomodoro/50-10", "/mix"],
  }),
  mixPage({
    slug: "rainy-desk",
    wave: 2,
    layers: { "rain-on-window": 0.6, keyboard: 0.25, "pink-noise": 0.2 },
    heading: "Rainy desk mix",
    title: "Rainy desk: rain on the window and quiet typing",
    description: "A cosy desk soundscape: rain on the window, quiet keyboard typing and soft pink noise. Free in your browser, perfect for writing and study.",
    intro: "Rain on the window, quiet keys and a soft hush. Tap play.",
    about: [
      "Rainy desk recreates one of the best places to work: a desk by a window on a grey afternoon. Rain taps on the glass, someone types quietly nearby, and a soft layer of [pink noise](/sounds/pink-noise) fills the gaps so nothing else gets in.",
      "The typing is the secret ingredient. It suggests a productive room without demanding attention, a little like working alongside a colleague.",
    ],
    inside: ["**Rain on a window** as the main layer.", "**Keyboard typing**, quiet, for a working atmosphere.", "**Pink noise**, low, to smooth everything out."],
    goodFor: ["Writing and journaling.", "Studying on a grey day.", "Working from home alone.", "Email and admin sessions."],
    tips: [
      "If you type a lot yourself, lower the keyboard layer or remove it so it doesn’t blur with your own keystrokes. For more cosiness add a [fireplace](/sounds/fireplace); for more focus, swap pink noise for brown.",
      "Pair it with a [25 minute timer](/timer/25-minutes) and keep the same mix for every session in a day, so pressing play becomes the cue to start.",
    ],
    when: [
      "Rainy desk suits the middle of the day, when you need to work steadily through a list: writing, email, planning or study. The gentle detail in the rain keeps the session from feeling flat, and the typing keeps you in a working frame of mind.",
      "It is also a good choice on genuinely rainy days, when it blends with the weather outside, and on bright days when you would rather be indoors and focused. Many people use it as their regular writing mix.",
    ],
    faq: [{ q: "Can I make it cosier?", a: "Yes. Add a fireplace or a cat purring from the Sounds tab, and lower the keyboard." }, { q: "Will the typing clash with my own?", a: "Some people find it blends in; if not, lower or remove the keyboard layer." }],
    related: ["/sounds/rain-on-window", "/sounds/keyboard-typing", "/sounds/pink-noise", "/timer/25-minutes", "/mix"],
  }),
  mixPage({
    slug: "corner-cafe",
    wave: 2,
    layers: { cafe: 0.6, "light-rain": 0.3 },
    heading: "Corner café mix",
    title: "Corner café: café chatter with rain outside",
    description: "A rainy-day café soundscape: murmured chatter and cups inside, light rain outside. Free in your browser, a favourite for creative work and study.",
    intro: "Chatter and cups inside, light rain outside. Tap play.",
    about: [
      "Corner café puts you at a table by the window of a busy café while it drizzles outside. The [coffee shop](/sounds/coffee-shop) chatter gives you company and a lively, blurred background; the [light rain](/sounds/light-rain) adds a sheltered, cosy feeling and fills the quieter moments.",
      "It is one of the most popular combinations in the library, and research on moderate ambient noise suggests a lively café level can help creative thinking.",
    ],
    inside: ["**Café** ambience: murmured voices, cups, the espresso machine.", "**Light rain** outside, softer, for shelter and steadiness."],
    goodFor: ["Creative work and brainstorming.", "Writing first drafts.", "Studying when silence feels lonely.", "Reading on a rainy afternoon."],
    tips: [
      "Set the café loud enough to fill the room but not so loud you strain to think; the research found benefits at a moderate level and costs at a loud one. For detailed tasks, lower the café and raise the rain.",
      "Read more in the guide to [why café noise helps creative work](/guides/why-cafe-noise-helps-creativity).",
    ],
    when: [
      "Corner café is best for the generative parts of work: brainstorming, outlining, first drafts, design exploration and planning. These benefit from a little energy in the room and a slightly broader way of thinking. It also helps on days when working alone feels isolating.",
      "When you switch to detailed, analytical work, such as editing or debugging, lower the café or swap to a steadier mix such as Deep work. Many people use the two together: café for ideas in the morning, noise for execution in the afternoon.",
    ],
    faq: [{ q: "Can I remove the rain?", a: "Yes. Drag the rain slider to zero for a dry café, or remove the layer." }, { q: "Is café noise good for focus?", a: "For creative and conceptual work many people find it helps. For detailed work, steadier sound may distract less." }],
    related: ["/sounds/coffee-shop", "/sounds/light-rain", "/guides/why-cafe-noise-helps-creativity", "/mix"],
  }),
  mixPage({
    slug: "coastline",
    wave: 2,
    layers: { waves: 0.65, seagulls: 0.15, wind: 0.2 },
    heading: "Coastline mix",
    title: "Coastline: ocean waves, gulls and sea air",
    description: "A seaside soundscape: ocean waves on the shore, a few seagulls and soft wind. Free in your browser for relaxing, focus and sleep.",
    intro: "Waves, gulls and sea air. Tap play.",
    about: [
      "Coastline takes you to the edge of the sea: [ocean waves](/sounds/ocean-waves) rolling onto the shore, a few [seagulls](/sounds/seagulls) wheeling overhead and a soft wind off the water. The waves do the masking with their slow, broad swell; the gulls and wind give the scene space.",
      "It is a restorative mix for breaks and winding down, and a calm, open background for lighter work.",
      "The waves are a slow, natural form of masking noise: each breaking wave is a broad wash of sound, close in character to pink noise. The wind fills the gaps between them, and the gulls are kept quiet so they set the scene without pulling your attention.",
    ],
    inside: ["**Ocean waves** as the base.", "**Seagulls**, quiet and occasional.", "**Wind**, low, for open air."],
    goodFor: ["Relaxing after work.", "Light, creative tasks.", "Breaks between focus sessions.", "Holiday mood on a grey day."],
    tips: [
      "For focus, remove the seagulls and keep the waves low. For sleep, lower everything and add [pink noise](/sounds/pink-noise) to fill the quiet moments between waves.",
      "A [5 minute timer](/timer/5-minutes) with Coastline, eyes closed, is one of the quickest ways to reset between sessions.",
    ],
    when: [
      "Coastline is a reset mix. Use it between focus sessions, after a long meeting or at the end of the working day, when you want to slow down and let your mind wander. Its slow, broad swell is particularly good for breathing exercises: breathe in as a wave arrives, out as it retreats.",
      "It can also work as a background for unhurried creative work, such as sketching, journaling or planning, where you want a calm, spacious mood rather than tight focus.",
    ],
    faq: [{ q: "Is it good for focus?", a: "For light and creative work, yes. For demanding tasks, remove the gulls and keep the waves low." }, { q: "Is it good for sleep?", a: "Yes, at a low volume. Remove the gulls if their calls wake you." }],
    related: ["/sounds/ocean-waves", "/sounds/seagulls", "/sounds/wind", "/mix"],
  }),
  mixPage({
    slug: "night-camp",
    wave: 2,
    layers: { campfire: 0.6, crickets: 0.3, owl: 0.15 },
    heading: "Night camp mix",
    title: "Night camp: a campfire under the stars",
    description: "A night-time camping soundscape: a crackling campfire, crickets and a distant owl. Free in your browser, for winding down, reading and sleep.",
    intro: "A crackling fire under the stars. Tap play.",
    about: [
      "Night camp is a warm evening outdoors: a [crackling fire](/sounds/fireplace) close by, [crickets](/sounds/crickets) chirping in the grass and an [owl](/sounds/owl) calling somewhere in the trees. It is calm, cosy and full of the feeling of a day winding down.",
      "The fire provides warmth and gentle masking, while the night sounds set the scene.",
      "Each layer is set to stay out of the way of the others. The fire is the closest sound, the crickets are spread around you, and the owl is far off and only occasional. That depth makes the mix feel like a real place rather than a stack of sounds.",
    ],
    inside: ["**Campfire** as the main layer.", "**Crickets** for the summer night.", "**Owl**, quiet and occasional."],
    goodFor: ["Winding down in the evening.", "Reading and journaling.", "Falling asleep.", "Storytelling and creative writing."],
    tips: [
      "For sleep, lower the fire so the pops are softer and keep the owl quiet. For evening work, keep the fire in front and add a little [brown noise](/sounds/brown-noise) for steadiness.",
      "Play it at the same time each evening and it becomes a cue that the working day is over.",
    ],
    when: [
      "Night camp belongs to the evening. Use it to close the working day, while cooking, reading or planning tomorrow, and the warmth of the fire signals that the demanding part of the day is over. It also makes a cosy background for unhurried hobby time.",
      "On winter evenings it brings a little summer warmth indoors; on summer nights it fits with the season. For sleep, lower the fire and owl and let the crickets carry the mix.",
    ],
    faq: [{ q: "Can I add rain?", a: "Yes. Rain on a tent turns it into a rainy night by the fire." }, { q: "Is it good for sleep?", a: "Many people love it; lower the fire if the crackles keep you awake." }],
    related: ["/sounds/fireplace", "/sounds/crickets", "/sounds/owl", "/mix"],
  }),
  mixPage({
    slug: "reading-room",
    wave: 2,
    layers: { library: 0.6, paper: 0.2, clock: 0.12 },
    heading: "Reading room mix",
    title: "Reading room: library ambience for study",
    description: "A study soundscape: a hushed library, turning pages and a quiet ticking clock. Free in your browser, made for reading, revision and focus.",
    intro: "A hushed library, turning pages, a quiet clock. Tap play.",
    about: [
      "Reading room recreates the calm purpose of a library: the hush of a large room full of people concentrating, pages turning nearby and a clock ticking softly on the wall. It is quiet but not empty, which is what makes libraries such good places to study.",
      "The [library](/sounds/library) layer masks household noise gently, while the pages and clock add small, grounding details.",
      "Each layer plays a different role. The library hum fills the room and masks household noise, the pages give a sense of other people studying nearby, and the clock adds a slow, steady pace. Together they make a study space that feels occupied but never noisy.",
    ],
    inside: ["**Library** ambience as the base.", "**Turning pages**, quiet.", "**Clock ticking**, very quiet."],
    goodFor: ["Studying and exam revision.", "Reading and research.", "Calm writing.", "Recreating a study space at home."],
    tips: [
      "If the clock starts to distract you, remove it; everything else will still work. Pair the mix with a [45 minute timer](/timer/45-minutes), the length of a class period, for study blocks.",
      "For a cosier version, add rain on the window or a soft fire.",
    ],
    when: [
      "Reading room is a study-day mix. Use it for revision, reading research papers, working through course material or any session where you need calm, sustained attention. It pairs well with exam season routines, giving you a library feeling even when you can’t get to one.",
      "It is also a good background for focused reading for pleasure, when you want a quiet, purposeful room but home feels too silent or too noisy.",
    ],
    faq: [{ q: "Can I study for hours with it?", a: "Yes, it is calm and steady. Take regular breaks, and remove the clock if it starts to distract you." }, { q: "Is library sound good for studying?", a: "Yes. It is calm and strongly associated with concentration, which helps many people settle into study." }],
    related: ["/sounds/library", "/sounds/clock-ticking", "/timer/45-minutes", "/mix"],
  }),
  mixPage({
    slug: "sleeper-car",
    wave: 2,
    layers: { "inside-a-train": 0.6, "rain-on-window": 0.3 },
    heading: "Sleeper car mix",
    title: "Sleeper car: a night train through the rain",
    description: "A night-train soundscape: the hum of a moving carriage with rain on the window. Free in your browser, for sleep, reading and long focus sessions.",
    intro: "A long train ride through the rain. Tap play.",
    about: [
      "Sleeper car is a night train on a rainy journey: the warm, steady hum of the [carriage](/sounds/inside-a-train) around you and [rain streaking the window](/sounds/rain-on-window). It combines two of the most soothing sounds in the library into one of the best mixes for sleep.",
      "The train hum is deep and steady, much like brown noise, while the rain adds texture and shelter.",
      "Train noise is one of the most effective natural sleep sounds because it is low, steady and slightly rhythmic, much like being rocked. The rain on the window adds a sense of shelter and softens the edges of the hum, so the mix feels warm rather than mechanical.",
    ],
    inside: ["**Inside a train** as the base.", "**Rain on a window**, softer, for a stormy night."],
    goodFor: ["Falling asleep.", "Long focus sessions.", "Reading.", "Feeling like you’re going somewhere."],
    tips: [
      "For sleep, keep the volume low and let it run. For work, it suits long sessions; pair it with a [90 minute timer](/timer/90-minutes) and let the journey carry you through.",
      "Add distant thunder for a stormy night, or a quiet café for a dining car.",
    ],
    when: [
      "Sleeper car is a night mix first: play it as you get into bed and let the journey carry you to sleep. It is especially good when travelling, because it is a familiar, steady sound you can bring into any hotel room.",
      "During the day it suits long, steady work and reading, when you want a sense of time passing and progress being made. Long writing sessions and course work fit it well.",
    ],
    faq: [{ q: "Can I add thunder?", a: "Yes. Add distant thunder from the Sounds tab for a stormy night journey." }, { q: "Is it good for sleep?", a: "Yes. It is one of the most popular sleep mixes, because both layers are steady and soft." }],
    related: ["/sounds/inside-a-train", "/sounds/rain-on-window", "/timer/90-minutes", "/mix"],
  }),
  mixPage({
    slug: "morning-trail",
    wave: 2,
    layers: { birds: 0.45, river: 0.35, "wind-in-trees": 0.25 },
    heading: "Morning trail mix",
    title: "Morning trail: birdsong over a running stream",
    description: "A fresh morning soundscape: birdsong over a running stream and wind in the trees. Free in your browser to start the day with energy.",
    intro: "Birdsong over a stream on a fresh morning. Tap play.",
    about: [
      "Morning trail is a walk in the woods at dawn: [birdsong](/sounds/birdsong) in the branches, a [stream](/sounds/river) running over stones and a breeze moving through the leaves. It is bright, fresh and full of life, a good way to start a working day.",
      "The river and wind provide steady masking; the birds add energy on top.",
      "The three layers are balanced so that the river carries the mix and the birds sit on top as occasional details. That keeps the energy of a dawn chorus without the busyness of a full one, so you can work to it rather than just listen to it.",
    ],
    inside: ["**Birdsong**, the bright top layer.", "**River** as the steady base.", "**Wind in trees** for movement."],
    goodFor: ["The first session of the day.", "Creative work.", "Breaks and short walks of the mind.", "Bringing nature into a windowless room."],
    tips: [
      "For focus, lower the birds so their calls are occasional details. For a quick reset, play it on its own for a few minutes with your eyes closed.",
      "Pair it with a morning [25 minute timer](/timer/25-minutes) to start the day.",
    ],
    when: [
      "Morning trail is made for the start of the day. Use it for planning, for a first focus session, or while you have breakfast and ease into work. Its brightness can help on dark winter mornings, when daylight is in short supply.",
      "It is also a good mid-afternoon pick-me-up: a few minutes of birdsong and running water can freshen a flagging mind before the last session of the day.",
    ],
    faq: [{ q: "Can I use it for sleep?", a: "Most people prefer calmer sounds for sleep. Try the river alone at a low volume instead." }, { q: "Is birdsong distracting?", a: "It can be at a high level. Keep it lower than the river for work." }],
    related: ["/sounds/birdsong", "/sounds/river", "/sounds/wind-in-trees", "/mix"],
  }),
  mixPage({
    slug: "deep-dive",
    wave: 2,
    layers: { submarine: 0.45, underwater: 0.4, "brown-noise": 0.2 },
    heading: "Deep dive mix",
    title: "Deep dive: submarine hum and deep ocean sounds",
    description: "An immersive underwater soundscape: a submarine’s hum, the deep ocean and brown noise. Free in your browser for deep, isolated focus.",
    intro: "Submerged and far from everything. Tap play.",
    about: [
      "Deep dive sinks you below the surface: the steady hum of a [submarine](/sounds/submarine), the muffled hush of the [deep ocean](/sounds/underwater) and a layer of [brown noise](/sounds/brown-noise) beneath. It is the most isolating mix in the library, ideal when you want the world to disappear.",
      "Every layer is low and continuous, so it masks noise strongly without anything to grab your attention.",
      "Because the submarine, the ocean and the brown noise all sit low in the frequency range, the mix covers rumbling noises such as traffic, air conditioning and neighbours especially well. Raise the brown noise if you need more masking, or lower it for a lighter, more atmospheric dive.",
    ],
    inside: ["**Submarine** hum and creaks.", "**Underwater** ambience.", "**Brown noise**, low, for depth."],
    goodFor: ["Deep, uninterrupted focus.", "Noisy homes and offices.", "Sleep.", "Sci-fi and adventure writing."],
    tips: [
      "For the deepest focus, pair it with a [90/20 block](/pomodoro/90-20) and focus mode. For sleep, lower the submarine so its creaks are softer.",
      "Add whale song for an evening wind-down, or the starship hum for a vessel between worlds.",
    ],
    when: [
      "Deep dive is for the sessions that need total isolation: a deadline, a hard problem or a noisy environment you can’t escape. Use it with headphones in shared spaces to feel completely cut off.",
      "At night it doubles as a deep, steady sleep mix, especially for people who like low hums such as fans or air conditioning. It is also a favourite for immersive creative work set at sea or in space.",
    ],
    faq: [{ q: "Is it good for sleep?", a: "Yes, for people who like low hums. Lower the submarine if its creaks are noticeable." }, { q: "Is it good for focus?", a: "Yes. All three layers are low and steady, which makes it a strong mask." }],
    related: ["/sounds/submarine", "/sounds/underwater", "/sounds/brown-noise", "/mix"],
  }),
  mixPage({
    slug: "deep-space",
    wave: 2,
    layers: { "starship-hum": 0.6, "brown-noise": 0.15 },
    heading: "Deep space mix",
    title: "Deep space: a starship engine hum for focus",
    description: "A sci-fi focus soundscape: Focuship’s original starship engine hum over brown noise, generated on your device. Endless, seamless and offline.",
    intro: "The engine hum of a ship between stars. Tap play.",
    about: [
      "Deep space is Focuship’s signature mix: the slowly breathing engine-room drone of the [starship hum](/sounds/starship-hum), with a little [brown noise](/sounds/brown-noise) underneath to deepen the hull. It feels like working on a ship crossing the dark between stars, far from every distraction.",
      "Both layers are generated live, so the mix never repeats, never loads and works offline.",
      "Unlike recordings, the starship hum has no fixed length or loop point. It is built from oscillators and filtered noise that run continuously, with a filter sweeping very slowly over the low tones, so it keeps evolving for as long as you leave it on. That makes it one of the best sounds for marathon sessions.",
    ],
    inside: ["**Starship hum**, the original engine drone.", "**Brown noise**, low, for depth."],
    goodFor: ["Long deep work sessions.", "Coding and technical work.", "Sci-fi writing and world-building.", "Late-night focus."],
    tips: [
      "Start at a moderate volume and lower it once you have settled; the slow sweep of the drone is easy to forget about. Pair it with a [90/20 block](/pomodoro/90-20) for the hardest task of the day.",
      "Add a laboratory for a research vessel, or underwater ambience for a ship in the deep.",
    ],
    when: [
      "Deep space is for long, late or lonely sessions: night-time coding, a weekend of writing or a hard problem that needs hours. Its slow drone makes time feel steady and uneventful, which is exactly what deep work needs.",
      "It is also a natural fit for science-fiction writing and games design, and for anyone who finds natural sounds too gentle and noise too plain.",
    ],
    faq: [{ q: "Will it loop?", a: "No. Both layers are generated continuously, so there is no loop point at all." }, { q: "Is the starship hum a recording?", a: "No. It is synthesised in your browser, so it never repeats." }],
    related: ["/sounds/starship-hum", "/sounds/brown-noise", "/sounds-for/coding", "/mix"],
  }),
  mixPage({
    slug: "rain-and-fireplace",
    wave: 2,
    layers: { "rain-on-window": 0.5, campfire: 0.5, "light-rain": 0.25 },
    heading: "Rain and fireplace",
    title: "Rain and fireplace sounds: a cosy crackling evening",
    description: "Rain on the window and a crackling fire, mixed together free in your browser. The coziest soundscape for reading, writing, relaxing and sleep.",
    intro: "Rain on the window, a fire crackling inside. Tap play.",
    about: [
      "Rain and a fire are the classic cosy combination: [rain tapping on the window](/sounds/rain-on-window) and falling outside, a [fire crackling](/sounds/fireplace) in the room. The rain provides a soft, steady wash; the fire adds warmth and gentle detail.",
      "It is one of the most searched-for ambient mixes, and for good reason: the contrast between weather outside and warmth inside is deeply comforting.",
      "The two layers also complement each other technically. Rain is a broad, steady wash that does most of the masking, while the fire’s crackles are brief and irregular, so together they cover background noise without either becoming monotonous. That balance is why the mix holds up for hours of reading or writing.",
    ],
    inside: ["**Rain on a window**, close.", "**Fireplace**, warm crackles.", "**Light rain**, low, for a fuller shower."],
    goodFor: ["Reading on a dark evening.", "Writing.", "Relaxing after work.", "Falling asleep."],
    tips: [
      "For sleep, lower the fire so the pops are soft and let the rain lead. For focus, add a little [brown noise](/sounds/brown-noise) to steady the mix.",
      "Add a purring cat for the coziest version, or distant thunder for a stormy night.",
    ],
    when: [
      "Rain and fireplace is an evening and weekend mix: reading, writing, journaling, crafts or simply relaxing with a hot drink. It is especially popular in autumn and winter, but works any time you want a room to feel warm and sheltered.",
      "It also makes a gentle background for light work, such as planning or email, when you want comfort more than intense focus.",
    ],
    faq: [{ q: "Can I use it for focus?", a: "For light work, yes. For demanding tasks, add brown noise and lower the fire." }, { q: "Is rain and fire good for sleep?", a: "Many people find it ideal. Keep the fire lower than the rain so the crackles don’t wake you." }],
    related: ["/sounds/fireplace", "/sounds/rain-on-window", "/mix/rain-sounds", "/mix"],
  }),
];
