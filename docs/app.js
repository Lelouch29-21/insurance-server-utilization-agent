const STORE_KEY = "pretext-watchboard-store-v3";
const SESSION_KEY = "pretext-watchboard-session-v3";
const PRETEXT_MODULE_URL = "https://esm.sh/@chenglou/pretext@0.0.4?bundle";
const TVMAZE_PAGES = [0, 1];
const DEFAULT_AUTH_HANDLE = "nova";
const DEFAULT_AUTH_PASSWORD = "nova";
const DEFAULT_ROUTE = "watchlist";
const VALID_ROUTES = new Set(["watchlist", "discover", "people", "community"]);
const POSTER_URL_BY_ID = {
  shogun: "https://static.tvmaze.com/uploads/images/original_untouched/506/1265637.jpg",
  severance: "https://static.tvmaze.com/uploads/images/original_untouched/548/1371406.jpg",
  "the-bear": "https://static.tvmaze.com/uploads/images/original_untouched/592/1480192.jpg",
  "blue-eye-samurai": "https://static.tvmaze.com/uploads/images/original_untouched/488/1220768.jpg",
  "attack-on-titan": "https://static.tvmaze.com/uploads/images/original_untouched/476/1191684.jpg",
  "the-white-lotus": "https://static.tvmaze.com/uploads/images/original_untouched/557/1393876.jpg",
  "mr-robot": "https://static.tvmaze.com/uploads/images/original_untouched/211/528026.jpg",
  chernobyl: "https://static.tvmaze.com/uploads/images/original_untouched/193/482599.jpg",
  "the-last-of-us": "https://static.tvmaze.com/uploads/images/original_untouched/563/1409008.jpg",
  "one-piece": "https://static.tvmaze.com/uploads/images/original_untouched/617/1543011.jpg",
  "past-lives": "https://upload.wikimedia.org/wikipedia/en/d/da/Past_Lives_film_poster.png",
  "everything-everywhere": "https://upload.wikimedia.org/wikipedia/en/1/1e/Everything_Everywhere_All_at_Once.jpg",
  oppenheimer: "https://upload.wikimedia.org/wikipedia/en/4/4a/Oppenheimer_%28film%29.jpg",
  aftersun: "https://upload.wikimedia.org/wikipedia/en/1/11/Aftersun.jpg",
  "across-spiderverse": "https://upload.wikimedia.org/wikipedia/en/b/b4/Spider-Man-_Across_the_Spider-Verse_poster.jpg",
  parasite: "https://upload.wikimedia.org/wikipedia/en/5/53/Parasite_%282019_film%29.png",
  "dune-two": "https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpeg",
  "zone-of-interest": "https://upload.wikimedia.org/wikipedia/en/2/24/The_Zone_of_Interest_film_poster.jpg",
};
const DEFAULT_POSTER_DATA_URI =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="420" height="620" viewBox="0 0 420 620">
      <rect width="420" height="620" rx="24" fill="#11111B"/>
      <rect x="22" y="22" width="376" height="576" rx="22" fill="#1E1E2E" stroke="#313244" stroke-width="4"/>
      <text x="210" y="295" text-anchor="middle" font-family="Arial, sans-serif" font-size="44" font-weight="700" fill="#89B4FA">No Poster</text>
      <text x="210" y="348" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#CDD6F4">Add a title to begin</text>
    </svg>
  `);

const SEED_CATALOG = [
  {
    id: "shogun",
    title: "Shogun",
    kind: "TV Show",
    year: 2024,
    genres: ["Historical", "Political Drama", "Action"],
    imdbId: "tt2788316",
    imdbScore: 8.6,
    chartScore: 97,
    runtime: "10 episodes",
    source: "FX / Hulu",
    poster: "",
    summary:
      "Feudal power games, translation politics, and alliance-making in a prestige epic your friends will want to debate weekly.",
  },
  {
    id: "severance",
    title: "Severance",
    kind: "TV Show",
    year: 2022,
    genres: ["Sci-Fi", "Mystery", "Workplace"],
    imdbId: "tt11280740",
    imdbScore: 8.7,
    chartScore: 95,
    runtime: "2 seasons",
    source: "Apple TV+",
    poster: "",
    summary:
      "A corporate thriller about split consciousness that turns group chats into theory boards.",
  },
  {
    id: "the-bear",
    title: "The Bear",
    kind: "TV Show",
    year: 2022,
    genres: ["Drama", "Food", "Family"],
    imdbId: "tt14452776",
    imdbScore: 8.5,
    chartScore: 94,
    runtime: "3 seasons",
    source: "FX / Hulu",
    poster: "",
    summary:
      "High-pressure kitchen chaos with enough tenderness and style to convert people outside prestige-TV circles.",
  },
  {
    id: "blue-eye-samurai",
    title: "Blue Eye Samurai",
    kind: "TV Show",
    year: 2023,
    genres: ["Animation", "Action", "Historical"],
    imdbId: "tt13309742",
    imdbScore: 8.7,
    chartScore: 93,
    runtime: "1 season",
    source: "Netflix",
    poster: "",
    summary:
      "A sharp revenge odyssey that helps anime fans cross into prestige animation and historical drama circles.",
  },
  {
    id: "attack-on-titan",
    title: "Attack on Titan",
    kind: "TV Show",
    year: 2013,
    genres: ["Anime", "Action", "Dark Fantasy"],
    imdbId: "tt2560140",
    imdbScore: 9.1,
    chartScore: 96,
    runtime: "4 seasons",
    source: "Crunchyroll",
    poster: "",
    summary:
      "A long-run anime event with huge public discourse and a deep recommendation trail into darker fantasy series.",
  },
  {
    id: "the-white-lotus",
    title: "The White Lotus",
    kind: "TV Show",
    year: 2021,
    genres: ["Satire", "Drama", "Mystery"],
    imdbId: "tt13406094",
    imdbScore: 7.9,
    chartScore: 91,
    runtime: "3 seasons",
    source: "HBO",
    poster: "",
    summary:
      "Destination drama and social satire that gives mixed friend groups a shared weekly conversation surface.",
  },
  {
    id: "mr-robot",
    title: "Mr. Robot",
    kind: "TV Show",
    year: 2015,
    genres: ["Tech Thriller", "Psychological", "Mystery"],
    imdbId: "tt4158110",
    imdbScore: 8.5,
    chartScore: 90,
    runtime: "4 seasons",
    source: "USA Network",
    poster: "",
    summary:
      "A hacker thriller that pulls engineering, anti-capitalist, and psychological-drama watch bubbles into one lane.",
  },
  {
    id: "chernobyl",
    title: "Chernobyl",
    kind: "TV Show",
    year: 2019,
    genres: ["Historical", "Thriller", "Drama"],
    imdbId: "tt7366338",
    imdbScore: 9.3,
    chartScore: 94,
    runtime: "5 episodes",
    source: "HBO",
    poster: "",
    summary:
      "Tense prestige storytelling that converts documentary viewers into scripted-drama boards.",
  },
  {
    id: "the-last-of-us",
    title: "The Last of Us",
    kind: "TV Show",
    year: 2023,
    genres: ["Sci-Fi", "Drama", "Post-Apocalyptic"],
    imdbId: "tt3581920",
    imdbScore: 8.7,
    chartScore: 92,
    runtime: "1 season",
    source: "HBO",
    poster: "",
    summary:
      "A game adaptation that gives genre fans and prestige viewers a rare shared emotional anchor.",
  },
  {
    id: "one-piece",
    title: "One Piece",
    kind: "TV Show",
    year: 2023,
    genres: ["Adventure", "Fantasy", "Action"],
    imdbId: "tt11737520",
    imdbScore: 8.3,
    chartScore: 89,
    runtime: "1 season",
    source: "Netflix",
    poster: "",
    summary:
      "A live-action anime gateway for friends who need a softer on-ramp into shonen fandom.",
  },
  {
    id: "past-lives",
    title: "Past Lives",
    kind: "Movie",
    year: 2023,
    genres: ["Romance", "Drama", "Quiet Cinema"],
    imdbId: "tt13238346",
    imdbScore: 7.8,
    chartScore: 90,
    runtime: "1h 45m",
    source: "A24",
    poster: "",
    summary:
      "A restrained romance recommendation that helps taste-shift friends away from pure franchise queues.",
  },
  {
    id: "everything-everywhere",
    title: "Everything Everywhere All at Once",
    kind: "Movie",
    year: 2022,
    genres: ["Sci-Fi", "Comedy", "Family"],
    imdbId: "tt6710474",
    imdbScore: 7.8,
    chartScore: 93,
    runtime: "2h 19m",
    source: "A24",
    poster: "",
    summary:
      "Multiverse maximalism with enough heart to connect indie fans and blockbuster-only friend groups.",
  },
  {
    id: "oppenheimer",
    title: "Oppenheimer",
    kind: "Movie",
    year: 2023,
    genres: ["Biopic", "Historical", "Thriller"],
    imdbId: "tt15398776",
    imdbScore: 8.3,
    chartScore: 95,
    runtime: "3h",
    source: "Universal",
    poster: "",
    summary:
      "A large-scale biographical thriller that keeps history, politics, and craft conversations in the same board thread.",
  },
  {
    id: "aftersun",
    title: "Aftersun",
    kind: "Movie",
    year: 2022,
    genres: ["Drama", "Memory", "Quiet Cinema"],
    imdbId: "tt19770238",
    imdbScore: 7.6,
    chartScore: 88,
    runtime: "1h 42m",
    source: "A24",
    poster: "",
    summary:
      "A tender slow-burn pick that broadens high-energy watchlists into emotional, reflective cinema.",
  },
  {
    id: "across-spiderverse",
    title: "Spider-Man: Across the Spider-Verse",
    kind: "Movie",
    year: 2023,
    genres: ["Animation", "Superhero", "Adventure"],
    imdbId: "tt9362722",
    imdbScore: 8.6,
    chartScore: 96,
    runtime: "2h 20m",
    source: "Sony",
    poster: "",
    summary:
      "A highly social animation pick that gives superhero viewers and arthouse animation fans a real overlap title.",
  },
  {
    id: "parasite",
    title: "Parasite",
    kind: "Movie",
    year: 2019,
    genres: ["Thriller", "Satire", "Drama"],
    imdbId: "tt6751668",
    imdbScore: 8.5,
    chartScore: 94,
    runtime: "2h 12m",
    source: "CJ",
    poster: "",
    summary:
      "A sharp class thriller that remains a reliable cross-circle gateway into international cinema recs.",
  },
  {
    id: "dune-two",
    title: "Dune: Part Two",
    kind: "Movie",
    year: 2024,
    genres: ["Sci-Fi", "Adventure", "Political Drama"],
    imdbId: "tt15239678",
    imdbScore: 8.5,
    chartScore: 97,
    runtime: "2h 46m",
    source: "Warner Bros.",
    poster: "",
    summary:
      "A giant-scale sci-fi chapter that lets blockbuster friends and lore-heavy readers meet in one queue.",
  },
  {
    id: "zone-of-interest",
    title: "The Zone of Interest",
    kind: "Movie",
    year: 2023,
    genres: ["Historical", "Drama", "Arthouse"],
    imdbId: "tt7160372",
    imdbScore: 7.4,
    chartScore: 85,
    runtime: "1h 45m",
    source: "A24",
    poster: "",
    summary:
      "An austere but important recommendation for friend circles trying to watch outside algorithmic comfort zones.",
  },
];

const SEED_USERS = [
  {
    id: "user-nova",
    name: "Nova Shah",
    handle: "nova",
    password: "nova",
    city: "Mumbai",
    bio: "Builds prestige-sci-fi lists, hosts spoiler-safe theory threads, and borrows one bold wildcard every week.",
    vibe: "Prestige sci-fi curator",
    friends: ["user-milo", "user-zoya"],
    shelf: [
      {
        titleId: "shogun",
        status: "Watching",
        score: 9.4,
        progress: "Episode 8 / 10",
        note: "Board-worthy politics and weekly friend debriefs.",
        updatedAt: "2026-03-28T10:00:00.000Z",
      },
      {
        titleId: "severance",
        status: "Completed",
        score: 9.2,
        progress: "Caught up",
        note: "The Lumon board theories got everyone to rewatch.",
        updatedAt: "2026-03-10T09:00:00.000Z",
      },
      {
        titleId: "past-lives",
        status: "Completed",
        score: 8.9,
        progress: "Finished",
        note: "Soft recommendation for friends outside high-concept drama.",
        updatedAt: "2026-02-14T09:00:00.000Z",
      },
      {
        titleId: "blue-eye-samurai",
        status: "Completed",
        score: 9.1,
        progress: "Season 1",
        note: "Best crossover pick for animation skeptics.",
        updatedAt: "2026-01-20T09:00:00.000Z",
      },
      {
        titleId: "one-piece",
        status: "Planning",
        score: 8.4,
        progress: "Queue",
        note: "Milo says this is a safe entry point into shonen.",
        updatedAt: "2026-03-30T09:00:00.000Z",
      },
    ],
  },
  {
    id: "user-milo",
    name: "Milo Park",
    handle: "milo",
    password: "milo",
    city: "Seoul",
    bio: "Food dramas, animation, and chaotic watch-party picks. Sends friend requests when there is at least one shared title.",
    vibe: "High-energy watch party host",
    friends: ["user-nova", "user-arya"],
    shelf: [
      {
        titleId: "the-bear",
        status: "Watching",
        score: 9.0,
        progress: "Season 3",
        note: "Still the most quotable kitchen chaos.",
        updatedAt: "2026-03-26T08:00:00.000Z",
      },
      {
        titleId: "oppenheimer",
        status: "Completed",
        score: 8.8,
        progress: "Finished",
        note: "Saved a board thread for cinematography breakdowns.",
        updatedAt: "2026-02-26T08:00:00.000Z",
      },
      {
        titleId: "across-spiderverse",
        status: "Completed",
        score: 9.3,
        progress: "Finished",
        note: "Converts superhero watchers into animation maximalists.",
        updatedAt: "2026-02-20T08:00:00.000Z",
      },
      {
        titleId: "mr-robot",
        status: "Completed",
        score: 9.0,
        progress: "Series",
        note: "The right recommendation for tech friends who say they hate drama.",
        updatedAt: "2026-01-14T08:00:00.000Z",
      },
      {
        titleId: "severance",
        status: "Watching",
        score: 8.7,
        progress: "Season 2",
        note: "MDR theories every Friday night.",
        updatedAt: "2026-03-29T08:00:00.000Z",
      },
    ],
  },
  {
    id: "user-zoya",
    name: "Zoya Rehman",
    handle: "zoya",
    password: "zoya",
    city: "Delhi",
    bio: "Moves between anime, slow cinema, and social satire so the group feed never gets trapped in one algorithm lane.",
    vibe: "Slow-cinema scout",
    friends: ["user-nova", "user-arya"],
    shelf: [
      {
        titleId: "parasite",
        status: "Completed",
        score: 9.4,
        progress: "Finished",
        note: "Reliable intro to international thrillers.",
        updatedAt: "2026-01-03T08:00:00.000Z",
      },
      {
        titleId: "blue-eye-samurai",
        status: "Completed",
        score: 9.0,
        progress: "Season 1",
        note: "Perfect animation craft thread starter.",
        updatedAt: "2026-03-02T08:00:00.000Z",
      },
      {
        titleId: "aftersun",
        status: "Completed",
        score: 9.0,
        progress: "Finished",
        note: "Slow but unforgettable.",
        updatedAt: "2026-03-15T08:00:00.000Z",
      },
      {
        titleId: "attack-on-titan",
        status: "Watching",
        score: 8.7,
        progress: "Final season",
        note: "Long arc payoff with intense group debate.",
        updatedAt: "2026-03-29T11:00:00.000Z",
      },
      {
        titleId: "the-white-lotus",
        status: "Paused",
        score: 8.0,
        progress: "Season 2",
        note: "Saving it for a board sprint with friends.",
        updatedAt: "2026-03-11T08:00:00.000Z",
      },
    ],
  },
  {
    id: "user-arya",
    name: "Arya Menon",
    handle: "arya",
    password: "arya",
    city: "Bengaluru",
    bio: "Keeps a balanced queue of lore-heavy sci-fi and history. Great to follow when your feed becomes too franchise-heavy.",
    vibe: "Lore analyst",
    friends: ["user-milo", "user-zoya"],
    shelf: [
      {
        titleId: "dune-two",
        status: "Completed",
        score: 9.2,
        progress: "Finished",
        note: "Massive scale with enough politics to hook Shogun fans.",
        updatedAt: "2026-03-18T08:00:00.000Z",
      },
      {
        titleId: "shogun",
        status: "Watching",
        score: 9.1,
        progress: "Episode 5 / 10",
        note: "Power-map screenshots belong in every discussion board.",
        updatedAt: "2026-03-21T08:00:00.000Z",
      },
      {
        titleId: "attack-on-titan",
        status: "Completed",
        score: 8.8,
        progress: "Series",
        note: "Still a rec engine for dark fantasy and politics.",
        updatedAt: "2026-01-19T08:00:00.000Z",
      },
      {
        titleId: "chernobyl",
        status: "Completed",
        score: 9.5,
        progress: "Mini-series",
        note: "Hard recommendation for historical thriller fans.",
        updatedAt: "2026-01-27T08:00:00.000Z",
      },
      {
        titleId: "zone-of-interest",
        status: "Planning",
        score: 8.2,
        progress: "Queue",
        note: "Watching when the group wants one deliberately difficult film.",
        updatedAt: "2026-03-31T08:00:00.000Z",
      },
    ],
  },
  {
    id: "user-ken",
    name: "Ken Sato",
    handle: "ken",
    password: "ken",
    city: "Tokyo",
    bio: "Outside-the-circle scout with genre-heavy but emotionally grounded recs. Add Ken if your friends list feels too predictable.",
    vibe: "Outer-circle scout",
    friends: [],
    shelf: [
      {
        titleId: "the-last-of-us",
        status: "Completed",
        score: 8.8,
        progress: "Season 1",
        note: "Genre drama that lands with non-gamers.",
        updatedAt: "2026-02-05T08:00:00.000Z",
      },
      {
        titleId: "one-piece",
        status: "Watching",
        score: 8.6,
        progress: "Episode 6",
        note: "Fun low-friction group watch.",
        updatedAt: "2026-03-22T08:00:00.000Z",
      },
      {
        titleId: "everything-everywhere",
        status: "Completed",
        score: 8.9,
        progress: "Finished",
        note: "Still the best multiverse crossover rec.",
        updatedAt: "2026-03-08T08:00:00.000Z",
      },
      {
        titleId: "mr-robot",
        status: "Completed",
        score: 8.7,
        progress: "Series",
        note: "A sharp techno-thriller with a human core.",
        updatedAt: "2026-01-28T08:00:00.000Z",
      },
      {
        titleId: "parasite",
        status: "Completed",
        score: 9.1,
        progress: "Finished",
        note: "Cross-border board classic.",
        updatedAt: "2026-01-07T08:00:00.000Z",
      },
    ],
  },
];

const SEED_BOARDS = [
  {
    id: "board-shogun",
    authorId: "user-nova",
    channel: "Taste Match",
    title: "Need one historical epic for friends who only watch sci-fi",
    body:
      "Shogun worked because it still has strategy, world-building, and big theory energy. What else fits that exact gap?",
    linkedTitleId: "shogun",
    likes: ["user-milo", "user-zoya"],
    createdAt: "2026-03-30T07:30:00.000Z",
    comments: [
      {
        id: "comment-a1",
        authorId: "user-arya",
        body: "Chernobyl is shorter but has the same pressure-cooker intensity.",
        createdAt: "2026-03-30T10:00:00.000Z",
      },
      {
        id: "comment-a2",
        authorId: "user-zoya",
        body: "Also try Blue Eye Samurai if they need animation-level visual momentum.",
        createdAt: "2026-03-31T09:00:00.000Z",
      },
    ],
  },
  {
    id: "board-animation",
    authorId: "user-zoya",
    channel: "Spoiler-safe picks",
    title: "Animation recs for people who loved Blue Eye Samurai but avoid long anime",
    body:
      "Looking for visual ambition, a tight episode count, and zero homework. Bonus if IMDb scores help persuade skeptical friends.",
    linkedTitleId: "blue-eye-samurai",
    likes: ["user-nova"],
    createdAt: "2026-03-27T13:20:00.000Z",
    comments: [
      {
        id: "comment-b1",
        authorId: "user-milo",
        body: "Across the Spider-Verse is the obvious crossover movie.",
        createdAt: "2026-03-27T14:40:00.000Z",
      },
    ],
  },
  {
    id: "board-watch-party",
    authorId: "user-milo",
    channel: "Weekend watch party",
    title: "Friday watch party shortlist: The Bear, Severance, or Dune rewatch?",
    body:
      "Trying to pick one title that keeps both my food-drama friends and sci-fi friends online at the same time.",
    linkedTitleId: "the-bear",
    likes: ["user-nova", "user-arya", "user-ken"],
    createdAt: "2026-04-01T08:30:00.000Z",
    comments: [
      {
        id: "comment-c1",
        authorId: "user-nova",
        body: "Severance if the goal is maximum theory posting after every episode.",
        createdAt: "2026-04-01T09:30:00.000Z",
      },
      {
        id: "comment-c2",
        authorId: "user-ken",
        body: "The Bear if you want fast onboarding and no lore barrier.",
        createdAt: "2026-04-01T10:10:00.000Z",
      },
    ],
  },
];

const FALLBACK_CHART = [
  {
    id: "chart-severance",
    title: "Severance",
    kind: "TV Show",
    year: 2022,
    genres: ["Sci-Fi", "Mystery"],
    imdbId: "tt11280740",
    imdbScore: 8.7,
    chartScore: 97,
    runtime: "2 seasons",
    source: "Fallback chart",
    poster: POSTER_URL_BY_ID.severance,
    summary:
      "Fallback chart pick when TVMaze is unavailable. A high-signal social mystery with huge board energy.",
  },
  {
    id: "chart-shogun",
    title: "Shogun",
    kind: "TV Show",
    year: 2024,
    genres: ["Historical", "Action"],
    imdbId: "tt2788316",
    imdbScore: 8.6,
    chartScore: 96,
    runtime: "10 episodes",
    source: "Fallback chart",
    poster: POSTER_URL_BY_ID.shogun,
    summary:
      "Fallback chart pick that connects prestige drama and action-heavy watch circles.",
  },
  {
    id: "chart-last-of-us",
    title: "The Last of Us",
    kind: "TV Show",
    year: 2023,
    genres: ["Sci-Fi", "Drama"],
    imdbId: "tt3581920",
    imdbScore: 8.7,
    chartScore: 95,
    runtime: "1 season",
    source: "Fallback chart",
    poster: POSTER_URL_BY_ID["the-last-of-us"],
    summary:
      "Fallback chart pick with a strong IMDb score and a broad fan crossover.",
  },
  {
    id: "chart-bear",
    title: "The Bear",
    kind: "TV Show",
    year: 2022,
    genres: ["Drama", "Food"],
    imdbId: "tt14452776",
    imdbScore: 8.5,
    chartScore: 94,
    runtime: "3 seasons",
    source: "Fallback chart",
    poster: POSTER_URL_BY_ID["the-bear"],
    summary:
      "Fallback chart pick with low onboarding friction and strong friend-group momentum.",
  },
];

const statusToneClass = {
  Watching: "green",
  Completed: "violet",
  Planning: "orange",
  Paused: "rose",
  Dropped: "",
};

const appState = {
  store: loadStore(),
  activeUserId: loadSessionUserId(),
  selectedProfileId: "",
  authMode: "signin",
  shelfFilter: "all",
  currentRoute: DEFAULT_ROUTE,
  chartItems: deepClone(FALLBACK_CHART),
  chartStatusText:
    "Pulling a fresh TV chart from TVMaze and attaching IMDb links where available.",
};

const pretextRuntime = {
  api: null,
  loadingPromise: null,
  isReady: false,
  scheduledFrame: 0,
};

const pretextLayoutStore = new WeakMap();

const elements = {
  sessionAction: document.querySelector("#session-action"),
  authCard: document.querySelector("#auth-card"),
  profileCard: document.querySelector("#profile-card"),
  authModeButtons: Array.from(document.querySelectorAll("[data-auth-mode]")),
  authForm: document.querySelector("#auth-form"),
  authNameInput: document.querySelector("#auth-name-input"),
  authHandleInput: document.querySelector("#auth-handle-input"),
  authPasswordInput: document.querySelector("#auth-password-input"),
  authSubmit: document.querySelector("#auth-submit"),
  authHelper: document.querySelector("#auth-helper"),
  profileAvatar: document.querySelector("#profile-avatar"),
  profileName: document.querySelector("#profile-name"),
  profileMeta: document.querySelector("#profile-meta"),
  profileBio: document.querySelector("#profile-bio"),
  heroTrackedCount: document.querySelector("#hero-tracked-count"),
  heroFriendCount: document.querySelector("#hero-friend-count"),
  heroBridgeScore: document.querySelector("#hero-bridge-score"),
  signoutButton: document.querySelector("#signout-button"),
  metricTotal: document.querySelector("#metric-total"),
  metricFriends: document.querySelector("#metric-friends"),
  metricActive: document.querySelector("#metric-active"),
  metricBridge: document.querySelector("#metric-bridge"),
  discoveryChip: document.querySelector("#discovery-chip"),
  discoverySummary: document.querySelector("#discovery-summary"),
  discoveryGrid: document.querySelector("#discovery-grid"),
  refreshChartButton: document.querySelector("#refresh-chart-button"),
  chartStatus: document.querySelector("#chart-status"),
  chartGrid: document.querySelector("#chart-grid"),
  shelfFilterButtons: Array.from(document.querySelectorAll("[data-shelf-filter]")),
  libraryForm: document.querySelector("#library-form"),
  titleInput: document.querySelector("#title-input"),
  kindInput: document.querySelector("#kind-input"),
  statusInput: document.querySelector("#status-input"),
  scoreInput: document.querySelector("#score-input"),
  progressField: document.querySelector("#progress-field"),
  progressInput: document.querySelector("#progress-input"),
  genresInput: document.querySelector("#genres-input"),
  noteInput: document.querySelector("#note-input"),
  catalogSuggestions: document.querySelector("#catalog-suggestions"),
  libraryGrid: document.querySelector("#library-grid"),
  peopleCountLabel: document.querySelector("#people-count-label"),
  peopleGrid: document.querySelector("#people-grid"),
  publicProfileTitle: document.querySelector("#public-profile-title"),
  followSelectedButton: document.querySelector("#follow-selected-button"),
  publicProfile: document.querySelector("#public-profile"),
  boardForm: document.querySelector("#board-form"),
  boardChannelInput: document.querySelector("#board-channel-input"),
  boardTitleInput: document.querySelector("#board-title-input"),
  boardLinkInput: document.querySelector("#board-link-input"),
  boardBodyInput: document.querySelector("#board-body-input"),
  boardCountLabel: document.querySelector("#board-count-label"),
  boardGrid: document.querySelector("#board-grid"),
  toast: document.querySelector("#toast"),
  pageViews: Array.from(document.querySelectorAll("[data-page-view]")),
  routeLinks: Array.from(document.querySelectorAll("[data-route-link]")),
};

function initApp() {
  if (appState.activeUserId && !getUserById(appState.activeUserId)) {
    appState.activeUserId = "";
    saveSessionUserId("");
  }

  ensureSelectedProfile();
  syncRouteFromHash();
  syncCatalogSuggestions();
  syncAuthModeControls();
  syncLibraryFormControls();
  bindEventListeners();
  renderApp();
  loadPretextRuntime().catch(() => {
    // The UI still works without Pretext; only the cursor-through-text effect degrades.
  });
  loadLiveTvCharts().catch(() => {
    // Fallback chart is already rendered if TVMaze is unavailable.
  });
}

function bindEventListeners() {
  window.addEventListener("hashchange", syncRouteFromHash);

  elements.authModeButtons.forEach((button) => {
    button.addEventListener("click", () => setAuthMode(button.dataset.authMode));
  });

  elements.authForm.addEventListener("submit", handleAuthSubmit);
  elements.signoutButton.addEventListener("click", signOut);

  elements.sessionAction.addEventListener("click", () => {
    if (getActiveUser()) {
      signOut();
      return;
    }

    navigateToRoute("watchlist");
    window.setTimeout(() => {
      elements.authHandleInput.focus();
    }, 0);
  });

  elements.refreshChartButton.addEventListener("click", () => {
    loadLiveTvCharts().catch(() => {
      // Existing chart status already explains the fallback state.
    });
  });

  elements.discoveryGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-discovery-save]");
    if (!button) {
      return;
    }
    saveTitleToShelf(button.dataset.discoverySave, "Planning");
  });

  elements.chartGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-chart-save]");
    if (!button) {
      return;
    }
    const chartItem = appState.chartItems.find(
      (item) => item.id === button.dataset.chartSave
    );
    if (chartItem) {
      const savedItem = upsertCatalogItem(chartItem);
      saveTitleToShelf(savedItem.id, "Planning");
    }
  });

  elements.shelfFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      appState.shelfFilter = button.dataset.shelfFilter;
      elements.shelfFilterButtons.forEach((chip) =>
        chip.classList.toggle("is-active", chip === button)
      );
      renderLibrary();
    });
  });

  elements.libraryForm.addEventListener("submit", handleLibrarySubmit);
  elements.statusInput.addEventListener("change", syncLibraryFormControls);

  elements.libraryGrid.addEventListener("change", (event) => {
    const statusSelect = event.target.closest("[data-status-select]");
    if (!statusSelect) {
      return;
    }
    updateShelfStatus(statusSelect.dataset.statusSelect, statusSelect.value);
  });

  elements.libraryGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-library-action]");
    if (!button) {
      return;
    }
    if (button.dataset.libraryAction === "remove") {
      removeShelfEntry(button.dataset.titleId);
    }
  });

  elements.peopleGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-people-action]");
    if (!button) {
      return;
    }
    const userId = button.dataset.userId;
    if (button.dataset.peopleAction === "open") {
      appState.selectedProfileId = userId;
      renderPeople();
      renderPublicProfile();
    }
    if (button.dataset.peopleAction === "friend") {
      toggleFriend(userId);
    }
  });

  elements.followSelectedButton.addEventListener("click", () => {
    if (!appState.selectedProfileId) {
      return;
    }
    toggleFriend(appState.selectedProfileId);
  });

  elements.publicProfile.addEventListener("click", (event) => {
    const button = event.target.closest("[data-public-borrow]");
    if (!button) {
      return;
    }
    saveTitleToShelf(button.dataset.publicBorrow, "Planning");
  });

  elements.boardForm.addEventListener("submit", handleBoardSubmit);

  elements.boardGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-board-action]");
    if (!button) {
      return;
    }
    const boardId = button.dataset.boardId;
    if (button.dataset.boardAction === "like") {
      toggleBoardLike(boardId);
    }
    if (button.dataset.boardAction === "save-linked") {
      saveTitleToShelf(button.dataset.titleId, "Planning");
    }
    if (button.dataset.boardAction === "open-profile") {
      appState.selectedProfileId = button.dataset.userId;
      navigateToRoute("people");
      renderPeople();
      renderPublicProfile();
    }
  });

  elements.boardGrid.addEventListener("submit", handleBoardCommentSubmit);

  window.addEventListener("resize", () => {
    queuePretextRender();
  });
}

function renderApp() {
  renderSessionPanel();
  renderMetrics();
  renderDiscovery();
  renderChart();
  renderLibrary();
  renderPeople();
  renderPublicProfile();
  renderBoards();
  renderCurrentRoute();
  queuePretextRender();
}

function syncRouteFromHash() {
  const route = routeFromHash(window.location.hash);
  if (route !== appState.currentRoute) {
    appState.currentRoute = route;
  }
  if (!window.location.hash || routeToHash(window.location.hash) !== route) {
    window.history.replaceState(null, "", `#/${route}`);
  }
  renderCurrentRoute();
}

