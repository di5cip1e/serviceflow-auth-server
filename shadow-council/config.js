// Game configuration and constants

export const QUESTIONS = [
  {
    text: "A neighboring kingdom threatens war unless you surrender valuable territory. How do you respond?",
    options: [
      { text: "Defend our lands with military force", weights: { autocracy: 2, militarism: 2 } },
      { text: "Negotiate a diplomatic solution", weights: { democracy: 2, diplomacy: 1 } },
      { text: "Consult religious leaders for divine guidance", weights: { theocracy: 3 } },
      { text: "Let the people vote on our response", weights: { democracy: 3 } }
    ]
  },
  {
    text: "Your treasury is running low. How will you raise funds?",
    options: [
      { text: "Increase taxes on the wealthy elite", weights: { democracy: 2, populism: 1 } },
      { text: "Seize resources through conquest", weights: { autocracy: 2, militarism: 2 } },
      { text: "Collect religious tithes from the faithful", weights: { theocracy: 3 } },
      { text: "Encourage trade and commerce", weights: { oligarchy: 2, democracy: 1 } }
    ]
  },
  {
    text: "A plague spreads through your cities. What is your priority?",
    options: [
      { text: "Quarantine cities by military force", weights: { autocracy: 2, militarism: 1 } },
      { text: "Organize community healing efforts", weights: { democracy: 2, populism: 1 } },
      { text: "Prayer and divine intervention", weights: { theocracy: 3 } },
      { text: "Fund research by wealthy patrons", weights: { oligarchy: 2 } }
    ]
  },
  {
    text: "A powerful merchant guild demands representation in government. How do you respond?",
    options: [
      { text: "Grant them seats in the council", weights: { oligarchy: 3, democracy: 1 } },
      { text: "Refuse and maintain centralized power", weights: { autocracy: 3 } },
      { text: "Only if they pledge to the faith", weights: { theocracy: 2, oligarchy: 1 } },
      { text: "Let citizens decide through referendum", weights: { democracy: 3 } }
    ]
  },
  {
    text: "Your realm discovers rich resources in a disputed borderland. What do you do?",
    options: [
      { text: "Claim it by military might", weights: { autocracy: 2, militarism: 2 } },
      { text: "Negotiate shared access", weights: { democracy: 2, diplomacy: 1 } },
      { text: "Declare it sacred land under divine right", weights: { theocracy: 3 } },
      { text: "Allow private companies to exploit it", weights: { oligarchy: 3 } }
    ]
  }
];

export const GOVERNMENT_TYPES = {
  autocracy: {
    name: "Autocracy",
    description: "Power is concentrated in the hands of a single ruler. The AI Ruler values order, control, and decisive action above all else."
  },
  democracy: {
    name: "Democracy",
    description: "The people hold power through representation. The AI Ruler must balance diverse interests and maintain popular support."
  },
  theocracy: {
    name: "Theocracy",
    description: "Religious authority guides the realm. The AI Ruler interprets divine will and moral law in all decisions."
  },
  oligarchy: {
    name: "Oligarchy",
    description: "A council of wealthy elites holds power. The AI Ruler prioritizes economic prosperity and the interests of the privileged class."
  },
  militarism: {
    name: "Military Junta",
    description: "Military strength defines the state. The AI Ruler values expansion, martial prowess, and strategic dominance."
  }
};

