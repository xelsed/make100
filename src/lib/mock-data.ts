import type { User, Post, GitHubRepo, Comment } from '@/types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alex Chen',
    email: 'achen@nyu.edu',
    avatarUrl: '',
    bio: 'ITP grad student. Making things that make things.',
    githubUsername: 'alexchen',
    isOnline: true,
    joinedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'u2',
    name: 'Maya Patel',
    email: 'mpatel@nyu.edu',
    avatarUrl: '',
    bio: 'Physical computing & creative code.',
    githubUsername: 'mayap',
    isOnline: true,
    joinedAt: '2026-01-16T00:00:00Z',
  },
  {
    id: 'u3',
    name: 'Jordan Lee',
    email: 'jlee@nyu.edu',
    avatarUrl: '',
    bio: 'Exploring generative art and machine learning.',
    githubUsername: 'jordanlee',
    isOnline: false,
    joinedAt: '2026-01-17T00:00:00Z',
  },
];

const MOCK_REPOS: GitHubRepo[] = [
  {
    url: 'https://github.com/alexchen/led-matrix-synth',
    name: 'led-matrix-synth',
    fullName: 'alexchen/led-matrix-synth',
    description: 'An LED matrix driven by audio synthesis — reactive visuals from sound.',
    language: 'C++',
    stars: 12,
    forks: 3,
    updatedAt: '2026-03-20T00:00:00Z',
  },
  {
    url: 'https://github.com/mayap/clay-printer',
    name: 'clay-printer',
    fullName: 'mayap/clay-printer',
    description: 'DIY clay 3D printer built from salvaged stepper motors.',
    language: 'Python',
    stars: 28,
    forks: 7,
    updatedAt: '2026-03-22T00:00:00Z',
  },
  {
    url: 'https://github.com/jordanlee/diffusion-sketcher',
    name: 'diffusion-sketcher',
    fullName: 'jordanlee/diffusion-sketcher',
    description: 'Turning hand-drawn sketches into animated diffusion sequences.',
    language: 'Python',
    stars: 45,
    forks: 11,
    updatedAt: '2026-03-24T00:00:00Z',
  },
];