function renderCurrentRoute() {
  elements.pageViews.forEach((page) => {
    page.classList.toggle(
      "is-active",
      page.dataset.pageView === appState.currentRoute
    );
  });

  elements.routeLinks.forEach((link) => {
    link.classList.toggle(
      "is-active",
      link.dataset.routeLink === appState.currentRoute
    );
  });

  queuePretextRender();
}

function navigateToRoute(route) {
  const safeRoute = VALID_ROUTES.has(route) ? route : DEFAULT_ROUTE;
  window.location.hash = `#/${safeRoute}`;
}

function routeFromHash(hashValue) {
  const rawRoute = routeToHash(hashValue);
  if (rawRoute === "library") {
    return "watchlist";
  }
  if (rawRoute === "boards") {
    return "community";
  }
  return VALID_ROUTES.has(rawRoute) ? rawRoute : DEFAULT_ROUTE;
}

function routeToHash(hashValue) {
  return String(hashValue || "")
    .replace(/^#\/?/, "")
    .trim()
    .toLowerCase();
}

function renderSessionPanel() {
  const activeUser = getActiveUser();

  if (!activeUser) {
    elements.sessionAction.textContent = "Sign in";
    elements.authCard.classList.remove("is-hidden");
    elements.profileCard.classList.add("is-hidden");
    if (!elements.authHandleInput.value.trim()) {
      elements.authHandleInput.value = DEFAULT_AUTH_HANDLE;
    }
    if (!elements.authPasswordInput.value.trim()) {
      elements.authPasswordInput.value = DEFAULT_AUTH_PASSWORD;
    }
    return;
  }

  const bridgeScore = calculateBridgeScore(activeUser);
  elements.sessionAction.textContent = `@${activeUser.handle}`;
  elements.authCard.classList.add("is-hidden");
  elements.profileCard.classList.remove("is-hidden");
  elements.profileAvatar.textContent = initialsForName(activeUser.name);
  elements.profileName.textContent = activeUser.name;
  elements.profileMeta.textContent = `@${activeUser.handle} · ${activeUser.city} · ${activeUser.vibe}`;
  elements.profileBio.textContent = activeUser.bio;
  elements.heroTrackedCount.textContent = String(activeUser.shelf.length);
  elements.heroFriendCount.textContent = String(activeUser.friends.length);
  elements.heroBridgeScore.textContent = String(bridgeScore);
}

function renderMetrics() {
  const activeUser = getActiveUser();
  if (!activeUser) {
    elements.metricTotal.textContent = String(appState.store.catalog.length);
    elements.metricFriends.textContent = String(appState.store.users.length);
    elements.metricActive.textContent = String(appState.store.boards.length);
    elements.metricBridge.textContent = "74";
    return;
  }

  const activeShelfCount = activeUser.shelf.filter((entry) =>
    ["Watching", "Planning"].includes(entry.status)
  ).length;

  elements.metricTotal.textContent = String(activeUser.shelf.length);
  elements.metricFriends.textContent = String(activeUser.friends.length);
  elements.metricActive.textContent = String(activeShelfCount);
  elements.metricBridge.textContent = String(calculateBridgeScore(activeUser));
}

function renderDiscovery() {
  const activeUser = getActiveUser();
  const discoveryCards = buildDiscoveryCards(activeUser);

  elements.discoveryChip.textContent = activeUser
    ? `For @${activeUser.handle}`
    : "Guest preview";

  elements.discoverySummary.textContent = activeUser
    ? buildDiscoverySummary(activeUser, discoveryCards)
    : "Sign in to get friend-aware recs that blend your comfort genres with titles from outside your usual circle, backed by IMDb scores and watch activity.";

  elements.discoveryGrid.innerHTML = discoveryCards
    .map((card) => renderDiscoveryCard(card))
    .join("");
  queuePretextRender();
}

function renderDiscoveryCard(card) {
  const supporterCopy =
    card.supporters.length > 0
      ? `Backed by ${card.supporters.map((user) => `@${user.handle}`).join(", ")}`
      : "High-signal public pick outside your current shelf.";

  return `
    <article class="recommend-card">
      <div class="recommend-top">
        ${renderPoster(card.item)}
        <div>
          <p class="meta-mono">${escapeHtml(card.item.kind)} · ${escapeHtml(
            String(card.item.year ?? "")
          )} · IMDb ${formatScore(card.item.imdbScore)}</p>
          <h3 class="flow-copy">${escapeHtml(card.item.title)}</h3>
          <p class="meta-line">${escapeHtml(supporterCopy)}</p>
        </div>
      </div>
      <div class="chip-row">
        <span class="status-pill orange">Taste Match ${Math.round(card.bridgeScore)}</span>
        <span class="status-pill ${statusToneClass[card.friendStatus] || ""}">
          ${escapeHtml(displayShelfStatus(card.friendStatus))}
        </span>
        <a class="imdb-link" href="${escapeHtml(
          imdbUrlForItem(card.item)
        )}" target="_blank" rel="noreferrer">IMDb</a>
      </div>
      <p class="list-note flow-copy">${escapeHtml(card.reason)}</p>
      <div class="card-actions">
        <button class="mini-action" type="button" data-discovery-save="${escapeHtml(
          card.item.id
        )}">
          Add to Watchlist
        </button>
      </div>
    </article>
  `;
}

function renderChart() {
  elements.chartStatus.textContent = appState.chartStatusText;

  if (appState.chartItems.length === 0) {
    elements.chartGrid.innerHTML = `
      <article class="chart-card">
        <p class="chart-empty flow-copy">No chart cards available right now. Try refreshing the TVMaze feed.</p>
      </article>
    `;
    queuePretextRender();
    return;
  }

  elements.chartGrid.innerHTML = appState.chartItems
    .slice(0, 6)
    .map(
      (item) => `
        <article class="chart-card">
          <div class="chart-top">
            ${renderPoster(item)}
            <div>
              <p class="meta-mono">${escapeHtml(item.kind)} · ${escapeHtml(
                String(item.year ?? "")
              )}</p>
              <h3 class="flow-copy">${escapeHtml(item.title)}</h3>
              <p class="meta-line">${escapeHtml(item.source)} · IMDb ${formatScore(
                item.imdbScore
              )}</p>
            </div>
          </div>
          <div class="chip-row">
            <span class="status-pill green">Chart ${Math.round(
              Number(item.chartScore ?? 80)
            )}</span>
            <span class="status-pill">${escapeHtml(
              item.genres.slice(0, 2).join(" · ") || "Fresh pick"
            )}</span>
            <a class="imdb-link" href="${escapeHtml(
              imdbUrlForItem(item)
            )}" target="_blank" rel="noreferrer">IMDb</a>
          </div>
          <p class="list-note flow-copy">${escapeHtml(item.summary)}</p>
          <div class="card-actions">
            <button class="mini-action" type="button" data-chart-save="${escapeHtml(
              item.id
            )}">
              Save to Watchlist
            </button>
          </div>
        </article>
      `
    )
    .join("");
  queuePretextRender();
}

function renderLibrary() {
  const activeUser = getActiveUser();

  if (!activeUser) {
    elements.libraryGrid.innerHTML = `
      <article class="public-summary">
        <p class="public-empty flow-copy">
          Sign in with a demo handle to build your own shelf, score titles, and publish your list to friends.
        </p>
      </article>
    `;
    queuePretextRender();
    return;
  }

  const catalogMap = catalogIndex();
  const entries = activeUser.shelf
    .filter(
      (entry) =>
        appState.shelfFilter === "all" ||
        entry.status === appState.shelfFilter
    )
    .slice()
    .sort(
      (left, right) =>
        new Date(right.updatedAt || 0).getTime() -
        new Date(left.updatedAt || 0).getTime()
    );

  if (entries.length === 0) {
    elements.libraryGrid.innerHTML = `
      <article class="public-summary">
        <p class="public-empty flow-copy">
          Nothing in this shelf filter yet. Add a TV show or film above to keep your list current.
        </p>
      </article>
    `;
    queuePretextRender();
    return;
  }

  elements.libraryGrid.innerHTML = entries
    .map((entry) => {
      const item = catalogMap.get(entry.titleId);
      if (!item) {
        return "";
      }
      const tone = statusToneClass[entry.status] || "";
      const metaParts = [
        `Your score ${formatScore(entry.score)}`,
        `IMDb ${formatScore(item.imdbScore)}`,
      ];
      const progressLabel = displayProgressLabel(entry);
      if (progressLabel) {
        metaParts.push(progressLabel);
      }
      return `
        <article class="title-card">
          <div class="title-top">
            ${renderPoster(item)}
            <div class="title-meta">
              <p class="meta-mono">${escapeHtml(item.kind)} · ${escapeHtml(
                String(item.year ?? "")
              )}</p>
              <h3 class="flow-copy">${escapeHtml(item.title)}</h3>
              <p class="meta-line">${renderMetaParts(metaParts)}</p>
            </div>
          </div>
          <div class="chip-row">
            <span class="status-pill ${tone}">${escapeHtml(displayShelfStatus(entry.status))}</span>
            <span class="status-pill">${escapeHtml(
              item.genres.slice(0, 2).join(" · ") || "Unsorted"
            )}</span>
            <a class="imdb-link" href="${escapeHtml(
              imdbUrlForItem(item)
            )}" target="_blank" rel="noreferrer">IMDb</a>
          </div>
          <p class="list-note flow-copy">${escapeHtml(entry.note || item.summary)}</p>
          <label class="field-label" for="status-${escapeHtml(item.id)}">
            Update status
            <select id="status-${escapeHtml(
              item.id
            )}" data-status-select="${escapeHtml(item.id)}">
              ${renderStatusOptions(entry.status)}
            </select>
          </label>
          <div class="card-actions">
            <button
              class="mini-action"
              type="button"
              data-library-action="remove"
              data-title-id="${escapeHtml(item.id)}"
            >
              Remove from shelf
            </button>
          </div>
        </article>
      `;
    })
    .join("");
  queuePretextRender();
}

function renderPeople() {
  const activeUser = getActiveUser();
  const profiles = appState.store.users
    .filter((user) => user.id !== activeUser?.id)
    .slice()
    .sort((left, right) => {
      const leftSelected = Number(left.id === appState.selectedProfileId);
      const rightSelected = Number(right.id === appState.selectedProfileId);
      if (leftSelected !== rightSelected) {
        return rightSelected - leftSelected;
      }

      const leftFriend = Number(activeUser?.friends.includes(left.id));
      const rightFriend = Number(activeUser?.friends.includes(right.id));
      if (leftFriend !== rightFriend) {
        return rightFriend - leftFriend;
      }

      return (
        sharedTitleCount(activeUser, right) - sharedTitleCount(activeUser, left)
      );
    });

  elements.peopleCountLabel.textContent = `${profiles.length} profiles`;

  if (profiles.length === 0) {
    elements.peopleGrid.innerHTML = `
      <article class="person-card">
        <p class="public-empty flow-copy">No public profiles yet.</p>
      </article>
    `;
    queuePretextRender();
    return;
  }

  elements.peopleGrid.innerHTML = profiles
    .map((user) => {
      const isFriend = Boolean(activeUser?.friends.includes(user.id));
      const isSelected = user.id === appState.selectedProfileId;
      const shelfPreview = summarizeUserShelf(user);
      const sharedCount = sharedTitleCount(activeUser, user);
      return `
        <article class="person-card ${isSelected ? "is-selected" : ""}">
          <div class="person-top">
            <div class="avatar">${escapeHtml(initialsForName(user.name))}</div>
            <div>
              <p class="meta-mono">@${escapeHtml(user.handle)} · ${escapeHtml(
                user.city
              )}</p>
              <h3 class="profile-name flow-copy">${escapeHtml(user.name)}</h3>
            </div>
          </div>
          <p class="list-note flow-copy">${escapeHtml(user.bio)}</p>
          <p class="list-note flow-copy">${escapeHtml(shelfPreview)}</p>
          <div class="chip-row">
            <span class="friend-tag">${isFriend ? "Friend" : "Public profile"}</span>
            <span class="status-pill">${user.shelf.length} titles</span>
            <span class="status-pill ${sharedCount > 0 ? "green" : ""}">${
              sharedCount || 0
            } shared</span>
          </div>
          <div class="person-actions">
            <button
              class="mini-action ${isSelected ? "is-active" : ""}"
              type="button"
              data-people-action="open"
              data-user-id="${escapeHtml(user.id)}"
            >
              View list
            </button>
            <button
              class="mini-action ${isFriend ? "is-active" : ""}"
              type="button"
              data-people-action="friend"
              data-user-id="${escapeHtml(user.id)}"
            >
              ${isFriend ? "Remove friend" : "Add friend"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");
  queuePretextRender();
}

function renderPublicProfile() {
  ensureSelectedProfile();
  const activeUser = getActiveUser();
  const selectedUser = getUserById(appState.selectedProfileId);

  if (!selectedUser) {
    elements.publicProfileTitle.textContent = "Open a user list";
    elements.followSelectedButton.classList.add("is-hidden");
    elements.publicProfile.innerHTML = `
      <article class="public-summary">
        <p class="public-empty flow-copy">Pick someone from the people panel to inspect their public shelf.</p>
      </article>
    `;
    queuePretextRender();
    return;
  }

  const isFriend = Boolean(activeUser?.friends.includes(selectedUser.id));
  const isSelf = activeUser?.id === selectedUser.id;
  elements.publicProfileTitle.textContent = `${selectedUser.name}'s list`;
  elements.followSelectedButton.classList.toggle("is-hidden", isSelf);
  elements.followSelectedButton.textContent = isFriend
    ? "Remove friend"
    : "Add friend";

  const bridgeLabel = activeUser
          ? `${sharedTitleCount(activeUser, selectedUser)} shared titles`
    : "Sign in to compare overlap";

  const catalogMap = catalogIndex();
  const listMarkup = selectedUser.shelf
    .slice()
    .sort((left, right) => Number(right.score ?? 0) - Number(left.score ?? 0))
    .map((entry) => {
      const item = catalogMap.get(entry.titleId);
      if (!item) {
        return "";
      }
      const tone = statusToneClass[entry.status] || "";
      return `
        <article class="title-card">
          <div class="title-top">
            ${renderPoster(item)}
            <div class="title-meta">
              <p class="meta-mono">${escapeHtml(item.kind)} · ${escapeHtml(
                String(item.year ?? "")
              )}</p>
              <h3 class="flow-copy">${escapeHtml(item.title)}</h3>
              <p class="meta-line">@${escapeHtml(
                selectedUser.handle
              )} score ${formatScore(entry.score)} · IMDb ${formatScore(
                item.imdbScore
              )}</p>
            </div>
          </div>
          <div class="chip-row">
            <span class="status-pill ${tone}">${escapeHtml(displayShelfStatus(entry.status))}</span>
            <span class="status-pill">${escapeHtml(
              item.genres.slice(0, 2).join(" · ") || "Fresh pick"
            )}</span>
            <a class="imdb-link" href="${escapeHtml(
              imdbUrlForItem(item)
            )}" target="_blank" rel="noreferrer">IMDb</a>
          </div>
          <p class="list-note flow-copy">${escapeHtml(entry.note || item.summary)}</p>
          <div class="card-actions">
            <button
              class="mini-action"
              type="button"
              data-public-borrow="${escapeHtml(item.id)}"
            >
              Add to Watchlist
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  elements.publicProfile.innerHTML = `
    <article class="public-summary">
      <div class="public-header">
        <div class="avatar-xl">${escapeHtml(initialsForName(selectedUser.name))}</div>
        <div>
          <p class="meta-mono">@${escapeHtml(selectedUser.handle)} · ${escapeHtml(
            selectedUser.city
          )}</p>
          <h3 class="public-name flow-copy">${escapeHtml(selectedUser.name)}</h3>
          <p class="meta-line">${escapeHtml(selectedUser.vibe)} · ${escapeHtml(
            bridgeLabel
          )}</p>
        </div>
      </div>
      <p class="list-note flow-copy">${escapeHtml(selectedUser.bio)}</p>
      <div class="chip-row">
        <span class="friend-tag">${isFriend ? "Your friend" : "Public profile"}</span>
        <span class="status-pill">${selectedUser.shelf.length} titles</span>
        <span class="status-pill orange">Taste Match ${calculateBridgeScore(selectedUser)}</span>
      </div>
    </article>
    <div class="public-list">
      ${
        listMarkup ||
        `<article class="public-summary"><p class="public-empty flow-copy">This shelf is empty.</p></article>`
      }
    </div>
  `;
  queuePretextRender();
}

function renderBoards() {
  const boards = appState.store.boards
    .slice()
    .sort(
      (left, right) =>
        new Date(right.createdAt || 0).getTime() -
        new Date(left.createdAt || 0).getTime()
    );

  elements.boardCountLabel.textContent = `${boards.length} threads`;

  if (boards.length === 0) {
    elements.boardGrid.innerHTML = `
      <article class="thread-card">
        <p class="public-empty flow-copy">No threads yet. Post the first board prompt above.</p>
      </article>
    `;
    queuePretextRender();
    return;
  }

  const catalogMap = catalogIndex();
  const activeUser = getActiveUser();

  elements.boardGrid.innerHTML = boards
    .map((board) => {
      const author = getUserById(board.authorId);
      const linkedTitle = board.linkedTitleId
        ? catalogMap.get(board.linkedTitleId)
        : null;
      const isLiked = Boolean(activeUser && board.likes.includes(activeUser.id));
      const commentsMarkup = board.comments
        .map((comment) => {
          const commentAuthor = getUserById(comment.authorId);
          return `
            <div class="comment-row">
              <div class="comment-avatar">${escapeHtml(
                initialsForName(commentAuthor?.name || "PW")
              )}</div>
              <div>
                <p class="meta-mono">@${escapeHtml(
                  commentAuthor?.handle || "ghost"
                )} · ${escapeHtml(formatDateLabel(comment.createdAt))}</p>
                <p class="flow-copy">${escapeHtml(comment.body)}</p>
              </div>
            </div>
          `;
        })
        .join("");

      return `
        <article class="thread-card">
          <div class="thread-top">
            <div class="avatar">${escapeHtml(
              initialsForName(author?.name || "PW")
            )}</div>
            <div>
              <p class="thread-meta">${escapeHtml(board.channel)} · @${escapeHtml(
                author?.handle || "ghost"
              )} · ${escapeHtml(formatDateLabel(board.createdAt))}</p>
              <h3 class="flow-copy">${escapeHtml(board.title)}</h3>
            </div>
          </div>
          <p class="board-body flow-copy">${escapeHtml(board.body)}</p>
          ${
            linkedTitle
              ? `
                <div class="chip-row">
                  <span class="status-pill orange">Linked: ${escapeHtml(
                    linkedTitle.title
                  )}</span>
                  <a class="imdb-link" href="${escapeHtml(
                    imdbUrlForItem(linkedTitle)
                  )}" target="_blank" rel="noreferrer">IMDb</a>
                </div>
              `
              : ""
          }
          <div class="thread-actions">
            <button
              class="mini-action ${isLiked ? "is-active" : ""}"
              type="button"
              data-board-action="like"
              data-board-id="${escapeHtml(board.id)}"
            >
              ${board.likes.length} saves
            </button>
            ${
              linkedTitle
                ? `
                  <button
                    class="mini-action"
                    type="button"
                    data-board-action="save-linked"
                    data-board-id="${escapeHtml(board.id)}"
                    data-title-id="${escapeHtml(linkedTitle.id)}"
                  >
                    Add title to Watchlist
                  </button>
                `
                : ""
            }
            <button
              class="mini-action"
              type="button"
              data-board-action="open-profile"
              data-board-id="${escapeHtml(board.id)}"
              data-user-id="${escapeHtml(author?.id || "")}"
            >
              Open @${escapeHtml(author?.handle || "ghost")}
            </button>
          </div>
          <div class="thread-comments">
            ${
              commentsMarkup ||
              `<p class="public-empty flow-copy">No comments yet. Start the thread.</p>`
            }
            <form class="comment-form" data-comment-form="true" data-board-id="${escapeHtml(
              board.id
            )}">
              <input type="text" name="comment" placeholder="Add a comment..." required />
              <button class="mini-action" type="submit">Comment</button>
            </form>
          </div>
        </article>
      `;
    })
    .join("");
  queuePretextRender();
}

async function loadLiveTvCharts() {
  appState.chartStatusText =
    "Refreshing TVMaze rankings and mapping cards to IMDb where the show exposes an IMDb ID.";
  renderChart();

  try {
    const responses = await Promise.all(
      TVMAZE_PAGES.map((page) =>
        fetch(`https://api.tvmaze.com/shows?page=${page}`)
      )
    );

    if (responses.some((response) => !response.ok)) {
      throw new Error("TVMaze returned a non-200 response.");
    }

    const pages = await Promise.all(
      responses.map((response) => response.json())
    );

    const chartItems = pages
      .flat()
      .map(transformTvMazeShow)
      .filter(Boolean)
      .sort((left, right) => right.rankScore - left.rankScore)
      .slice(0, 8);

    if (chartItems.length < 4) {
      throw new Error("TVMaze chart returned too few usable rows.");
    }

    appState.chartItems = chartItems;
    appState.chartStatusText = `Live chart refreshed ${new Date().toLocaleString(
      undefined,
      {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    )}. Ranking blends TVMaze weight, IMDb-linked metadata, and rating averages.`;
    renderChart();
  } catch (error) {
    appState.chartItems = deepClone(FALLBACK_CHART);
    appState.chartStatusText = `TVMaze is unreachable right now, so this rail is showing a curated fallback chart. ${error.message}`;
    renderChart();
  }
}

