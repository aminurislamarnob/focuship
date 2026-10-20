import type { Guide } from "@/lib/guides";

export const NOISE_COLOURS: Guide = {
  slug: "brown-vs-white-vs-pink-noise",
  title: "Brown vs white vs pink noise: which is best for focus?",
  description:
    "What separates brown, pink and white noise, how each one masks distractions, what the research says about noise and attention, and how to choose one for focus or sleep.",
  heading: "Brown vs white vs pink noise: which is best for focus?",
  standfirst:
    "They are all random noise. What differs is how the energy is spread across pitch, and that changes how they sound, what they mask and how tiring they are to listen to.",
  published: "2026-10-20",
  updated: "2026-10-20",
  reviewed: false,
  listen: [
    { label: "Play brown noise", path: "/sounds/brown-noise" },
    { label: "Play pink noise", path: "/sounds/pink-noise" },
    { label: "Play white noise", path: "/sounds/white-noise" },
  ],
  sections: [
    {
      heading: "The short answer",
      body: [
        "There is no single best colour. **White noise** masks voices most strongly but can feel harsh. **Pink noise** is a balanced middle ground that sounds like steady rain. **Brown noise** is the deepest and softest, and many people find it the easiest to listen to for hours. The best one is the one that covers your distractions at the lowest volume you can comfortably forget about.",
      ],
    },
    {
      heading: "What the colours mean",
      body: [
        "All three are random signals: no melody, no rhythm, just a constant wash. The colour describes how the sound’s power is spread across frequencies, borrowing the idea from light.",
        {
          list: [
            "**White noise** has equal power at every frequency. Because there are far more high frequencies than low ones in each octave, it sounds bright and hissy, like radio static or a strong fan.",
            "**Pink noise** has equal power in every octave, which means its power falls by about 3 dB each time the pitch doubles. It sounds fuller and calmer, like steady rain or wind through trees.",
            "**Brown noise** (also called red or Brownian noise) falls by about 6 dB per octave. Most of its energy sits in the lows, so it sounds like a distant waterfall, heavy rain on a roof or the cabin of an aeroplane.",
          ],
        },
        "The name “brown” comes from Robert Brown and the random Brownian motion of particles, not from the colour. A simple way to remember the order: from brightest to deepest, it runs white, pink, brown.",
      ],
    },
    {
      heading: "How each one masks distractions",
      body: [
        "Noise helps focus mainly through masking: a steady sound raises the background level, so sudden sounds no longer stand out from silence. Your brain is wired to notice change, and masking reduces how much changes.",
        "What you need to mask decides the colour. Speech is easiest to understand in the higher frequencies where consonants live, so **white noise** is the strongest choice against conversation in an open-plan office. **Brown noise** does a better job with low, rumbling sounds such as traffic, a neighbour’s music or an air-conditioning unit, and it has none of the hiss. **Pink noise** covers a bit of both.",
        "Many people end up mixing them: a bed of brown noise for depth with a little white or pink on top for speech, or noise under a natural sound such as [rain](/mix/rain-sounds) so the texture stays interesting over long sessions.",
      ],
    },
    {
      heading: "What the research says about noise and attention",
      body: [
        "The evidence is real but narrower than social media suggests. The best-studied group is people with ADHD. A 2007 study found that white noise improved memory performance in children with attention problems while worsening it in children without, which led to the idea that people who are under-stimulated may benefit from extra background noise.",
        "A 2024 meta-analysis pulled together the research on white and pink noise in young people with ADHD or elevated attention problems. Across 13 studies it found a small, statistically reliable benefit on lab attention tasks, but a small *negative* effect in comparison groups without attention difficulties. The authors called the results encouraging but said more research is needed. Notably, no studies of brown noise met their criteria, so the popular claims about brown noise specifically have not yet been tested in the same way.",
        "For everyone else, the best-supported benefit is simply masking: a quieter-sounding environment because distracting sounds are covered. If noise makes you feel more focused, that is a reasonable reason to use it, but if you notice it tiring you or making tasks harder, believe that too.",
      ],
    },
    {
      heading: "Noise and sleep",
      body: [
        "Pink noise has drawn the most interest in sleep research. In laboratory studies, short bursts of pink noise played in time with the slow waves of deep sleep were linked to stronger slow waves and better memory the next morning, including in older adults. Those experiments used carefully timed sound rather than a continuous track, so they don’t show that playing pink noise all night has the same effect.",
        "Continuous noise is mainly useful for sleep as a mask against traffic, snoring or a noisy building. Keep it quiet. A 2014 study of infant sleep machines found that some could exceed recommended noise limits for infants at full volume when placed close to the cot, a reminder that steady sound still counts toward your noise exposure.",
      ],
    },
    {
      heading: "How to choose and use one",
      body: [
        {
          list: [
            "**Start with what you need to block.** Voices: try white or pink. Rumbles and traffic: try brown.",
            "**Listen at the lowest volume that works.** Turn it up only until the distraction stops pulling your attention, which is usually quieter than you expect.",
            "**Give each colour a full session.** Judge after a [25 minute timer](/timer/25-minutes), not after ten seconds. Most people settle on one quickly.",
            "**Layer if a single colour feels flat.** Brown noise under light rain or a café is easier to listen to for hours than either alone.",
            "**Stop if it isn’t helping.** Silence is a perfectly good focus sound too.",
          ],
        },
        "Focuship generates all three colours on your device with a seamless loop, so there is no repeating pattern to notice and they work offline. Each has its own page: [brown noise](/sounds/brown-noise), [pink noise](/sounds/pink-noise) and [white noise](/sounds/white-noise).",
      ],
    },
  ],
  faq: [
    {
      q: "Is brown noise better than white noise for ADHD?",
      a: "It might suit some people better because it is softer, but research so far has studied white and pink noise, not brown. A 2024 meta-analysis found a small benefit of white or pink noise for young people with ADHD, and no brown-noise studies met its criteria.",
    },
    {
      q: "Which noise colour is best for sleep?",
      a: "Whichever masks the sounds that wake you at a low volume. Many people prefer pink or brown because they are less hissy than white noise.",
    },
    {
      q: "Is it bad to listen to noise all day?",
      a: "Steady noise at a low volume is generally fine, but loud sound for long periods can damage hearing. Keep it quiet and take breaks, and if noise makes you feel worse, stop using it.",
    },
    {
      q: "What is the difference between pink and brown noise?",
      a: "Pink noise falls by about 3 dB per octave and sounds like steady rain; brown noise falls by about 6 dB per octave and sounds deeper, like a distant waterfall.",
    },
  ],
  sources: [
    {
      title: "Systematic Review and Meta-Analysis: Do White Noise or Pink Noise Help With Task Performance in Youth With Attention-Deficit/Hyperactivity Disorder or With Elevated Attention Problems?",
      publication: "Journal of the American Academy of Child & Adolescent Psychiatry",
      year: 2024,
      url: "https://doi.org/10.1016/j.jaac.2023.12.014",
    },
    {
      title: "Listen to the noise: noise is beneficial for cognitive performance in ADHD",
      publication: "Journal of Child Psychology and Psychiatry",
      year: 2007,
      url: "https://doi.org/10.1111/j.1469-7610.2007.01749.x",
    },
    {
      title: "Auditory Closed-Loop Stimulation of the Sleep Slow Oscillation Enhances Memory",
      publication: "Neuron",
      year: 2013,
      url: "https://doi.org/10.1016/j.neuron.2013.03.006",
    },
    {
      title: "Acoustic Enhancement of Sleep Slow Oscillations and Concomitant Memory Improvement in Older Adults",
      publication: "Frontiers in Human Neuroscience",
      year: 2017,
      url: "https://doi.org/10.3389/fnhum.2017.00109",
    },
    {
      title: "Infant Sleep Machines and Hazardous Sound Pressure Levels",
      publication: "Pediatrics",
      year: 2014,
      url: "https://doi.org/10.1542/peds.2013-3617",
    },
  ],
  related: ["/sounds/brown-noise", "/sounds/pink-noise", "/sounds/white-noise", "/mix/rain-sounds", "/timer/25-minutes"],
};
