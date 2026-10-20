import type { Guide } from "@/lib/guides";

export const BINAURAL_BEATS: Guide = {
  slug: "do-binaural-beats-help-focus",
  title: "Do binaural beats help you focus? What the research says",
  description:
    "How binaural beats work, what the alpha, beta, theta and gamma bands are, and what meta-analyses and systematic reviews actually found about focus, memory and anxiety.",
  heading: "Do binaural beats help you focus? What the research says",
  standfirst:
    "Binaural beats are sold as a way to tune your brainwaves for focus, calm or sleep. The research is more interesting, and more mixed, than either the enthusiasts or the sceptics suggest.",
  published: "2026-10-20",
  updated: "2026-10-20",
  reviewed: false,
  notice: "Use headphones for binaural beats. If you have epilepsy or a seizure disorder, check with a doctor before using rhythmic audio.",
  listen: [
    { label: "Play an alpha beat", path: "/sounds/binaural-beats" },
    { label: "Play the coding mix", path: "/sounds-for/coding" },
  ],
  sections: [
    {
      heading: "How a binaural beat works",
      body: [
        "Play a 200 Hz tone into your left ear and a 210 Hz tone into your right, and you will hear something neither ear is receiving: a slow pulse at 10 Hz, the difference between the two. The beat is created inside the brain, in the auditory pathways where signals from both ears meet. The phenomenon was described in the 19th century and popularised by a 1973 article in *Scientific American*.",
        "Because each ear must receive its own tone, **binaural beats only work through headphones**. On speakers the two tones mix in the air before they reach you, producing an ordinary acoustic beat instead.",
      ],
    },
    {
      heading: "The brainwave bands",
      body: [
        "Beats are usually named after the bands of electrical activity measured in EEG studies. The names describe states the bands are associated with, not states a beat is proven to produce:",
        {
          list: [
            "**Theta (4–8 Hz):** drowsiness, daydreaming and the edge of sleep.",
            "**Alpha (8–12 Hz):** relaxed, calm wakefulness.",
            "**Beta (13–30 Hz):** active, engaged thinking.",
            "**Gamma (above 30 Hz, often 40 Hz):** high-level processing and attention.",
          ],
        },
        "Focuship offers one beat in each band: theta at 6 Hz, alpha at 10 Hz, beta at 16 Hz and gamma at 40 Hz.",
      ],
    },
    {
      heading: "What the research found",
      body: [
        "The popular explanation is entrainment: listen to a 10 Hz beat and your brain activity drifts toward 10 Hz. That specific claim has weak support. A 2023 systematic review of EEG studies found 14 that met its criteria: five reported results consistent with entrainment, eight reported results that contradicted it and one was mixed. The studies used very different methods, which makes them hard to compare.",
        "The behavioural evidence looks better. A 2019 meta-analysis pooled 22 studies of binaural beats and memory, attention, anxiety and pain, and found a medium-sized overall benefit. It also found that listening before a task, or before and during it, worked better than listening only during it, and that longer exposure helped.",
        "Put together, the fairest summary is this: binaural beats may produce small-to-moderate benefits for some outcomes, but probably not through the simple brainwave-tuning mechanism usually advertised, and results vary a lot between studies. Placebo and expectation are hard to rule out in research like this.",
      ],
    },
    {
      heading: "Should you use them for focus?",
      body: [
        "If you enjoy them, there is little downside. At a low volume through headphones, binaural beats are a gentle, steady sound that many people find pleasant to work to, and that alone can help you settle into a session.",
        {
          list: [
            "**Try alpha or beta for focus**, and theta for winding down.",
            "**Start a few minutes before you begin work** and keep it going; the 2019 analysis found pre-task exposure worked best.",
            "**Layer it under other sounds.** A beat on its own can feel clinical; under [brown noise](/sounds/brown-noise) or rain it fades into the texture. The Deep work preset pairs alpha with brown noise.",
            "**Judge it over a full session**, such as a [25 minute timer](/timer/25-minutes), and keep it only if you notice a difference.",
          ],
        },
        "Treat any claims of dramatic effects, such as instant learning, IQ boosts or replacing medication, with heavy scepticism.",
      ],
    },
  ],
  faq: [
    {
      q: "Do binaural beats really work?",
      a: "Partly. A 2019 meta-analysis found a medium overall benefit for memory, attention, anxiety and pain, but a 2023 review found inconsistent evidence that they change brainwaves the way they are marketed. Expect modest, individual effects.",
    },
    {
      q: "Which binaural beat is best for studying?",
      a: "Alpha (around 10 Hz) and beta (around 16 Hz) are the usual choices for study and focus. No single band has strong evidence, so try each for a session.",
    },
    {
      q: "Can I listen to binaural beats on speakers?",
      a: "No. Each ear needs its own tone for the brain to create the beat, so they only work with headphones or earbuds.",
    },
    {
      q: "Are binaural beats safe?",
      a: "At a comfortable volume they are generally considered safe. People with epilepsy or a seizure disorder should talk to a doctor before using rhythmic audio, and anyone who feels unwell while listening should stop.",
    },
  ],
  sources: [
    {
      title: "Efficacy of binaural auditory beats in cognition, anxiety, and pain perception: a meta-analysis",
      publication: "Psychological Research",
      year: 2019,
      url: "https://doi.org/10.1007/s00426-018-1066-8",
    },
    {
      title: "Binaural beats to entrain the brain? A systematic review of the effects of binaural beat stimulation on brain oscillatory activity",
      publication: "PLOS ONE",
      year: 2023,
      url: "https://doi.org/10.1371/journal.pone.0286023",
    },
    {
      title: "Auditory Beats in the Brain",
      publication: "Scientific American",
      year: 1973,
      url: "https://doi.org/10.1038/scientificamerican1073-94",
    },
  ],
  related: ["/sounds/binaural-beats", "/sounds/brown-noise", "/sounds-for/coding", "/timer/25-minutes"],
};
