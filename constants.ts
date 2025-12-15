import { Topic } from './types';

export const INITIAL_TOPICS: Topic[] = [
  {
    id: 'hello-world',
    title: 'Hello World',
    prompt: 'Show me a minimal "Hello World" example in Ratatui using Crossterm.',
    icon: 'terminal'
  },
  {
    id: 'layout',
    title: 'Layout & Splits',
    prompt: 'How do I use Layout to split the screen vertically and horizontally? Explain constraints.',
    icon: 'layout'
  },
  {
    id: 'widgets-paragraph',
    title: 'Paragraph Widget',
    prompt: 'How do I style text using the Paragraph widget? Show text alignment and colors.',
    icon: 'text'
  },
  {
    id: 'widgets-list',
    title: 'List & Selection',
    prompt: 'Create an interactive List widget example where I can select items with up/down keys.',
    icon: 'widget'
  },
  {
    id: 'widgets-table',
    title: 'Table Widget',
    prompt: 'How do I render a Table with headers and rows in Ratatui?',
    icon: 'widget'
  },
  {
    id: 'events',
    title: 'Event Handling',
    prompt: 'Explain the event loop pattern for handling keyboard inputs in a Ratatui app.',
    icon: 'event'
  },
  {
    id: 'popups',
    title: 'Popups / Layers',
    prompt: 'How do I create a centered popup modal on top of other content?',
    icon: 'layers'
  }
];