function transformTvMazeShow(show) {
  const imdbId = show?.externals?.imdb;
  const rating = Number(show?.rating?.average ?? 0);
  const genres = Array.isArray(show?.genres) ? show.genres.slice(0, 3) : [];

  if (!show?.name || !imdbId || rating < 7 || genres.length === 0) {
    return null;
  }

  const premieredYear = Number(String(show?.premiered || "").slice(0, 4));
  const statusBoost = show?.status === "Running" ? 14 : 4;
  const recencyBoost = Number.isFinite(premieredYear)
    ? Math.max(0, premieredYear - 2014)
    : 0;
  const rankScore =
    Number(show?.weight ?? 0) +
    rating * 9 +
    statusBoost +
    recencyBoost +
    genres.length * 3;

  return {
    id: `tvmaze-${show.id}`,
    title: show.name,
    kind: "TV Show",
    year: Number.isFinite(premieredYear) ? premieredYear : 2024,
    genres,
    imdbId,
    imdbScore: rating,
    chartScore: rankScore,
    runtime: `${show?.averageRuntime || show?.runtime || 45}m episodes`,
    source:
      show?.network?.name ||
      show?.webChannel?.name ||
      show?.officialSite ||
      "TVMaze",
    poster: show?.image?.medium || "",
    summary:
      stripHtml(show?.summary) ||
      `${show.name} is a TVMaze-ranked chart pick with a direct IMDb title page.`,
    rankScore,
  };
}