export const POSITIVE_TRAITS = [
  {
    id: 'brilliant',
    name: 'Brilliant',
    cost: 2,
    description: 'Exceptional strategic thinking and problem-solving ability',
    impact: 'Ruler makes highly intelligent decisions and sees through complex political situations'
  },
  {
    id: 'charismatic',
    name: 'Charismatic',
    cost: 2,
    description: 'Natural ability to inspire loyalty and persuade others',
    impact: 'Ruler easily gains support and sways opinions in their favor'
  },
  {
    id: 'just',
    name: 'Just',
    cost: 1,
    description: 'Fair and balanced in judgment',
    impact: 'Ruler considers ethics and fairness when making decisions'
  },
  {
    id: 'decisive',
    name: 'Decisive',
    cost: 2,
    description: 'Acts quickly and confidently without hesitation',
    impact: 'Ruler makes swift decisions in critical moments'
  },
  {
    id: 'diplomatic',
    name: 'Diplomatic',
    cost: 2,
    description: 'Skilled at negotiation and peaceful resolutions',
    impact: 'Ruler prefers negotiation over conflict and finds common ground'
  },
  {
    id: 'ambitious',
    name: 'Ambitious',
    cost: 1,
    description: 'Driven to expand power and territory',
    impact: 'Ruler pursues growth and expansion opportunities aggressively'
  },
  {
    id: 'pious',
    name: 'Pious',
    cost: 1,
    description: 'Deeply religious and morally guided',
    impact: 'Ruler considers religious doctrine and moral principles in decisions'
  },
  {
    id: 'merciful',
    name: 'Merciful',
    cost: 1,
    description: 'Shows compassion and leniency',
    impact: 'Ruler is forgiving and avoids harsh punishments'
  },
  {
    id: 'shrewd',
    name: 'Shrewd',
    cost: 2,
    description: 'Cunning and perceptive in political matters',
    impact: 'Ruler identifies deception and makes calculated strategic moves'
  },
  {
    id: 'brave',
    name: 'Brave',
    cost: 1,
    description: 'Fearless in the face of danger',
    impact: 'Ruler takes bold risks and stands firm under pressure'
  }
];

export const NEGATIVE_TRAITS = [
  {
    id: 'cruel',
    name: 'Cruel',
    refund: 2,
    description: 'Takes pleasure in harsh punishments',
    impact: 'Ruler inflicts severe consequences and rules through fear'
  },
  {
    id: 'paranoid',
    name: 'Paranoid',
    refund: 2,
    description: 'Distrusts everyone and sees threats everywhere',
    impact: 'Ruler suspects betrayal and acts defensively, even against allies'
  },
  {
    id: 'greedy',
    name: 'Greedy',
    refund: 1,
    description: 'Obsessed with wealth and treasure',
    impact: 'Ruler prioritizes economic gain over other considerations'
  },
  {
    id: 'wrathful',
    name: 'Wrathful',
    refund: 2,
    description: 'Quick to anger and retaliate',
    impact: 'Ruler responds with fury to slights and challenges'
  },
  {
    id: 'slothful',
    name: 'Slothful',
    refund: 2,
    description: 'Lazy and avoids difficult work',
    impact: 'Ruler delays decisions and ignores pressing matters'
  },
  {
    id: 'arrogant',
    name: 'Arrogant',
    refund: 1,
    description: 'Overconfident and dismissive of others',
    impact: 'Ruler ignores advice and underestimates threats'
  },
  {
    id: 'weak',
    name: 'Weak-Willed',
    refund: 2,
    description: 'Easily influenced and indecisive',
    impact: 'Ruler is swayed by others and struggles to commit to decisions'
  },
  {
    id: 'hateful',
    name: 'Hateful',
    refund: 1,
    description: 'Harbors deep prejudices and grudges',
    impact: 'Ruler shows favoritism and discrimination based on biases'
  },
  {
    id: 'impulsive',
    name: 'Impulsive',
    refund: 1,
    description: 'Acts without thinking through consequences',
    impact: 'Ruler makes rash decisions without proper consideration'
  },
  {
    id: 'stubborn',
    name: 'Stubborn',
    refund: 1,
    description: 'Refuses to change course or admit mistakes',
    impact: 'Ruler clings to failing strategies and ignores new information'
  }
];

export const MAX_STAT_POINTS = 7;
export const MAX_NEGATIVE_TRAITS = 3;

// World Generation Constants
export const WORLD_CONFIG = {
  mapWidth: 100,
  mapHeight: 100,
  minNations: 3,
  maxNations: 9,
  initialCityPopulation: 5000,
  populationGrowthRate: 0.02, // 2% per turn
  influenceGrowthRate: 0.5, // tiles per turn
  citySizeThresholds: {
    small: 5000,
    medium: 15000,
    large: 40000,
    huge: 100000
  }
};

