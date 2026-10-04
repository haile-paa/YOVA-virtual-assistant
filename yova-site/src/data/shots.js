// Screenshot files live in /public/shots. Swap files or edit captions here.
export const SHOT_RATIO = 2270 / 1080
export const shotSrc = (id) => `/shots/${id}.webp`

// Powers the feature explorer on the home page.
export const features = [
  { id: 'y5', key: 'home', title: 'Your day on one screen', text: 'Open the app and see your schedule, notes, tasks and a fresh idea together, with one search bar above them all.' },
  { id: 'y1', key: 'chat', title: 'Ask YoVA anything', text: 'Chat with your assistant. Start a new chat any time, or go back through your chat history.' },
  { id: 'y2', key: 'notes', title: 'Notes you can open, edit and delete', text: 'Tap a note to read it in full, then edit it or delete it. Give each note a title and your own words.' },
  { id: 'y3', key: 'tasks', title: 'Tasks and brainstorm ideas', text: 'Tick off tasks as you go, and tap refresh on the idea card when you want a new idea to think about.' },
  { id: 'y4', key: 'more', title: 'Profile, notifications and quick settings', text: 'Everything you set up lives in the More tab, with switches for notifications and sound.' },
]
