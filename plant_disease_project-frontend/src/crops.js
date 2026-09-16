export const cropData = [
  { name: 'Apple', icon: 'apple', diseases: 4 },
  { name: 'Blueberry', icon: 'blueberry', diseases: 1 },
  { name: 'Cherry', icon: 'cherry', diseases: 2 },
  { name: 'Corn (Maize)', icon: 'corn', diseases: 4 },
  { name: 'Cotton', icon: 'cotton', diseases: 7 },
  { name: 'Grape', icon: 'grape', diseases: 4 },
  { name: 'Mango', icon: 'mango', diseases: 8 },
  { name: 'Orange', icon: 'orange', diseases: 1 },
  { name: 'Peach', icon: 'peach', diseases: 2 },
  { name: 'Pepper (Bell)', icon: 'pepper', diseases: 2 },
  { name: 'Potato', icon: 'potato', diseases: 3 },
  { name: 'Raspberry', icon: 'raspberry', diseases: 1 },
  { name: 'Rice', icon: 'rice', diseases: 6 },
  { name: 'Soybean', icon: 'soybean', diseases: 1 },
  { name: 'Squash', icon: 'squash', diseases: 1 },
  { name: 'Strawberry', icon: 'strawberry', diseases: 2 },
  { name: 'Tomato', icon: 'tomato', diseases: 10 }
];

export function getCropIcon(name) {
  const icons = {
    apple: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/><path d="M12 6v6l4 2"/></svg>',
    blueberry: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    cherry: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 14c0 3.31 2.69 6 6 6s6-2.69 6-6"/><path d="M8 14V8a4 4 0 0 1 8 0v6"/><circle cx="8" cy="14" r="2"/><circle cx="16" cy="14" r="2"/></svg>',
    corn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20"/><path d="M8 6h8"/><path d="M6 12h12"/><path d="M8 18h8"/></svg>',
    cotton: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="8"/><path d="M12 4v4M12 16v4M4 12h4M16 12h4"/></svg>',
    grape: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="4"/><circle cx="16" cy="8" r="4"/><circle cx="12" cy="14" r="4"/><circle cx="8" cy="20" r="4"/><circle cx="16" cy="20" r="4"/></svg>',
    mango: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"/></svg>',
    orange: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/></svg>',
    peach: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"/><path d="M12 6v6"/></svg>',
    pepper: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"/><path d="M12 6v6"/></svg>',
    potato: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="12" rx="8" ry="5"/></svg>',
    raspberry: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><circle cx="12" cy="14" r="3"/><circle cx="8" cy="20" r="3"/><circle cx="16" cy="20" r="3"/></svg>',
    rice: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 20h16"/><path d="M4 14h16"/><path d="M4 8h16"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
    soybean: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20"/><ellipse cx="12" cy="8" rx="6" ry="3"/><ellipse cx="12" cy="16" rx="6" ry="3"/></svg>',
    squash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"/></svg>',
    strawberry: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z"/><path d="M8 12h8"/><path d="M12 8v8"/><circle cx="12" cy="12" r="2"/></svg>',
    tomato: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>'
  };
  return icons[name] || icons.apple;
}