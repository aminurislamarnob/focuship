import type { Guide } from "@/lib/guides";

export const POMODORO: Guide = {
  slug: "pomodoro-technique",
  title: "The Pomodoro Technique: a practical guide",
  description:
    "How the Pomodoro Technique works, why timed breaks help, what the research says, and how to adapt the 25/5 rhythm to longer work with a free online timer.",
  heading: "The Pomodoro Technique: a practical guide",
  standfirst:
    "Work for 25 minutes, rest for 5, repeat. It sounds too simple to matter, yet timed rounds and breaks fix two of the hardest parts of focused work: starting, and stopping before you burn out.",
  published: "2026-10-20",
  updated: "2026-10-20",
  reviewed: false,
  listen: [
    { label: "Start a 25/5 Pomodoro", path: "/pomodoro/25-5" },
    { label: "Play brown noise", path: "/sounds/brown-noise" },
  ],
  sections: [
    {
      heading: "Where it comes from",
      body: [
        "Francesco Cirillo developed the technique as a university student in the late 1980s, using a tomato-shaped kitchen timer (pomodoro is Italian for tomato). He later wrote it up as a method and still teaches it. The core is small enough to fit on an index card, which is a large part of its appeal.",
      ],
    },
    {
      heading: "The basic method",
      body: [
        {
          list: [
            "**Choose one task.** Write it down so it is concrete.",
            "**Set a timer for 25 minutes** and work only on that task until it rings.",
            "**Record the interruptions** that pop into your head on paper instead of acting on them.",
            "**Take a 5-minute break** when the timer rings, away from the task.",
            "**After four rounds, take a longer break** of 15 to 30 minutes.",
          ],
        },
        "Each 25-minute round is one pomodoro. Counting them turns vague effort into something measurable: a report becomes “about six pomodoros”, which makes planning a day far more realistic.",
      ],
    },
    {
      heading: "Why it works",
      body: [
        "**It makes starting cheap.** Committing to 25 minutes is much easier than committing to “finish the report”. Once you have started, momentum usually carries you.",
        "**It protects attention.** For the length of a round you have one job. Writing distractions down rather than acting on them keeps the round intact without losing the thought.",
        "**It schedules rest before you need it.** Breaks arrive on a timer, not when you are already exhausted, which helps you keep going through a long day.",
        "There is some research support for that last point. A 2023 study of university students compared taking a 6-minute break after every 24 minutes of study, close to the Pomodoro rhythm, with taking breaks whenever they chose. Students who self-regulated studied and rested for longer stretches, but reported more fatigue and distraction and less concentration and motivation. Both groups got the same amount done, so the systematic breaks achieved it in less time and with a better mood.",
      ],
    },
    {
      heading: "Adapting the rhythm",
      body: [
        "Twenty-five minutes is a starting point, not a rule. Many people lengthen the rounds once the habit is established:",
        {
          list: [
            "**[25/5](/pomodoro/25-5):** the classic, best for starting, admin and study.",
            "**[50/10](/pomodoro/50-10):** the same ratio with deeper rounds, popular with writers and developers.",
            "**[52/17](/pomodoro/52-17):** from a 2014 analysis by the time-tracking company DeskTime of how its most productive users worked. When DeskTime repeated the analysis in 2021 the pattern had shifted to much longer sessions, a reminder that these are observations, not laws.",
            "**[90/20](/pomodoro/90-20):** one long, deep block with a proper rest, for the hardest task of the day.",
          ],
        },
        "If you are struggling to finish rounds, go shorter; if you keep resenting the timer for interrupting good flow, go longer. The point is regular, protected focus followed by real rest.",
      ],
    },
    {
      heading: "Making breaks count",
      body: [
        "A break spent scrolling a phone is not much of a break. Stand up, move, drink water and look at something far away. Leave the task genuinely alone: the most common Pomodoro mistake is shortening or skipping breaks, which feels productive for an hour and costs you the afternoon.",
        "Changing the soundscape helps mark the difference. Play steady sound such as [brown noise](/sounds/brown-noise) or [rain](/mix/rain-sounds) while you work, and pause it for the break, so silence becomes the signal to rest.",
      ],
    },
    {
      heading: "Using Focuship as a Pomodoro timer",
      body: [
        "Focuship’s [focus timer](/timer) runs the full cycle: focus rounds, short breaks and a long break after every fourth round, with a soft chime at each change. It counts the rounds you complete each day, can auto-start the next phase and can notify you when the tab is in the background. Open focus mode for a large countdown that keeps the screen awake, and every length can be changed in the settings.",
        "Pomodoro® and Pomodoro Technique® are registered trademarks of Francesco Cirillo. Focuship is not affiliated with him.",
      ],
    },
  ],
  faq: [
    {
      q: "What should I do if I’m interrupted during a pomodoro?",
      a: "If the interruption can wait, note it and carry on. If it can’t, stop, deal with it and start a fresh round afterwards rather than counting the broken one.",
    },
    {
      q: "Is 25 minutes too short for deep work?",
      a: "For some work it is. Try 50/10 or 90/20 once the habit is in place; the principle of protected focus and planned rest is what matters.",
    },
    {
      q: "Does the Pomodoro Technique work for studying?",
      a: "It is widely used for study, and a 2023 study found that students taking regular timed breaks reported less fatigue and better concentration than those taking breaks whenever they liked, while getting the same amount done.",
    },
    {
      q: "Can I listen to music during a pomodoro?",
      a: "Many people do. Wordless sound such as noise, rain or ambient tends to distract less than songs with lyrics, especially for reading and writing.",
    },
  ],
  sources: [
    {
      title: "What is the Pomodoro® Technique",
      publication: "Francesco Cirillo, pomodorotechnique.com",
      year: 2026,
      url: "https://www.pomodorotechnique.com/what-is-the-pomodoro-technique.php",
    },
    {
      title: "Understanding effort regulation: Comparing ‘Pomodoro’ breaks and self-regulated breaks",
      publication: "British Journal of Educational Psychology",
      year: 2023,
      url: "https://doi.org/10.1111/bjep.12593",
    },
    {
      title: "Productivity research, experiments and statistics: DeskTime’s best findings",
      publication: "DeskTime",
      year: 2021,
      url: "https://desktime.com/blog/productivity-research",
    },
  ],
  related: ["/pomodoro/25-5", "/pomodoro/50-10", "/pomodoro/90-20", "/timer", "/sounds/brown-noise"],
};
