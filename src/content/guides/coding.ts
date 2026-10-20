import type { Guide } from "@/lib/guides";

export const CODING: Guide = {
  slug: "background-sounds-for-coding",
  title: "Best background sounds for coding and deep work",
  description:
    "Why lyrics get in the way of programming, which background sounds help developers focus (brown noise, rain, café, binaural beats) and how to build a deep work setup.",
  heading: "The best background sounds for coding and deep work",
  standfirst:
    "Headphones on is the universal developer sign for “in the zone”. What plays through them matters more than you might think, and the research points in a surprisingly clear direction.",
  published: "2026-10-20",
  updated: "2026-10-20",
  reviewed: false,
  listen: [
    { label: "Play the coding mix", path: "/sounds-for/coding" },
    { label: "Play brown noise", path: "/sounds/brown-noise" },
    { label: "Start a 50/10 timer", path: "/pomodoro/50-10" },
  ],
  sections: [
    {
      heading: "What coding asks of your brain",
      body: [
        "Programming is working-memory work. While you write a function you are holding the shape of the data, the names in scope, the edge case you just remembered and the next two steps, all at once. Working memory is small, and anything that competes for it makes the juggling harder.",
        "That is why interruptions are so costly for developers: one Slack ping can drop the whole structure you were holding, and rebuilding it takes minutes. Good background sound protects that structure in two ways. It masks the unpredictable noises that pull your attention, and it does so without adding anything your brain wants to process.",
      ],
    },
    {
      heading: "Why lyrics are the problem",
      body: [
        "Decades of research on the “irrelevant speech effect” show that background speech disrupts verbal working memory even when people are told to ignore it. In a classic 1982 experiment, unattended speech impaired people’s memory for sequences of digits while background noise at the same level did not. Your brain can’t stop processing language it hears.",
        "Sung lyrics count. A 2014 study found that reading comprehension was worse with music that had lyrics, whether people liked the music or not, than in quiet or with music without lyrics. Code is read far more than it is written, so for the hardest stretches of the day, wordless sound is the safer choice.",
        "Instrumental music, including lo-fi, sits in between: no words, but melody and rhythm can still draw attention. Many developers find it fine for routine work and switch to ambient sound or noise when the problem gets hard.",
      ],
    },
    {
      heading: "Sounds that work well",
      body: [
        {
          list: [
            "**[Brown noise](/sounds/brown-noise):** a deep, constant rumble that masks traffic and office hum without hiss. The most popular choice for long sessions.",
            "**[White noise](/sounds/white-noise):** the strongest mask against nearby conversation, at the cost of a brighter sound.",
            "**[Rain](/mix/rain-sounds):** natural noise with gentle variation, so it doesn’t feel artificial over hours.",
            "**[Coffee shop](/sounds/coffee-shop):** blurred chatter for lighter work such as code review or writing docs. A 2012 study linked moderate ambient noise to better creative thinking, though it may distract during detailed debugging.",
            "**[Binaural beats](/sounds/binaural-beats):** popular with developers, with mixed evidence. A gentle alpha or beta beat under noise is pleasant even if the brainwave claims are unproven.",
          ],
        },
        "Layering is where it gets good. The [coding mix](/sounds-for/coding) combines brown noise, rain on a window and a quiet alpha beat, which gives depth, texture and masking without anything to follow.",
      ],
    },
    {
      heading: "A deep work setup",
      body: [
        {
          list: [
            "**Use one mix as a ritual.** The same sound every session becomes a cue: press play and your brain knows it is time to focus.",
            "**Time-box the work.** Pair the sound with a [50/10 Pomodoro](/pomodoro/50-10), or a [90/20 block](/pomodoro/90-20) for the hardest problem of the day.",
            "**Make the state visible.** A full-screen countdown on a second monitor tells you, and anyone walking past, that you are heads-down.",
            "**Keep the volume low.** Loud enough to mask the room, no louder. You should still hear someone say your name.",
            "**Silence notifications** for the length of the block. Sound can mask a noisy office; it can’t mask a phone buzzing on the desk.",
          ],
        },
      ],
    },
    {
      heading: "Why Focuship suits developers",
      body: [
        "Focuship is keyboard-first: Space plays and pauses, M mutes, V opens focus mode, F goes full screen and 1 to 3 switch tabs. It installs as an app, keeps playing in the background with media-key controls, and generates its noises and tones on your device so they loop seamlessly and work offline. No account is needed and there is no tracking, and the code is MIT-licensed on GitHub, so you can read exactly how the gapless loops and generated noise work.",
      ],
    },
  ],
  faq: [
    {
      q: "Is it better to code in silence?",
      a: "If your environment is quiet, silence is excellent. Background sound earns its place when there are distractions to mask, or when it helps you start and stay in a session.",
    },
    {
      q: "Is lo-fi good for programming?",
      a: "Instrumental music is far less disruptive than songs with lyrics, so lo-fi works for many people. For the hardest work, steady ambient sound or noise distracts even less.",
    },
    {
      q: "Brown noise or white noise for coding?",
      a: "Brown noise is softer and better against low rumbles; white noise is better at masking nearby conversation. Many developers use brown noise with a little white or pink on top.",
    },
    {
      q: "Do binaural beats help with programming?",
      a: "The evidence is mixed: reviews find inconsistent effects. They are harmless at a low volume and some people enjoy working to them, so they are worth a try under other sounds.",
    },
  ],
  sources: [
    {
      title: "Disruption of short-term memory by unattended speech: Implications for the structure of working memory",
      publication: "Journal of Verbal Learning and Verbal Behavior",
      year: 1982,
      url: "https://doi.org/10.1016/S0022-5371(82)90521-7",
    },
    {
      title: "Does listening to preferred music improve reading comprehension performance?",
      publication: "Applied Cognitive Psychology",
      year: 2014,
      url: "https://doi.org/10.1002/acp.2994",
    },
    {
      title: "Is Noise Always Bad? Exploring the Effects of Ambient Noise on Creative Cognition",
      publication: "Journal of Consumer Research",
      year: 2012,
      url: "https://doi.org/10.1086/665048",
    },
    {
      title: "Binaural beats to entrain the brain? A systematic review of the effects of binaural beat stimulation on brain oscillatory activity",
      publication: "PLOS ONE",
      year: 2023,
      url: "https://doi.org/10.1371/journal.pone.0286023",
    },
  ],
  related: ["/sounds-for/coding", "/sounds/brown-noise", "/pomodoro/50-10", "/sounds/binaural-beats", "/sounds/coffee-shop"],
};
