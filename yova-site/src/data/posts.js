// Add new posts to the top of this array. Block types: h2, p, ul, steps, callout, shots.
export const posts = [
  {
    slug: 'meet-yova',
    title: 'Meet YOVA: one assistant for your questions, schedule, notes and tasks',
    excerpt: 'What YOVA is, what you can do with it, and how the home screen keeps your day together.',
    date: '2026-10-03',
    tag: 'Announcement',
    cover: { shot: 'y5', from: '#3a2e25', to: '#8a5a2b' },
    blocks: [
      { t: 'p', text: 'YOVA is a virtual assistant for Android. It does two jobs in one app: you can chat with it when you have a question, and you can use it to keep track of the things you need to remember.' },
      { t: 'h2', text: 'What is on the home screen' },
      { t: 'ul', items: ['A greeting with today\'s date, so you always know where you are.', 'A search bar for your tasks, notes and events.', 'A Schedule card where you add events with a title, a day and a time.', 'A Notes card for quick notes.', 'A Tasks checklist, and a Brainstorm card with an idea to think about.'] },
      { t: 'shots', ids: ['y5', 'y3', 'y1'], caption: 'Home, tasks and ideas, and chat.' },
      { t: 'h2', text: 'Three tabs, nothing hidden' },
      { t: 'p', text: 'The bottom bar has Home, YoVA and More. Home is your day, YoVA is the chat, and More holds your profile, notifications, settings and help.' },
      { t: 'callout', text: 'Want to try it? Download the Android app with the button at the bottom of this page.' },
    ],
  },
  {
    slug: 'plan-your-day',
    title: 'Plan your day with Schedule, Notes and Tasks',
    excerpt: 'A short walkthrough of the three cards on your home screen, from adding an event to ticking off a task.',
    date: '2026-10-03',
    tag: 'Guide',
    cover: { shot: 'y2', from: '#6b3d38', to: '#b0674f' },
    blocks: [
      { t: 'p', text: 'The home screen is built so you can capture something in a few seconds and get back to what you were doing.' },
      { t: 'steps', items: [
        ['Add an event', 'In the Schedule card, type an event title, a day (for example Monday) and a time (for example 10:00 AM), then tap Add Event.'],
        ['Write a note', 'In the Notes card, add a title and the content of your note, then tap the plus button to save it.'],
        ['Open a note', 'Tap any note to read it in full. From there you can tap Edit to change it or Delete to remove it.'],
        ['Add a task', 'Use the plus button on the Tasks card. Tick the box when it is done. The card shows how many tasks you have completed.'],
        ['Find anything', 'Use the search bar at the top of the home screen to look through your tasks, notes and events.'],
      ] },
      { t: 'shots', ids: ['y5', 'y2', 'y3'], caption: 'Schedule and notes, a note open for editing, and the task list.' },
      { t: 'callout', text: 'Tip: a note works well as a scratchpad. A note called Project Ideas can hold a few bullet-style thoughts you want to come back to.' },
    ],
  },
  {
    slug: 'brainstorm-ideas',
    title: 'Stuck? Use the Brainstorm card to get a new idea',
    excerpt: 'How the idea cards work, and how to turn a good one into a note or a task.',
    date: '2026-10-03',
    tag: 'Tip',
    cover: { shot: 'y3', from: '#b8801a', to: '#f6c453' },
    blocks: [
      { t: 'p', text: 'Below your schedule and notes you will find the Brainstorm card. It shows one idea at a time, with a category tag, a title and a short description.' },
      { t: 'h2', text: 'Get another idea' },
      { t: 'p', text: 'Tap the refresh icon on the card to see a new idea. The footer of the card tells you how many ideas there are in total, so you know there is plenty to go through.' },
      { t: 'h2', text: 'Keep the good ones' },
      { t: 'ul', items: ['Copy the idea into a note with your own twist on it.', 'Add the first small step as a task so it does not stay an idea.', 'Ask YoVA in the chat to help you think it through.'] },
      { t: 'shots', ids: ['y3', 'y1'], caption: 'The Brainstorm card, and the chat.' },
    ],
  },
  {
    slug: 'install-the-apk',
    title: 'How to install the YOVA APK on Android',
    excerpt: 'Downloading straight from the website? Here is how to install it safely.',
    date: '2026-10-03',
    tag: 'Guide',
    cover: { shot: 'y4', from: '#241c16', to: '#6b3d38' },
    blocks: [
      { t: 'p', text: 'You can download YOVA directly from this website as an APK file. Android treats files from outside the Play Store with extra care, so you may see a couple of prompts. That is normal.' },
      { t: 'steps', items: [
        ['Download the file', 'Tap Download APK on this site. Your browser may warn that this type of file can be harmful. Choose to keep it if you downloaded it from this website.'],
        ['Open the file', 'Tap the finished download in your notification bar, or find yova.apk in your Downloads folder.'],
        ['Allow the install', 'If Android asks, allow your browser (or files app) to install apps from this source. This is a one-time permission for that app, and you can switch it off again afterwards.'],
        ['Install and open', 'Tap Install, then Open.'],
      ] },
      { t: 'callout', text: 'Only install the app from this website or from the official store listing. Do not install copies sent by strangers.' },
    ],
  },
]
export const getPost = (slug) => posts.find((p) => p.slug === slug)
export const readingTime = (p) => {
  const words = p.blocks.map((b) => (b.text ?? (b.items ?? []).flat().join(' '))).join(' ').split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}
export const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
