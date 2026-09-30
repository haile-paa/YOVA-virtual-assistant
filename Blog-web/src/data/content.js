// ---- App download settings ----
// 1) Put your app file in /public/downloads/ (e.g. public/downloads/yova.apk)
// 2) Make sure `file` below matches the file name
export const appDownload = {
  file: "/downloads/yova.apk", // change if your file has another name (.apk, .aab, .ipa...)
  filename: "YOVA.apk", // name users see when it downloads
};

// Edit blog posts and feature copy here.

export const blogPosts = [
  {
    s: "why-i-built-yova",
    c: "Origin story",
    t: "6 min read",
    d: "Jul 25, 2026",
    title: "Why I built YOVA: one calm home screen for the whole day",
    ex: "My schedule lived in one app, notes in another, and to-dos on a sticky note. YOVA puts them on one screen.",
    img: "home",
    b: [
      [
        "p",
        "Most mornings started the same way: check the calendar, open a notes app, remember a to-do from a chat, then lose ten minutes deciding what mattered. None of those apps were bad. There were just too many of them.",
      ],
      ["h", "The idea: a home base, not another tool"],
      [
        "p",
        "YOVA is a personal home base. When you open it, you see a greeting, today's date, your schedule, your notes, and a search bar that looks across all of them. No setup, no folders to organize first.",
      ],
      [
        "ul",
        [
          "Schedule, notes, and tasks share one dashboard",
          "One search bar for tasks, notes, and events",
          "An AI assistant one tap away in the tab bar",
        ],
      ],
      ["h", "Keeping it calm"],
      [
        "p",
        "The warm dark theme is deliberate. A productivity app is something you open many times a day, so it should be easy on the eyes and quiet about it. Amber is used only for things you can act on.",
      ],
    ],
  },
  {
    s: "schedule-notes-tasks",
    c: "Design",
    t: "5 min read",
    d: "Jul 26, 2026",
    title: "Designing the dashboard: schedule, notes, and tasks side by side",
    ex: "Why adding an event takes three fields, and why notes sit right next to your schedule.",
    img: "dash",
    b: [
      [
        "p",
        "The dashboard has one job: show you the day without asking you to dig for it. Everything else in the design follows from that.",
      ],
      ["h", "Three fields to add an event"],
      [
        "p",
        "An event has a title, a day, and a time. That is all the form asks for, so adding one takes seconds. If it takes longer than writing on a sticky note, people go back to sticky notes.",
      ],
      ["h", "Notes beside the schedule"],
      [
        "p",
        "Notes often belong to a meeting or a plan. Placing them next to the schedule means you can see both without switching screens. Tap a note to open it, then edit or delete it. Each note keeps a timestamp so you know when the thought was captured.",
      ],
      [
        "ul",
        [
          "Bullet-style notes for quick thoughts",
          "A floating add button on the home screen",
          "Search that covers events, notes, and tasks",
        ],
      ],
    ],
  },
  {
    s: "ask-yova-anything",
    c: "AI",
    t: "5 min read",
    d: "Jul 27, 2026",
    title:
      "Ask YoVA anything: adding an AI assistant without making it the whole app",
    ex: "The chat lives in its own tab so the dashboard stays fast and simple.",
    img: "chat",
    b: [
      [
        "p",
        "It is tempting to build an AI app where everything is a chat box. YOVA does the opposite: the dashboard comes first, and the assistant is one tap away in the tab bar.",
      ],
      ["h", "What the assistant is for"],
      [
        "p",
        "YoVA answers questions, explains topics, and helps you write or brainstorm ideas. Conversations are saved in your chat history, so you can pick a thread up later or start a new one with the plus button.",
      ],
      ["h", "Why a separate tab"],
      [
        "p",
        "A dedicated tab keeps the chat from crowding your schedule. You go to it when you want help, and go back to Home when you want to see your day.",
      ],
    ],
  },
  {
    s: "brainstorm-ideas-refresh",
    c: "Product",
    t: "4 min read",
    d: "Jul 28, 2026",
    title: "35+ business ideas and one refresh button",
    ex: "The Brainstorm card is a small feature for the days you need a spark.",
    img: "tasks",
    b: [
      [
        "p",
        "Next to your tasks sits a yellow card called Brainstorm Idea. It shows one categorized business idea at a time, like a template marketplace where people sell productivity workflows.",
      ],
      ["h", "How it works"],
      [
        "p",
        "Tap refresh to see another idea. There are more than 35 in the deck, each with a category tag, a title, and a short description. It is meant to be browsed one card at a time, not scrolled through as a feed.",
      ],
      [
        "ul",
        [
          "A category tag on every idea",
          "One idea per card, so nothing competes for attention",
          "A running total so you know how many are left to discover",
        ],
      ],
      [
        "p",
        "Next to it, the task list shows how many are completed, so ideas and actions stay in the same place.",
      ],
    ],
  },
];
const F = [
  [
    "Your day, at a glance",
    "A greeting, today's date, and your schedule and notes as soon as you open the app.",
    [
      "Add events with a title, day, and time",
      "Pin quick notes next to your schedule",
      "Search everything from one bar",
    ],
    "home",
  ],
  [
    "Notes that stay handy",
    "Jot a title and content, then open any note to edit or delete it.",
    [
      "Tap a note to view, edit, or delete",
      "Bullet-style thoughts with a timestamp",
      "Add a note with one tap",
    ],
    "dash",
  ],
  [
    "Tasks and ideas, one tap away",
    "Check off to-dos and refresh a stream of business ideas when you need a spark.",
    [
      "See how many tasks are completed",
      "Refresh for a new categorized idea",
      "35+ ideas to browse",
    ],
    "tasks",
  ],
  [
    "Ask YoVA anything",
    "A built-in assistant for questions, ideas, and everyday help.",
    [
      "Conversations saved in chat history",
      "Answers, info, and text ideas",
      "One tap from Home and More",
    ],
    "chat",
  ],
  [
    "Your account, under control",
    "Profile, notifications, settings, and quick toggles on the More screen.",
    [
      "Profile, Notifications, Settings, Help & Support",
      "Quick toggles for notifications and sound",
      "Log out from the same screen",
    ],
    "more",
  ],
];

export const features = F.map(([title, desc, list, img]) => ({
  title,
  desc,
  list,
  img,
}));
export const screen = (k) => `/screens/${k}.jpg`;