function buildDiscoveryCards(activeUser) {
  if (!activeUser) {
    return appState.store.catalog
      .slice()
      .sort(
        (left, right) =>
          Number(right.chartScore ?? 0) - Number(left.chartScore ?? 0)
      )
      .slice(0, 4)
      .map((item) => ({
        item,
        bridgeScore: Number(item.chartScore ?? 80) / 2,
        friendStatus: "Planning",
        supporters: [],
        reason:
          "Guest preview pick based on chart momentum and IMDb score. Sign in to replace this with friend-aware recommendations from outside your usual circle.",
      }));
  }

  const catalogMap = catalogIndex();
  const ownedTitleIds = new Set(activeUser.shelf.map((entry) => entry.titleId));
  const myGenres = collectGenreScores(activeUser, catalogMap);
  const myFavoriteGenres = new Set(myGenres.slice(0, 4).map((genre) => genre.name));
  const friendSet = new Set(activeUser.friends);
  const myMovieCount = activeUser.shelf.filter(
    (entry) => catalogMap.get(entry.titleId)?.kind === "Movie"
  ).length;
  const myTvCount = activeUser.shelf.filter(
    (entry) => catalogMap.get(entry.titleId)?.kind === "TV Show"
  ).length;

  return appState.store.catalog
    .filter((item) => !ownedTitleIds.has(item.id))
    .map((item) => {
      const supporters = appState.store.users.filter(
        (user) =>
          user.id !== activeUser.id &&
          user.shelf.some((entry) => entry.titleId === item.id)
      );
      const friendSupporters = supporters.filter((user) =>
        friendSet.has(user.id)
      );
      const outerSupporters = supporters.filter(
        (user) => !friendSet.has(user.id)
      );
      const noveltyGenres = item.genres.filter(
        (genre) => !myFavoriteGenres.has(genre)
      );
      const scoreFromFriends = friendSupporters.length * 22;
      const scoreFromOuterCircle = outerSupporters.length * 16;
      const noveltyScore = noveltyGenres.length * 10;
      const balanceScore =
        item.kind === "Movie" && myMovieCount < myTvCount ? 12 : 6;
      const imdbScore = Number(item.imdbScore ?? 7.4) * 4;
      const chartScore = Number(item.chartScore ?? 80) / 4;
      const bridgeScore =
        scoreFromFriends +
        scoreFromOuterCircle +
        noveltyScore +
        balanceScore +
        imdbScore +
        chartScore;

      return {
        item,
        bridgeScore,
        friendStatus:
          friendSupporters.length > 0
            ? "Watching"
            : outerSupporters.length > 0
              ? "Planning"
              : "Paused",
        supporters,
        reason: buildDiscoveryReason({
          item,
          friendSupporters,
          outerSupporters,
          noveltyGenres,
          myFavoriteGenres,
        }),
      };
    })
    .sort((left, right) => right.bridgeScore - left.bridgeScore)
    .slice(0, 4);
}