const MOCK_COMMENTS: Comment[] = [
  {
    id: 'c1',
    postId: 'p1',
    userId: 'u2',
    user: MOCK_USERS[1],
    content: 'This is incredible — the latency on the LED response is super tight. What baud rate are you running?',
    createdAt: '2026-03-20T14:30:00Z',
  },
  {
    id: 'c2',
    postId: 'p1',
    userId: 'u3',
    user: MOCK_USERS[2],
    content: 'Would love to collab on adding a generative pattern mode to this!',
    createdAt: '2026-03-20T16:45:00Z',
  },
  {
    id: 'c3',
    postId: 'p2',
    userId: 'u1',
    user: MOCK_USERS[0],
    content: 'The clay extrusion consistency looks way better than my attempts. What nozzle diameter?',
    createdAt: '2026-03-22T10:00:00Z',
  },
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    userId: 'u1',
    user: MOCK_USERS[0],
    dayNumber: 47,
    title: 'Audio-Reactive LED Matrix v2',
    content: `## What I built today

Rewired the LED matrix to use a direct SPI connection instead of going through the level shifter. The latency dropped from ~12ms to under 2ms — now the lights genuinely feel like they're *part of the sound*.

### The setup
- 16x16 WS2812B matrix
- Teensy 4.1 running FFT analysis
- Custom PCB for power distribution

### Key insight
The bottleneck wasn't the LEDs or the FFT — it was the serial communication between the audio analysis board and the LED controller. Moving everything onto one Teensy solved it.

\`\`\`cpp
void updateMatrix(float* fftBins, int numBins) {
  for (int i = 0; i < NUM_LEDS; i++) {
    int bin = map(i, 0, NUM_LEDS, 0, numBins);
    leds[i] = CHSV(fftBins[bin] * 255, 240, fftBins[bin] * 200);
  }
  FastLED.show();
}
\`\`\`

### Tomorrow
Want to add a mode where the colors shift based on harmonic content rather than just amplitude.`,
    tags: ['hardware', 'audio', 'LEDs', 'teensy'],
    repos: [MOCK_REPOS[0]],
    reactions: [
      { id: 'r1', postId: 'p1', userId: 'u2', emoji: '🔥', createdAt: '2026-03-20T12:00:00Z' },
      { id: 'r2', postId: 'p1', userId: 'u3', emoji: '🔥', createdAt: '2026-03-20T13:00:00Z' },
      { id: 'r3', postId: 'p1', userId: 'u2', emoji: '👀', createdAt: '2026-03-20T12:05:00Z' },
    ],
    comments: MOCK_COMMENTS.filter(c => c.postId === 'p1'),
    createdAt: '2026-03-20T10:00:00Z',
    updatedAt: '2026-03-20T10:00:00Z',
  },
  {
    id: 'p2',
    userId: 'u2',
    user: MOCK_USERS[1],
    dayNumber: 33,
    title: 'Clay Printer: First Successful Vase',
    content: `## Finally!

After 3 weeks of calibrating, the clay printer produced its first full object without failing mid-print. It's a simple vase but I'm unreasonably proud of it.

### What changed
- Slowed the print speed to 8mm/s (was trying 15mm/s like a fool)
- Added a slight retraction between layers to prevent dripping
- Mixed the clay to a slightly thicker consistency (added 5% moreite)

### Problems remaining
- Layer adhesion is inconsistent on overhangs past 30°
- The peristaltic pump introduces slight pulsing in the extrusion
- Need better clay mixing — air bubbles cause blowouts

### Photos
The vase is about 15cm tall, 8cm diameter. The surface texture from the nozzle ribbing actually looks intentional and nice? Happy accident.`,
    tags: ['3d-printing', 'clay', 'fabrication', 'physical-computing'],
    repos: [MOCK_REPOS[1]],
    reactions: [
      { id: 'r4', postId: 'p2', userId: 'u1', emoji: '🎉', createdAt: '2026-03-22T09:00:00Z' },
      { id: 'r5', postId: 'p2', userId: 'u3', emoji: '❤️', createdAt: '2026-03-22T09:30:00Z' },
      { id: 'r6', postId: 'p2', userId: 'u1', emoji: '🔥', createdAt: '2026-03-22T09:05:00Z' },
      { id: 'r7', postId: 'p2', userId: 'u3', emoji: '🔥', createdAt: '2026-03-22T09:35:00Z' },
    ],
    comments: MOCK_COMMENTS.filter(c => c.postId === 'p2'),
    createdAt: '2026-03-22T08:00:00Z',
    updatedAt: '2026-03-22T08:00:00Z',
  },
  {
    id: 'p3',
    userId: 'u3',
    user: MOCK_USERS[2],
    dayNumber: 21,
    title: 'Diffusion Sketcher: Style Transfer Breakthrough',
    content: `## The sketch-to-animation pipeline works

Took a completely different approach today. Instead of trying to run diffusion on every frame, I'm using the diffusion model to generate **keyframes** and then interpolating between them with optical flow.

### Pipeline
1. Hand-drawn sketch → edge detection
2. Edge map → img2img diffusion (generates styled keyframe)
3. Repeat for every Nth frame
4. Use RAFT optical flow to interpolate between keyframes
5. Blend with original sketch lines for that hand-drawn feel

### Results
- 10x faster than per-frame diffusion
- More temporally coherent (less flickering)
- The optical flow interpolation preserves the "sketchy" quality

### Code snippet
\`\`\`python
def generate_keyframes(sketch_frames, interval=10):
    keyframes = []
    for i in range(0, len(sketch_frames), interval):
        edges = canny(sketch_frames[i])
        styled = pipe(prompt="watercolor painting",
                      image=edges,
                      strength=0.65).images[0]
        keyframes.append((i, styled))
    return keyframes
\`\`\`

This is the most exciting result I've had in weeks.`,
    tags: ['ml', 'diffusion', 'animation', 'python', 'creative-coding'],
    repos: [MOCK_REPOS[2]],
    reactions: [
      { id: 'r8', postId: 'p3', userId: 'u1', emoji: '🤯', createdAt: '2026-03-24T11:00:00Z' },
      { id: 'r9', postId: 'p3', userId: 'u2', emoji: '🤯', createdAt: '2026-03-24T11:30:00Z' },
      { id: 'r10', postId: 'p3', userId: 'u1', emoji: '🔥', createdAt: '2026-03-24T11:05:00Z' },
    ],
    comments: [],
    createdAt: '2026-03-24T10:00:00Z',
    updatedAt: '2026-03-24T10:00:00Z',
  },
];

export const CURRENT_USER = MOCK_USERS[0];

export const EMOJI_OPTIONS = ['🔥', '❤️', '🤯', '👀', '🎉', '💡', '🚀', '✨'];
