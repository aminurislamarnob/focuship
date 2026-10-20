import type { Guide } from "@/lib/guides";

export const ADHD: Guide = {
  slug: "brown-noise-for-adhd",
  title: "Brown noise for ADHD: what we know",
  description:
    "Why brown noise became popular for ADHD, what research on white and pink noise actually shows, the gaps in the evidence for brown noise, and how to try it safely.",
  heading: "Brown noise for ADHD: what we know",
  standfirst:
    "Brown noise went viral as an ADHD focus hack. The research behind it is real but narrower than the hype: most of it studied white and pink noise, mostly in children, and the effects are small.",
  published: "2026-10-20",
  updated: "2026-10-20",
  reviewed: false,
  notice:
    "This guide summarises research for general information. It is not medical advice and is no substitute for assessment or treatment by a qualified professional. Don’t change any treatment without talking to your clinician.",
  listen: [
    { label: "Play brown noise", path: "/sounds/brown-noise" },
    { label: "Play pink noise", path: "/sounds/pink-noise" },
  ],
  sections: [
    {
      heading: "Why noise might help some people with ADHD",
      body: [
        "The leading idea comes from the moderate brain arousal model, proposed by Swedish researchers in 2007. It suggests that people with ADHD may be under-aroused in some brain systems, and that adding a moderate amount of external stimulation, such as background noise, can bring arousal closer to the level where attention works best. The same noise could push someone who is already well aroused past that level, making their performance worse.",
        "That second half matters: the model predicts noise helps some people and hinders others, which is what several studies have found.",
      ],
    },
    {
      heading: "What the studies found",
      body: [
        "A 2007 study found that white noise improved memory performance in children with attention problems while worsening it in children without. A 2010 study of inattentive schoolchildren found a similar pattern, and a 2016 study reported benefits from white noise on some neuropsychological measures.",
        "The strongest summary so far is a 2024 meta-analysis in the *Journal of the American Academy of Child & Adolescent Psychiatry*. It combined 13 studies of white and pink noise in young people with ADHD or elevated attention problems and found:",
        {
          list: [
            "**A small benefit** on attention and task performance for the ADHD groups (an effect size of about 0.25).",
            "**A small negative effect** for comparison groups without attention problems.",
            "**No eligible studies of brown noise.** The research that exists is on white and pink noise.",
            "**Moderate certainty**, with the authors calling the findings encouraging but not yet enough for clinical recommendations.",
          ],
        },
      ],
    },
    {
      heading: "What this means for brown noise",
      body: [
        "Brown noise is a close relative of white and pink noise. It has the same random structure, with more energy in the low frequencies, so it is plausible that it works in a similar way. But plausible is not proven: no controlled study included in that meta-analysis tested it, and the viral claims run well ahead of the evidence.",
        "Most research has also been done in children and teenagers in lab tasks. Adults with ADHD report finding brown noise helpful, and personal experience is a reasonable guide for something low-risk, but it is not the same as evidence that it improves day-to-day functioning.",
      ],
    },
    {
      heading: "How to try it sensibly",
      body: [
        {
          list: [
            "**Treat it as an experiment.** Try a week with noise and a week without on similar tasks, and note how focused you felt and how much you got done.",
            "**Compare colours.** Since the research is on white and pink noise, try [pink noise](/sounds/pink-noise) and [white noise](/sounds/white-noise) as well as [brown noise](/sounds/brown-noise); the [guide to noise colours](/guides/brown-vs-white-vs-pink-noise) explains the differences.",
            "**Keep the volume low.** Moderate stimulation is the point; louder isn’t better, and long exposure to loud sound harms hearing.",
            "**Pair it with structure.** Noise works best alongside other supports such as short, timed work blocks. A [25 minute timer](/timer/25-minutes) is a good place to start.",
            "**Stop if it makes things worse.** The research shows noise can hurt performance for some people.",
          ],
        },
        "Background noise is a low-cost, low-risk tool that may help some people a little. It isn’t a treatment for ADHD, and it doesn’t replace assessment, therapy, coaching or medication where those are appropriate.",
      ],
    },
  ],
  faq: [
    {
      q: "Does brown noise help ADHD?",
      a: "It might help some people, but it hasn’t been properly tested yet. Research on the closely related white and pink noise shows a small benefit for young people with ADHD and a small cost for people without attention difficulties.",
    },
    {
      q: "Is brown noise better than white noise for ADHD?",
      a: "Nobody knows yet. The studies that show benefits used white or pink noise. Brown noise is softer, so some people find it easier to listen to; try each and see what works for you.",
    },
    {
      q: "Can noise replace ADHD medication?",
      a: "No. The benefits found in research are small, and noise is not a treatment. Talk to your clinician before changing any treatment.",
    },
    {
      q: "Is it safe for children to listen to noise?",
      a: "At a low volume, generally yes. Keep speakers away from a child’s head, avoid high volumes, and check with your child’s clinician if you have concerns.",
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
      title: "Stimulus-dependent dopamine release in attention-deficit/hyperactivity disorder",
      publication: "Psychological Review",
      year: 2007,
      url: "https://doi.org/10.1037/0033-295X.114.4.1047",
    },
    {
      title: "Listen to the noise: noise is beneficial for cognitive performance in ADHD",
      publication: "Journal of Child Psychology and Psychiatry",
      year: 2007,
      url: "https://doi.org/10.1111/j.1469-7610.2007.01749.x",
    },
    {
      title: "The effects of background white noise on memory performance in inattentive school children",
      publication: "Behavioral and Brain Functions",
      year: 2010,
      url: "https://doi.org/10.1186/1744-9081-6-55",
    },
    {
      title: "Neuropsychological and neurophysiological benefits from white noise in children with and without ADHD",
      publication: "Behavioral and Brain Functions",
      year: 2016,
      url: "https://doi.org/10.1186/s12993-016-0095-y",
    },
  ],
  related: ["/sounds/brown-noise", "/sounds/pink-noise", "/guides/brown-vs-white-vs-pink-noise", "/timer/25-minutes"],
};