function buildDiscoverySummary(activeUser, cards) {
  const catalogMap = catalogIndex();
  const favoriteGenres = collectGenreScores(activeUser, catalogMap)
    .slice(0, 3)
    .map((genre) => genre.name);
  const outerSignals = cards.reduce(
    (total, card) =>
      total + card.supporters.filter((user) => !activeUser.friends.includes(user.id)).length,
    0
  );
  const friendSignals = cards.reduce(
    (total, card) =>
      total + card.supporters.filter((user) => activeUser.friends.includes(user.id)).length,
    0
  );

  return `Your shelf leans ${favoriteGenres.join(
    ", "
  ) || "multi-genre"}. This rail mixes ${friendSignals} friend-backed picks with ${outerSignals} outer-circle signals so your watchlist does not collapse into one recommendation bubble.`;
}

function buildDiscoveryReason({
  item,
  friendSupporters,
  outerSupporters,
  noveltyGenres,
  myFavoriteGenres,
}) {
  const friendHandles = friendSupporters.map((user) => `@${user.handle}`);
  const outerHandles = outerSupporters.map((user) => `@${user.handle}`);
  const noveltyCopy =
    noveltyGenres.length > 0
      ? `It adds ${noveltyGenres.join(", ")} beyond your top shelf tags (${[
          ...myFavoriteGenres,
        ]
          .slice(0, 3)
          .join(", ") || "still forming"}).`
      : "It stays inside your comfort genres, but still has a strong social score.";

  if (friendHandles.length > 0 && outerHandles.length > 0) {
    return `${item.title} is on ${friendHandles.join(
      ", "
    )}'s shelf and also appears in outer-circle lists like ${outerHandles.join(
      ", "
    )}. ${noveltyCopy}`;
  }

  if (friendHandles.length > 0) {
    return `${item.title} is already endorsed by ${friendHandles.join(
      ", "
    )}, which makes it a low-friction group watch. ${noveltyCopy}`;
  }

  if (outerHandles.length > 0) {
    return `${item.title} is not in your friend circle yet, but ${outerHandles.join(
      ", "
    )} logged it, so this is a clean anti-silo import. ${noveltyCopy}`;
  }

  return `${item.title} ranks well on IMDb and chart momentum, making it a strong wildcard when your friends list goes repetitive. ${noveltyCopy}`;
}

