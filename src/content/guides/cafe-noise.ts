import type { Guide } from "@/lib/guides";

export const CAFE_NOISE: Guide = {
  slug: "why-cafe-noise-helps-creativity",
  title: "Why café noise helps creative work: the 70 dB study",
  description:
    "The 2012 study that found moderate ambient noise, around the level of a busy café, boosts creative thinking, why it might work, its limits, and how to recreate it at home.",
  heading: "Why café noise helps creative work",
  standfirst:
    "Writers have worked in cafés for centuries. A well-known 2012 study suggests the background hum is part of the reason, but only at the right volume and for the right kind of task.",
  published: "2026-10-20",
  updated: "2026-10-20",
  reviewed: false,
  listen: [
    { label: "Play coffee shop sounds", path: "/sounds/coffee-shop" },
    { label: "Play rain sounds", path: "/mix/rain-sounds" },
  ],
  sections: [
    {
      heading: "The study",
      body: [
        "In 2012 researchers Ravi Mehta, Rui Zhu and Amar Cheema published a series of experiments in the *Journal of Consumer Research* asking a simple question: is noise always bad for thinking? Participants worked on creative tasks, such as finding a word that links three others or coming up with creative ideas, while background noise played at different levels.",
        "The results formed an inverted U. At a **moderate level of about 70 decibels**, roughly the hum of a busy café, people performed better on creative tasks than at a low level of about 50 decibels. At a high level of about 85 decibels, closer to heavy traffic or a loud restaurant, performance dropped.",
      ],
    },
    {
      heading: "Why moderate noise might help",
      body: [
        "The researchers’ explanation centres on processing difficulty. Moderate noise makes thinking slightly harder, and that mild difficulty seems to nudge people toward more abstract, big-picture processing, the kind that helps when you need to connect distant ideas. Too much noise overwhelms you, and too little lets you stay in narrow, concrete detail.",
        "There are other likely ingredients that the study didn’t isolate. A café’s murmur masks sudden, specific sounds that would grab attention, it gives a sense of company without anyone needing you, and going to a café is a ritual that marks the start of work.",
      ],
    },
    {
      heading: "The limits",
      body: [
        "It is one set of experiments, on short lab tasks, and it measured creativity, not every kind of work. Some points to keep in mind:",
        {
          list: [
            "**Detailed work may suffer.** The same abstract-thinking shift that helps brainstorming can hurt tasks that need precise attention, such as proofreading, accounting or debugging.",
            "**Intelligible speech is different.** The study used a blended, indistinct hum. A conversation you can follow is distracting, because the brain automatically processes language it hears.",
            "**Volume matters a lot.** The benefit appeared at a moderate level and disappeared when it got loud.",
          ],
        },
      ],
    },
    {
      heading: "Recreating the café effect at home",
      body: [
        {
          list: [
            "**Use a blurred café recording**, not a podcast or a video with clear voices. Focuship’s [coffee shop sound](/sounds/coffee-shop) is a murmur of chatter and cups with no conversation to follow.",
            "**Set the level to fill the room, not your head.** You can’t measure decibels easily, but aim for a lively background that you could still talk over comfortably.",
            "**Save it for idea work.** Brainstorming, outlining, writing first drafts and design exploration are the best fit. Switch to steadier sound such as [brown noise](/sounds/brown-noise) for detailed work.",
            "**Add weather for comfort.** Café chatter with light rain outside (the Corner café preset) is one of the most popular combinations.",
            "**Give it structure.** Pair it with a [Pomodoro timer](/pomodoro/25-5) so the creative session has a clear start and end.",
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: "How loud is 70 decibels?",
      a: "Roughly the level of a busy café or restaurant: lively, but you can still talk over it comfortably.",
    },
    {
      q: "Does café noise help with studying?",
      a: "For creative and conceptual study it may. For memorising or detailed problem solving, the abstract-thinking shift can work against you, so steadier noise or quiet may be better.",
    },
    {
      q: "Is a café recording as good as a real café?",
      a: "For the sound, it can be better: no sudden laughter beside you or milk steamer in your ear. You lose the change of scenery and the ritual of going out, which also help some people.",
    },
  ],
  sources: [
    {
      title: "Is Noise Always Bad? Exploring the Effects of Ambient Noise on Creative Cognition",
      publication: "Journal of Consumer Research",
      year: 2012,
      url: "https://doi.org/10.1086/665048",
    },
    {
      title: "Disruption of short-term memory by unattended speech: Implications for the structure of working memory",
      publication: "Journal of Verbal Learning and Verbal Behavior",
      year: 1982,
      url: "https://doi.org/10.1016/S0022-5371(82)90521-7",
    },
  ],
  related: ["/sounds/coffee-shop", "/mix/rain-sounds", "/sounds/brown-noise", "/pomodoro/25-5"],
};