export const BIOMES = {
  ocean: {
    name: 'Ocean',
    color: '#1a3a52',
    fertility: 0,
    movementCost: 2,
    canSettle: false
  },
  desert: {
    name: 'Desert',
    color: '#d4a574',
    fertility: 0.2,
    movementCost: 1.5,
    canSettle: true
  },
  arctic: {
    name: 'Arctic',
    color: '#e8f4f8',
    fertility: 0.1,
    movementCost: 2,
    canSettle: true
  },
  plains: {
    name: 'Plains',
    color: '#7db87d',
    fertility: 0.8,
    movementCost: 1,
    canSettle: true
  },
  forest: {
    name: 'Forest',
    color: '#2d5c2d',
    fertility: 0.6,
    movementCost: 1.2,
    canSettle: true
  },
  mountains: {
    name: 'Mountains',
    color: '#6b5d54',
    fertility: 0.3,
    movementCost: 3,
    canSettle: true
  }
};

export const NATION_COLORS = [
  '#c94a4a', // Red
  '#4a7dc9', // Blue
  '#c9a84a', // Gold
  '#4ac97d', // Green
  '#a84ac9', // Purple
  '#c9774a', // Orange
  '#4ac9c9', // Cyan
  '#c94a8f', // Pink
  '#7dc94a'  // Lime
];

// AI Ruler name generation
export const RULER_NAMES = {
  male: [
    'Aldric', 'Brennan', 'Cedric', 'Dorian', 'Eamon', 'Fenris', 'Gareth', 'Hadrian',
    'Ignatius', 'Jareth', 'Kaelan', 'Lysander', 'Magnus', 'Nero', 'Oberon', 'Percival',
    'Quintus', 'Ragnar', 'Soren', 'Theron', 'Ulrich', 'Valen', 'Wulfric', 'Xerxes'
  ],
  female: [
    'Althea', 'Beatrix', 'Celestia', 'Drusilla', 'Elara', 'Fiona', 'Guinevere', 'Helena',
    'Isolde', 'Juliana', 'Katarina', 'Lysandra', 'Morgana', 'Nerissa', 'Ophelia', 'Persephone',
    'Quintessa', 'Ravenna', 'Seraphina', 'Thalia', 'Ursula', 'Vivienne', 'Winifred', 'Xanthe'
  ],
  nonbinary: [
    'Avery', 'Blake', 'Cameron', 'Dakota', 'Ellis', 'Finley', 'Gray', 'Hayden',
    'Indigo', 'Jordan', 'Kai', 'Logan', 'Morgan', 'Nova', 'Oracle', 'Phoenix',
    'Quinn', 'River', 'Sage', 'Taylor', 'Unity', 'Vale', 'Winter', 'Zephyr'
  ]
};

export const NATION_NAMES = [
  'Valdoria', 'Thornreach', 'Aethermoor', 'Ironhold', 'Silverpeak', 'Stormhaven',
  'Emberfall', 'Frostwind', 'Goldencrest', 'Shadowvale', 'Crimsonmarsh', 'Azurekeep',
  'Obsidianspire', 'Verdantwood', 'Ashencrown', 'Crystalmere', 'Duskforge', 'Radiantveil',
  'Nightbloom', 'Sunforge', 'Mistral', 'Starholm', 'Ravenwatch', 'Dragonmarch'
];

export const CAPITAL_NAMES = [
  'Irongate', 'Thornkeep', 'Silvermist', 'Goldenheart', 'Shadowpeak', 'Crystalfall',
  'Emberwatch', 'Frostholm', 'Stormbreak', 'Ashenfort', 'Radiantspire', 'Nightveil',
  'Sunhaven', 'Starbridge', 'Ravenhold', 'Dragonport', 'Mistwood', 'Azuredeep',
  'Crimsongate', 'Obsidiankeep', 'Verdantcrown', 'Duskwater', 'Moonshade', 'Daybreak'
];
