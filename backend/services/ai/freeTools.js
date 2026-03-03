const freeTools = [
  {
    name: 'Google Gemini',
    category: 'text',
    url: 'https://gemini.google.com',
    description: 'Free conversational and text generation assistant.',
    tags: ['text', 'bundle']
  },
  {
    name: 'Microsoft Copilot',
    category: 'text',
    url: 'https://copilot.microsoft.com',
    description: 'Free assistant for writing and quick ideation.',
    tags: ['text', 'bundle']
  },
  {
    name: 'Claude.ai',
    category: 'text',
    url: 'https://claude.ai',
    description: 'Strong long-form drafting and editing support.',
    tags: ['text', 'bundle']
  },
  {
    name: 'Bing Image Creator',
    category: 'image',
    url: 'https://www.bing.com/create',
    description: 'Free image generation from prompts.',
    tags: ['image']
  },
  {
    name: 'Leonardo.ai',
    category: 'image',
    url: 'https://leonardo.ai',
    description: 'Image generation with free-tier credits.',
    tags: ['image']
  },
  {
    name: 'Gamma.app',
    category: 'presentation',
    url: 'https://gamma.app',
    description: 'Generate slide-style presentations from prompts.',
    tags: ['presentation', 'bundle']
  }
];

const CATEGORY_ALIASES = {
  text: [
    'text',
    'chat',
    'kmzh',
    'worksheet',
    'metin',
    'matin',
    'мэтiн генерациялау',
    'мәтін генерациялау'
  ],
  image: [
    'image',
    'images',
    'picture',
    'photo',
    'surret',
    'сурет генерациялау'
  ],
  presentation: [
    'presentation',
    'slides',
    'slideshow',
    'презентация'
  ],
  bundle: [
    'bundle',
    'package',
    'all',
    'everything'
  ]
};

function normalizeCategory(input) {
  if (!input) return null;
  const value = String(input).trim().toLowerCase();

  for (const [key, aliases] of Object.entries(CATEGORY_ALIASES)) {
    if (aliases.some((alias) => value.includes(alias))) {
      return key;
    }
  }

  return null;
}

function getFreeToolsByCategory(category) {
  const resolved = normalizeCategory(category);
  if (!resolved) return freeTools;
  if (resolved === 'bundle') {
    return freeTools.filter((tool) => tool.tags.includes('bundle') || tool.tags.includes('text'));
  }
  return freeTools.filter((tool) => tool.tags.includes(resolved));
}

module.exports = {
  freeTools,
  getFreeToolsByCategory
};
