import type { Project } from './types';

export const projects: Project[] = [
  {
    slug: 'daggerheart-card-creator',
    name: 'DaggerheartCardCreator',
    title: 'Daggerheart Card Creator',
    tagline: 'Official homebrew & CGL tool',
    year: '2023–present',
    team: 'PixelTable × Critical Role × Darrington Press',
    stack: ['React', 'TypeScript'],
    links: [{ label: 'Open the Card Creator', href: 'https://www.daggerheart.com/card-creator' }],
    screenshot: { src: '/projects/daggerheart-card-creator.webp', alt: 'The Daggerheart Card Creator editing a custom domain card' },
    nodes: {
      problem: {
        body: 'Daggerheart players wanted to make homebrew cards that looked and felt official, and creators publishing under the Community Game License needed a sanctioned way to produce them. Hand-built templates in image editors were slow, inconsistent and easy to get wrong.',
      },
      myRole: {
        body: 'As CXO and Principal Engineer at PixelTable I owned the experience end to end: shaping the editor flow with Critical Role and Darrington Press, building core editor features hands-on, and keeping every template faithful to the printed game.',
      },
      architecture: {
        body: 'A template-driven editor: each card type is described as data, and the same description drives both the live on-screen preview and the export, so what a creator sees is exactly what they download as PDF or PNG, on desktop or mobile.',
      },
      hardParts: {
        body: 'Pixel-perfect parity between the preview and exported files across browsers, keeping text fitting and layout stable as creators type, and making a dense, print-oriented editor genuinely comfortable to use on a phone.',
      },
      outcome: {
        body: 'Shipped as the official Daggerheart homebrew tool, with customisable templates, PDF and PNG export, and support for Community Game License submissions, so the community can create content that sits alongside official cards.',
      },
    },
    reviewed: false,
  },
  {
    slug: 'alice-is-missing',
    name: 'AliceIsMissing',
    title: 'Alice is Missing: Digital Edition',
    tagline: 'A silent, real-time mystery',
    year: '2023–present',
    team: 'PixelTable',
    stack: ['React', 'TypeScript', 'Real-time messaging'],
    links: [{ label: 'Play Alice is Missing', href: 'https://aliceismissing.com' }],
    screenshot: { src: '/projects/alice-is-missing.webp', alt: 'Players exchanging in-character text messages during a session' },
    nodes: {
      problem: {
        body: 'Alice is Missing is a silent role-playing game: for ninety minutes players never speak and only text each other in character. Bringing that to the web meant recreating the tension of a group chat without breaking the spell of the table.',
      },
      myRole: {
        body: 'I led the experience and front-end engineering, turning the tabletop rules into an interface that disappears: messaging, timed clue reveals and character information that players reach for without ever stopping to think about the tool.',
      },
      architecture: {
        body: 'Real-time sessions connect every player to a shared game state. Messages, clue cards and the session timer are driven by that state, so each device shows the same story at the same moment while each player keeps their own private view.',
      },
      hardParts: {
        body: 'Keeping a ninety-minute live session in sync when players drop and rejoin, pacing timed reveals so they land together, and designing a chat that feels like a real phone conversation rather than a game menu.',
      },
      outcome: {
        body: 'A live digital edition that preserves what makes the tabletop game special: collaborative storytelling, real-time mystery solving and rich characters, now playable with friends anywhere.',
      },
    },
    reviewed: false,
  },
  {
    slug: 'support-portal',
    name: 'SupportPortal',
    title: 'PixelTable Support Portal',
    tagline: 'One community hub for every game',
    year: '2023–present',
    team: 'PixelTable',
    stack: ['React', 'TypeScript'],
    links: [{ label: 'Visit PixelTable', href: 'https://pixeltable.net' }],
    screenshot: { src: '/projects/support-portal.webp', alt: 'The PixelTable Support Portal showing community discussion threads' },
    nodes: {
      problem: {
        body: 'Players across PixelTable titles had nowhere shared to ask questions, report issues or talk about the games, and the team had no single place to hear from them. Support and community conversations were scattered.',
      },
      myRole: {
        body: 'I led the build-out and expansion of the portal, owning the product direction and user experience and staying hands-on in the implementation as it grew from a support page into a real community space.',
      },
      architecture: {
        body: 'One portal serves every game title: shared community and support features, with each game getting its own space, so a new title plugs in without building a new site and players move between games with one account.',
      },
      hardParts: {
        body: 'Designing one information structure that works for very different games, keeping questions discoverable as the community grows, and letting players reach the development team directly without overwhelming it.',
      },
      outcome: {
        body: 'A centralised hub where players ask questions, discuss games, share ideas and interact with the development team in one place, and a foundation every future PixelTable title launches into.',
      },
    },
    reviewed: false,
  },
  {
    slug: 'natural-world-library',
    name: 'NaturalWorldLibrary',
    title: 'The Natural World Library',
    tagline: 'Field guides for mycology, herbalism & geology',
    year: '2023–present',
    team: 'PixelTable',
    stack: ['React', 'TypeScript', 'Search & data'],
    links: [{ label: 'Explore the Library', href: 'https://www.thenaturalworldlibrary.com/' }],
    screenshot: { src: '/projects/natural-world-library.webp', alt: 'A species entry in the Natural World Library field guide' },
    nodes: {
      problem: {
        body: 'Amateur enthusiasts and professional researchers needed one trustworthy place to identify fungi, plants, herbs and minerals: a reference deep enough for experts yet approachable for someone standing in a forest with a phone.',
      },
      myRole: {
        body: 'I shaped the reading and identification experience and built interface features hands-on, making a large and growing reference library feel like a friendly field guide in your pocket instead of a database.',
      },
      architecture: {
        body: 'A structured species database powers primers for geology, herbalism and mycology, with interactive identification tools and a wiki-style reading experience layered on the same data, so new primers reuse the whole platform.',
      },
      hardParts: {
        body: 'Presenting dense scientific data clearly on small screens out in the field, guiding identification step by step without oversimplifying it, and designing for community contributions without ever compromising accuracy.',
      },
      outcome: {
        body: 'A growing digital library with Geologist, Herbalist and Mycologist primers already live and an Avian primer on the way, serving curious hobbyists and professional researchers alike from one shared, trustworthy source.',
      },
    },
    reviewed: false,
  },
];