function handleAuthSubmit(event) {
  event.preventDefault();
  const handle = normalizeHandle(elements.authHandleInput.value);
  const password = elements.authPasswordInput.value.trim();
  const displayName = elements.authNameInput.value.trim();

  if (!handle) {
    showToast("Add a handle before continuing.");
    return;
  }

  if (appState.authMode === "signin") {
    const user = appState.store.users.find((profile) => profile.handle === handle);
    if (!user || user.password !== password) {
      showToast("That login did not match a local demo account.");
      return;
    }
    appState.activeUserId = user.id;
    appState.selectedProfileId =
      appState.selectedProfileId && appState.selectedProfileId !== user.id
        ? appState.selectedProfileId
        : user.friends[0] || appState.store.users.find((item) => item.id !== user.id)?.id || user.id;
    saveSessionUserId(user.id);
    renderApp();
    showToast(`Welcome back, ${user.name}. Your list and boards are synced in this browser.`);
    return;
  }

  if (!displayName) {
    showToast("Add a display name to create your account.");
    return;
  }
  if (password.length < 3) {
    showToast("Use a password with at least 3 characters for this local demo account.");
    return;
  }
  if (appState.store.users.some((profile) => profile.handle === handle)) {
    showToast(`@${handle} already exists. Try signing in or pick another handle.`);
    return;
  }

  const newUser = {
    id: generateId("user"),
    name: displayName,
    handle,
    password,
    city: "Online",
    bio:
      "New Pretext member building a public shelf and looking for recs beyond a single algorithm bubble.",
    vibe: "Fresh watchlist builder",
    friends: ["user-nova"].filter((userId) => getUserById(userId)),
    shelf: [],
  };

  appState.store.users.push(newUser);
  const nova = getUserById("user-nova");
  if (nova && !nova.friends.includes(newUser.id)) {
    nova.friends.push(newUser.id);
  }
  persistStore();

  appState.activeUserId = newUser.id;
  appState.selectedProfileId = "user-nova";
  saveSessionUserId(newUser.id);
  setAuthMode("signin");
  renderApp();
  showToast(`Account created for ${newUser.name}. Nova was added as your first friend so discovery starts warm.`);
}

async function handleLibrarySubmit(event) {
  event.preventDefault();
  const activeUser = getActiveUser();
  if (!activeUser) {
    showToast("Sign in first to save titles to your shelf.");
    return;
  }

  const title = elements.titleInput.value.trim();
  if (!title) {
    showToast("Add a title before saving to your shelf.");
    return;
  }

  const existingItem = findCatalogItemByTitle(title);
  const genres = parseGenres(elements.genresInput.value);
  const resolvedPoster =
    existingItem?.poster ||
    POSTER_URL_BY_ID[existingItem?.id || ""] ||
    (await resolvePosterForTitle(title, elements.kindInput.value));

  const catalogItem = existingItem
    ? upsertCatalogItem({
        ...existingItem,
        genres: genres.length > 0 ? mergeUnique(existingItem.genres, genres) : existingItem.genres,
        poster: existingItem.poster || resolvedPoster,
      })
    : upsertCatalogItem({
        id: generateTitleId(title),
        title,
        kind: elements.kindInput.value,
        year: new Date().getFullYear(),
        genres: genres.length > 0 ? genres : [elements.kindInput.value],
        imdbScore: Number(elements.scoreInput.value) || null,
        chartScore: 82,
        runtime:
          elements.kindInput.value === "TV Show" ? "New series" : "Feature",
        source: "Community added",
        poster: resolvedPoster,
        summary:
          elements.noteInput.value.trim() ||
          "Community-added title waiting for a sharper summary from your next board post.",
      });

  upsertShelfEntry(activeUser, catalogItem.id, {
    status: elements.statusInput.value,
    score: Number(elements.scoreInput.value) || 0,
    progress: resolveShelfProgress(
      elements.statusInput.value,
      elements.progressInput.value
    ),
    note:
      elements.noteInput.value.trim() ||
      `${catalogItem.title} added from your Pretext shelf composer.`,
  });

  persistStore();
  syncCatalogSuggestions();
  elements.libraryForm.reset();
  elements.kindInput.value = catalogItem.kind;
  elements.statusInput.value = "Watching";
  elements.scoreInput.value = "8.5";
  syncLibraryFormControls();
  elements.titleInput.focus();
  renderApp();
  showToast(`${catalogItem.title} is now on ${activeUser.name}'s public list.`);
}

function handleBoardSubmit(event) {
  event.preventDefault();
  const activeUser = getActiveUser();
  if (!activeUser) {
    showToast("Sign in to publish a community board thread.");
    return;
  }

  const linkedTitleText = elements.boardLinkInput.value.trim();
  const linkedTitle = linkedTitleText
    ? findCatalogItemByTitle(linkedTitleText)
    : null;
  const title = elements.boardTitleInput.value.trim();
  const body = elements.boardBodyInput.value.trim();

  if (!title || !body) {
    showToast("Thread title and body are required.");
    return;
  }

  const board = {
    id: generateId("board"),
    authorId: activeUser.id,
    channel: elements.boardChannelInput.value,
    title,
    body,
    linkedTitleId: linkedTitle?.id || null,
    likes: [activeUser.id],
    createdAt: new Date().toISOString(),
    comments: [],
  };

  appState.store.boards.unshift(board);
  persistStore();
  elements.boardForm.reset();
  renderBoards();
  showToast("Board thread published. Friends can now borrow the linked title or reply.");
}

function handleBoardCommentSubmit(event) {
  const form = event.target.closest("[data-comment-form='true']");
  if (!form) {
    return;
  }
  event.preventDefault();

  const activeUser = getActiveUser();
  if (!activeUser) {
    showToast("Sign in to comment on community boards.");
    return;
  }

  const board = appState.store.boards.find(
    (item) => item.id === form.dataset.boardId
  );
  const input = form.querySelector("input[name='comment']");
  const body = input?.value.trim() || "";
  if (!board || !body) {
    return;
  }

  board.comments.push({
    id: generateId("comment"),
    authorId: activeUser.id,
    body,
    createdAt: new Date().toISOString(),
  });

  input.value = "";
  persistStore();
  renderBoards();
}

