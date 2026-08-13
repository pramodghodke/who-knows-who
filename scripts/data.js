// Deterministic seed data: a small "real-world-ish" social graph.
// People are split into overlapping communities (workplace, college,
// climbing gym, neighborhood, book club) so that mutual-friend
// recommendations produce meaningful, explainable results.

// Simple seeded PRNG so the graph is identical on every run.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);

const FIRST_NAMES = [
  "Asha", "Rahul", "Meera", "Kabir", "Zara", "Vihaan", "Anya", "Dev",
  "Ishita", "Arjun", "Nadia", "Rohan", "Priya", "Sam", "Leah", "Omar",
  "Tara", "Nikhil", "Maya", "Yusuf", "Sofia", "Karan", "Elena", "Aditya",
  "Grace", "Farhan", "Chloe", "Vikram", "Hana", "Ethan", "Riya", "Marcus",
  "Divya", "Noah", "Simran", "Leo", "Aaliyah", "Rishi", "Emma", "Jai",
  "Layla", "Aryan", "Freya", "Kiran", "Olivia", "Tanvi", "Lucas", "Nisha",
  "Adam", "Pooja",
];
const LAST_NAMES = [
  "Sharma", "Verma", "Khan", "Patel", "Iyer", "Menon", "Rao", "Singh",
  "Gupta", "Reddy", "Nair", "Joshi", "Chatterjee", "Malhotra", "Kapoor",
  "Bose", "Desai", "Pillai", "Kulkarni", "Bhatt", "Fernandes", "Shah",
];
const LOCATIONS = [
  "Pune", "Bengaluru", "Mumbai", "Hyderabad", "Delhi", "Chennai",
  "Kolkata", "Ahmedabad", "Jaipur", "Kochi",
];
const INTERESTS = [
  "Bouldering", "Board games", "Photography", "Trail running", "Jazz",
  "Cooking", "Open source", "Pottery", "Cycling", "Sci-fi novels",
  "Chess", "Filmmaking", "Astronomy", "Surfing", "Gardening",
];

const BIO_TEMPLATES = [
  (i) => `Into ${i[0].toLowerCase()} and ${i[1].toLowerCase()} on weekends.`,
  (i) => `Always up for ${i[0].toLowerCase()} — occasionally drags friends into ${i[1].toLowerCase()}.`,
  (i) => `${i[0]} enthusiast, slowly getting into ${i[1].toLowerCase()}.`,
  (i) => `Splits free time between ${i[0].toLowerCase()} and ${i[1].toLowerCase()}.`,
];

function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}
function pickN(arr, n) {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  }
  return out;
}

const COMMUNITIES = [
  { key: "workplace", label: "Orbitwave (workplace)", size: 12, density: 0.35 },
  { key: "college", label: "Nexus College '18 (college)", size: 10, density: 0.45 },
  { key: "climbing", label: "Boulder House (climbing gym)", size: 9, density: 0.4 },
  { key: "neighborhood", label: "Lakeview Residents (neighborhood)", size: 10, density: 0.3 },
  { key: "bookclub", label: "Chapter & Verse (book club)", size: 9, density: 0.5 },
];

function buildPeople() {
  const people = [];
  let id = 1;
  for (const community of COMMUNITIES) {
    for (let i = 0; i < community.size; i++) {
      const first = pick(FIRST_NAMES);
      const last = pick(LAST_NAMES);
      const interests = pickN(INTERESTS, 2 + Math.floor(rand() * 2));
      people.push({
        id: `p${id}`,
        name: `${first} ${last}`,
        location: pick(LOCATIONS),
        bio: pick(BIO_TEMPLATES)(interests),
        avatarSeed: `${first}${last}${id}`,
        primaryCommunity: community.key,
        interests,
      });
      id++;
    }
  }
  return people;
}

function buildEdges(people) {
  const edgeSet = new Set();
  const edges = [];
  const addEdge = (a, b) => {
    if (a === b) return;
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (edgeSet.has(key)) return;
    edgeSet.add(key);
    edges.push([a, b]);
  };

  // Dense-ish connections within each community.
  for (const community of COMMUNITIES) {
    const members = people.filter((p) => p.primaryCommunity === community.key);
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        if (rand() < community.density) {
          addEdge(members[i].id, members[j].id);
        }
      }
    }
  }

  // A handful of bridge connections across communities — this is what
  // makes "people you may know" interesting: friends of friends who
  // live in a totally different circle.
  const bridgeCount = 26;
  for (let i = 0; i < bridgeCount; i++) {
    const a = pick(people);
    const b = pick(people);
    if (a.primaryCommunity !== b.primaryCommunity) {
      addEdge(a.id, b.id);
    }
  }

  // Make sure nobody is a total island.
  for (const person of people) {
    const hasEdge = edges.some(([a, b]) => a === person.id || b === person.id);
    if (!hasEdge) {
      const other = pick(people.filter((p) => p.id !== person.id));
      addEdge(person.id, other.id);
    }
  }

  return edges;
}

const people = buildPeople();
const edges = buildEdges(people);

module.exports = { people, edges, INTERESTS };