function updateShelfStatus(titleId, status) {
  const activeUser = getActiveUser();
  if (!activeUser) {
    return;
  }

  const entry = activeUser.shelf.find((item) => item.titleId === titleId);
  if (!entry) {
    return;
  }

  entry.status = status;
  entry.progress = resolveShelfProgress(status, entry.progress);
  entry.updatedAt = new Date().toISOString();
  persistStore();
  renderApp();
  showToast(`Updated ${findCatalogById(titleId)?.title || "title"} to ${status}.`);
}

function removeShelfEntry(titleId) {
  const activeUser = getActiveUser();
  if (!activeUser) {
    return;
  }

  const item = findCatalogById(titleId);
  activeUser.shelf = activeUser.shelf.filter(
    (entry) => entry.titleId !== titleId
  );
  persistStore();
  renderApp();
  showToast(`${item?.title || "Title"} was removed from your shelf.`);
}

function saveTitleToShelf(titleId, status) {
  const activeUser = getActiveUser();
  if (!activeUser) {
    showToast("Sign in first to add this title to your shelf.");
    return;
  }

  const item = findCatalogById(titleId);
  if (!item) {
    showToast("This title is not in the local catalog yet.");
    return;
  }

  upsertShelfEntry(activeUser, item.id, {
    status,
    score: Number(item.imdbScore ?? 8),
    progress: resolveShelfProgress(status),
    note: `Added from recommendations, charts, or a friend's public list.`,
  });
  persistStore();
  renderApp();
  showToast(`${item.title} saved to ${activeUser.name}'s ${displayShelfStatus(status).toLowerCase()}.`);
}

function toggleFriend(targetUserId) {
  const activeUser = getActiveUser();
  const targetUser = getUserById(targetUserId);

  if (!activeUser) {
    showToast("Sign in first to add people as friends.");
    return;
  }
  if (!targetUser || targetUser.id === activeUser.id) {
    return;
  }

  const isFriend = activeUser.friends.includes(targetUser.id);
  if (isFriend) {
    activeUser.friends = activeUser.friends.filter(
      (userId) => userId !== targetUser.id
    );
    targetUser.friends = targetUser.friends.filter(
      (userId) => userId !== activeUser.id
    );
    showToast(`@${targetUser.handle} was removed from your friend list.`);
  } else {
    activeUser.friends.push(targetUser.id);
    if (!targetUser.friends.includes(activeUser.id)) {
      targetUser.friends.push(activeUser.id);
    }
    appState.selectedProfileId = targetUser.id;
    showToast(`@${targetUser.handle} is now your friend. Their list will influence discovery picks.`);
  }

  persistStore();
  renderApp();
}

function toggleBoardLike(boardId) {
  const activeUser = getActiveUser();
  if (!activeUser) {
    showToast("Sign in to save board threads.");
    return;
  }

  const board = appState.store.boards.find((item) => item.id === boardId);
  if (!board) {
    return;
  }

  if (board.likes.includes(activeUser.id)) {
    board.likes = board.likes.filter((userId) => userId !== activeUser.id);
  } else {
    board.likes.push(activeUser.id);
  }

  persistStore();
  renderBoards();
}

function setAuthMode(mode) {
  appState.authMode = mode === "signup" ? "signup" : "signin";
  syncAuthModeControls();
}

function syncAuthModeControls() {
  elements.authModeButtons.forEach((button) =>
    button.classList.toggle(
      "is-active",
      button.dataset.authMode === appState.authMode
    )
  );
  elements.authNameInput.closest(".field-label").classList.toggle(
    "is-hidden",
    appState.authMode !== "signup"
  );
  elements.authSubmit.textContent =
    appState.authMode === "signup" ? "Create account" : "Sign in";
  elements.authPasswordInput.autocomplete =
    appState.authMode === "signup" ? "new-password" : "current-password";
  elements.authHelper.innerHTML =
    appState.authMode === "signup"
      ? "New accounts are stored in this browser only. For a real multi-device launch, swap this local demo auth for Firebase or Supabase."
      : "Demo handles: <strong>nova</strong>, <strong>milo</strong>, <strong>zoya</strong>. Their password is the same as the handle.";
}

function signOut() {
  const activeUser = getActiveUser();
  appState.activeUserId = "";
  saveSessionUserId("");
  setAuthMode("signin");
  elements.authHandleInput.value = activeUser?.handle || DEFAULT_AUTH_HANDLE;
  elements.authPasswordInput.value =
    activeUser?.password || DEFAULT_AUTH_PASSWORD;
  ensureSelectedProfile();
  renderApp();
  showToast("Signed out. Public lists and charts remain available in guest mode.");
}

function calculateBridgeScore(user) {
  const catalogMap = catalogIndex();
  const ownGenres = new Set();
  const friendGenres = new Set();
  const statusSpread = new Set(user.shelf.map((entry) => entry.status));
  let movieCount = 0;
  let tvCount = 0;

  user.shelf.forEach((entry) => {
    const item = catalogMap.get(entry.titleId);
    if (!item) {
      return;
    }
    item.genres.forEach((genre) => ownGenres.add(genre));
    if (item.kind === "Movie") {
      movieCount += 1;
    }
    if (item.kind === "TV Show") {
      tvCount += 1;
    }
  });

  user.friends.forEach((friendId) => {
    const friend = getUserById(friendId);
    friend?.shelf.forEach((entry) => {
      const item = catalogMap.get(entry.titleId);
      item?.genres.forEach((genre) => friendGenres.add(genre));
    });
  });

  const unexploredFriendGenres = [...friendGenres].filter(
    (genre) => !ownGenres.has(genre)
  ).length;
  const typeBalanceBonus = movieCount > 0 && tvCount > 0 ? 12 : 4;
  const rawScore =
    20 +
    ownGenres.size * 4 +
    statusSpread.size * 5 +
    user.friends.length * 7 +
    unexploredFriendGenres * 4 +
    typeBalanceBonus;

  return Math.max(10, Math.min(99, Math.round(rawScore)));
}

function collectGenreScores(user, catalogMap) {
  const genreScores = new Map();
  user.shelf.forEach((entry) => {
    const item = catalogMap.get(entry.titleId);
    if (!item) {
      return;
    }
    item.genres.forEach((genre) => {
      genreScores.set(genre, (genreScores.get(genre) || 0) + 1);
    });
  });

  return [...genreScores.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
}

function summarizeUserShelf(user) {
  const catalogMap = catalogIndex();
  const topTitles = user.shelf
    .slice()
    .sort((left, right) => Number(right.score ?? 0) - Number(left.score ?? 0))
    .slice(0, 3)
    .map((entry) => catalogMap.get(entry.titleId)?.title)
    .filter(Boolean);

  if (topTitles.length === 0) {
    return "No public titles yet.";
  }
  return `Top shelf: ${topTitles.join(", ")}.`;
}

function sharedTitleCount(activeUser, profile) {
  if (!activeUser || !profile) {
    return 0;
  }
  const ownIds = new Set(activeUser.shelf.map((entry) => entry.titleId));
  return profile.shelf.filter((entry) => ownIds.has(entry.titleId)).length;
}

function renderStatusOptions(selectedStatus) {
  return ["Watching", "Planning", "Completed", "Paused", "Dropped"]
    .map(
      (status) => `
        <option value="${escapeHtml(status)}" ${
          status === selectedStatus ? "selected" : ""
        }>${escapeHtml(displayShelfStatus(status))}</option>
      `
    )
    .join("");
}

function renderPoster(item) {
  const posterUrl = posterUrlForItem(item);
  return `
    <div class="poster-frame">
      <img
        src="${escapeHtml(posterUrl)}"
        alt="${escapeHtml(item.title)} poster"
        loading="lazy"
        referrerpolicy="no-referrer"
        onerror="this.onerror=null;this.src='${escapeHtml(DEFAULT_POSTER_DATA_URI)}';"
      />
    </div>
  `;
}

function upsertShelfEntry(user, titleId, payload) {
  const existingEntry = user.shelf.find((entry) => entry.titleId === titleId);
  if (existingEntry) {
    existingEntry.status = payload.status;
    existingEntry.score = payload.score;
    existingEntry.progress = resolveShelfProgress(payload.status, payload.progress);
    existingEntry.note = payload.note;
    existingEntry.updatedAt = new Date().toISOString();
    return existingEntry;
  }

  const newEntry = {
    titleId,
    status: payload.status,
    score: payload.score,
    progress: resolveShelfProgress(payload.status, payload.progress),
    note: payload.note,
    updatedAt: new Date().toISOString(),
  };
  user.shelf.unshift(newEntry);
  return newEntry;
}

function upsertCatalogItem(candidate) {
  const existingItem = findCatalogItemByTitle(candidate.title);
  if (existingItem) {
    existingItem.kind = existingItem.kind || candidate.kind;
    existingItem.year = existingItem.year || candidate.year;
    existingItem.genres = mergeUnique(
      existingItem.genres || [],
      candidate.genres || []
    );
    existingItem.imdbId = existingItem.imdbId || candidate.imdbId || "";
    existingItem.imdbScore = Number(existingItem.imdbScore) > 0
      ? Number(existingItem.imdbScore)
      : Number(candidate.imdbScore || 0) || null;
    existingItem.chartScore = Math.max(
      Number(existingItem.chartScore || 0),
      Number(candidate.chartScore || 0)
    );
    existingItem.runtime = existingItem.runtime || candidate.runtime || "";
    existingItem.source = existingItem.source || candidate.source || "";
    existingItem.poster = existingItem.poster || candidate.poster || "";
    existingItem.summary = existingItem.summary || candidate.summary || "";
    return existingItem;
  }

  const item = {
    id: candidate.id || generateId("title"),
    title: candidate.title,
    kind: candidate.kind || "TV Show",
    year: Number(candidate.year) || new Date().getFullYear(),
    genres:
      Array.isArray(candidate.genres) && candidate.genres.length > 0
        ? candidate.genres
        : ["Fresh pick"],
    imdbId: normalizeImdbId(candidate.imdbId || ""),
    imdbScore: Number(candidate.imdbScore || 0) || null,
    chartScore: Number(candidate.chartScore || 80),
    runtime: candidate.runtime || "New title",
    source: candidate.source || "Community",
    poster: candidate.poster || "",
    summary:
      candidate.summary ||
      "A community-added title waiting for friend comments and board recs.",
  };

  appState.store.catalog.push(item);
  return item;
}

function findCatalogItemByTitle(title) {
  const normalizedTitle = normalizeTitle(title);
  return appState.store.catalog.find(
    (item) => normalizeTitle(item.title) === normalizedTitle
  );
}

function findCatalogById(id) {
  return appState.store.catalog.find((item) => item.id === id);
}

function catalogIndex() {
  return new Map(appState.store.catalog.map((item) => [item.id, item]));
}

function getActiveUser() {
  return getUserById(appState.activeUserId);
}

function getUserById(userId) {
  return appState.store.users.find((user) => user.id === userId) || null;
}

function ensureSelectedProfile() {
  const selectedExists = appState.store.users.some(
    (user) => user.id === appState.selectedProfileId
  );
  if (selectedExists) {
    return;
  }

  const activeUser = getActiveUser();
  const fallbackUser =
    appState.store.users.find((user) => user.id !== activeUser?.id) ||
    appState.store.users[0] ||
    null;
  appState.selectedProfileId = fallbackUser?.id || "";
}

function syncCatalogSuggestions() {
  elements.catalogSuggestions.innerHTML = appState.store.catalog
    .slice()
    .sort((left, right) => left.title.localeCompare(right.title))
    .map(
      (item) =>
        `<option value="${escapeHtml(item.title)}">${escapeHtml(
          item.kind
        )} · IMDb ${formatScore(item.imdbScore)}</option>`
    )
    .join("");
}

function persistStore() {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(appState.store));
  } catch (error) {
    showToast(`Could not save local demo state: ${error.message}`);
  }
}

function loadStore() {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) {
      return buildSeedStore();
    }
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      !Array.isArray(parsed.catalog) ||
      !Array.isArray(parsed.users) ||
      !Array.isArray(parsed.boards)
    ) {
      return buildSeedStore();
    }
    return normalizeStorePayload(parsed);
  } catch {
    return buildSeedStore();
  }
}

function buildSeedStore() {
  return normalizeStorePayload({
    catalog: deepClone(SEED_CATALOG),
    users: deepClone(SEED_USERS),
    boards: deepClone(SEED_BOARDS),
  });
}

function normalizeStorePayload(store) {
  return {
    catalog: store.catalog.map((item) => ({
      ...item,
      poster:
        item.poster ||
        POSTER_URL_BY_ID[item.id] ||
        POSTER_URL_BY_ID[normalizeTitleToId(item.title)] ||
        DEFAULT_POSTER_DATA_URI,
    })),
    users: store.users.map((user) => ({
      ...user,
      shelf: Array.isArray(user.shelf)
        ? user.shelf.map((entry) => ({
            ...entry,
            progress: resolveShelfProgress(entry.status, entry.progress),
          }))
        : [],
    })),
    boards: store.boards,
  };
}

function saveSessionUserId(userId) {
  try {
    if (!userId) {
      window.localStorage.removeItem(SESSION_KEY);
      return;
    }
    window.localStorage.setItem(SESSION_KEY, userId);
  } catch {
    // Session persistence is best-effort only for the static demo.
  }
}

function loadSessionUserId() {
  try {
    return window.localStorage.getItem(SESSION_KEY) || "";
  } catch {
    return "";
  }
}

function normalizeHandle(handle) {
  return handle.trim().toLowerCase().replace(/^@+/, "");
}

function normalizeTitle(title) {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeTitleToId(title) {
  return String(title || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeImdbId(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) {
    return "";
  }
  const match = value.match(/tt\d{6,10}/i);
  return match ? match[0].toLowerCase() : "";
}

function parseGenres(rawValue) {
  return rawValue
    .split(",")
    .map((genre) => genre.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function mergeUnique(leftList, rightList) {
  return [...new Set([...(leftList || []), ...(rightList || [])])].filter(Boolean);
}

function generateId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function generateTitleId(title) {
  const slug = normalizeTitleToId(title).slice(0, 40) || "title";
  return `${slug}-${Math.random().toString(36).slice(2, 7)}`;
}

function defaultProgressLabel(status) {
  return {
    Watching: "In progress",
    Planning: "Watchlist queue",
    Completed: "",
    Paused: "On pause",
    Dropped: "Dropped",
  }[status] || "Tracked";
}

function isCompletedStatus(status) {
  return status === "Completed";
}

function resolveShelfProgress(status, rawValue = "") {
  if (isCompletedStatus(status)) {
    return "";
  }

  const value = String(rawValue || "").trim();
  return value || defaultProgressLabel(status);
}

function displayProgressLabel(entry) {
  if (!entry || isCompletedStatus(entry.status)) {
    return "";
  }

  return String(entry.progress || "").trim();
}

function renderMetaParts(parts) {
  return parts.filter(Boolean).map((part) => escapeHtml(part)).join(" · ");
}

function syncLibraryFormControls() {
  if (!elements.progressField || !elements.progressInput) {
    return;
  }

  const shouldHideProgress = isCompletedStatus(elements.statusInput.value);
  elements.progressField.hidden = shouldHideProgress;
  elements.progressField.classList.toggle("is-hidden", shouldHideProgress);
  elements.progressInput.disabled = shouldHideProgress;

  if (shouldHideProgress) {
    elements.progressInput.value = "";
  }
}

function displayShelfStatus(status) {
  return status === "Planning" ? "Watchlist" : status;
}

function initialsForName(name) {
  return String(name || "PW")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "PW";
}

function posterUrlForItem(item) {
  return (
    item.poster ||
    POSTER_URL_BY_ID[item.id] ||
    POSTER_URL_BY_ID[normalizeTitleToId(item.title)] ||
    DEFAULT_POSTER_DATA_URI
  );
}

async function resolvePosterForTitle(title, kind) {
  try {
    if (kind === "TV Show") {
      const response = await fetch(
        `https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(title)}`
      );
      if (!response.ok) {
        return DEFAULT_POSTER_DATA_URI;
      }
      const show = await response.json();
      return show?.image?.original || show?.image?.medium || DEFAULT_POSTER_DATA_URI;
    }

    const searchResponse = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        `${title} film`
      )}&format=json&origin=*`
    );
    if (!searchResponse.ok) {
      return DEFAULT_POSTER_DATA_URI;
    }
    const searchPayload = await searchResponse.json();
    const pageTitle = searchPayload?.query?.search?.[0]?.title;
    if (!pageTitle) {
      return DEFAULT_POSTER_DATA_URI;
    }

    const summaryResponse = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        pageTitle.replace(/\s+/g, "_")
      )}`
    );
    if (!summaryResponse.ok) {
      return DEFAULT_POSTER_DATA_URI;
    }
    const summaryPayload = await summaryResponse.json();
    return (
      summaryPayload?.originalimage?.source ||
      summaryPayload?.thumbnail?.source ||
      DEFAULT_POSTER_DATA_URI
    );
  } catch {
    return DEFAULT_POSTER_DATA_URI;
  }
}

function formatScore(score) {
  const numeric = Number(score);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return "N/A";
  }
  return numeric.toFixed(1);
}

function imdbUrlForItem(item) {
  return item.imdbId
    ? `https://www.imdb.com/title/${item.imdbId}/`
    : `https://www.imdb.com/find/?q=${encodeURIComponent(item.title)}`;
}

function stripHtml(htmlValue) {
  return String(htmlValue || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDateLabel(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.remove("is-hidden");
  window.clearTimeout(showToast.hideTimer);
  showToast.hideTimer = window.setTimeout(() => {
    elements.toast.classList.add("is-hidden");
  }, 2800);
}

async function loadPretextRuntime() {
  if (pretextRuntime.api) {
    return pretextRuntime.api;
  }
  if (pretextRuntime.loadingPromise) {
    return pretextRuntime.loadingPromise;
  }

  pretextRuntime.loadingPromise = import(PRETEXT_MODULE_URL)
    .then((module) => {
      pretextRuntime.api = module;
      pretextRuntime.isReady = true;
      queuePretextRender();
      return module;
    })
    .catch((error) => {
      pretextRuntime.isReady = false;
      throw error;
    });

  return pretextRuntime.loadingPromise;
}

function queuePretextRender() {
  if (!pretextRuntime.isReady) {
    return;
  }
  window.cancelAnimationFrame(pretextRuntime.scheduledFrame);
  pretextRuntime.scheduledFrame = window.requestAnimationFrame(() => {
    hydratePretextCopies();
  });
}

function hydratePretextCopies() {
  if (!pretextRuntime.isReady || !pretextRuntime.api) {
    return;
  }

  document.querySelectorAll(".flow-copy").forEach((node) => {
    decoratePretextFlowCopy(node);
  });
}

function decoratePretextFlowCopy(node) {
  const sourceText = node.dataset.flowSource || node.textContent || "";
  node.dataset.flowSource = sourceText;

  const availableWidth = Math.floor(
    node.clientWidth || node.parentElement?.clientWidth || 0
  );
  if (!sourceText.trim() || availableWidth < 140) {
    node.textContent = sourceText;
    node.classList.remove("is-pretext-ready");
    pretextLayoutStore.delete(node);
    return;
  }

  const style = window.getComputedStyle(node);
  const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const lineHeight =
    Number.parseFloat(style.lineHeight) ||
    Number.parseFloat(style.fontSize) * 1.55 ||
    24;

  const { prepareWithSegments, layoutWithLines } = pretextRuntime.api;
  const prepared = prepareWithSegments(sourceText, font);
  const { lines } = layoutWithLines(prepared, availableWidth, lineHeight);

  if (!lines.length) {
    node.textContent = sourceText;
    node.classList.remove("is-pretext-ready");
    pretextLayoutStore.delete(node);
    return;
  }

  node.innerHTML = lines
    .map((line, lineIndex) => {
      const text = line.text || " ";
      const graphemes = Array.from(text);
      const charMarkup = graphemes
        .map((grapheme, charIndex) => {
          const renderedChar = grapheme === " " ? "&nbsp;" : escapeHtml(grapheme);
          return `<span class="flow-grapheme" data-flow-char="${charIndex}">${renderedChar}</span>`;
        })
        .join("");

      return `<span class="flow-line" data-flow-line="${lineIndex}">${charMarkup}</span>`;
    })
    .join("");

  node.classList.add("is-pretext-ready");
  pretextLayoutStore.set(node, {
    lineHeight,
    lineWidths: lines.map((line) => Math.max(line.width, 1)),
    lineLengths: lines.map((line) => Math.max(Array.from(line.text || "").length, 1)),
  });

  node.onmousemove = (event) => updatePretextCursor(node, event);
  node.onmouseleave = () => clearPretextCursor(node);
}

function updatePretextCursor(node, event) {
  const layoutState = pretextLayoutStore.get(node);
  if (!layoutState) {
    return;
  }

  const bounds = node.getBoundingClientRect();
  const lineIndex = clampNumber(
    Math.floor((event.clientY - bounds.top) / layoutState.lineHeight),
    0,
    layoutState.lineWidths.length - 1
  );
  const lineNode = node.querySelector(`[data-flow-line="${lineIndex}"]`);
  if (!lineNode) {
    return;
  }

  const relativeX = clampNumber(event.clientX - bounds.left, 0, bounds.width);
  const lineWidth = layoutState.lineWidths[lineIndex];
  const charCount = layoutState.lineLengths[lineIndex];
  const centerIndex = clampNumber(
    Math.round((relativeX / lineWidth) * (charCount - 1)),
    0,
    charCount - 1
  );

  clearPretextCursor(node);
  Array.from(lineNode.children).forEach((charNode, charIndex) => {
    if (Math.abs(charIndex - centerIndex) <= 2) {
      charNode.classList.add("is-flow-active");
    }
  });
}

function clearPretextCursor(node) {
  node.querySelectorAll(".is-flow-active").forEach((charNode) => {
    charNode.classList.remove("is-flow-active");
  });
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

initApp();
