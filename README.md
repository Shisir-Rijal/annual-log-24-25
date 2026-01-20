# Season of Grind

An interactive web application that visualizes annual gym workout statistics in a wrapped-style presentation format. Features comprehensive fitness data analysis including workout frequency, exercise rankings, volume analysis, consistency heatmaps, and peak performance metrics.

## Tech Stack

- **React 18.3** - UI framework
- **TypeScript 5.8** - Type safety
- **Vite 5.4** - Build tool and dev server
- **Tailwind CSS 3.4** - Styling
- **Shadcn UI** - Component library
- **GSAP** - Advanced animations
- **Recharts** - Data visualization
- **React Router DOM** - Routing
- **TanStack Query** - Data fetching

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## Getting Started

### Installation

Clone the repository and install dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

### Build

Create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

Preview the production build:

```bash
npm run preview
```

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── slides/          # Individual slide components (14 slides)
│   │   ├── IntroSlide.tsx
│   │   ├── ScaleSlide.tsx
│   │   ├── RankingSlide.tsx
│   │   └── ...
│   └── ui/              # Shadcn UI components
├── context/
│   ├── AudioProvider.tsx    # Global audio management (BGM, SFX)
│   └── DataProvider.tsx     # Workout data provider
├── data/
│   ├── clean_workouts.json  # Main workout dataset
│   ├── topSongs.ts          # Soundtrack data
│   └── exerciseMapping.ts   # Exercise mappings
├── hooks/
│   ├── useReducedMotion.ts  # Accessibility hook
│   └── ...
├── pages/
│   ├── Index.tsx            # Main application page
│   └── NotFound.tsx         # 404 page
├── utils/
│   └── dataProcessor.ts     # Data processing utilities
├── config/
│   └── acts.ts              # 5-Act narrative structure
├── index.css                # Global styles
└── main.tsx                 # Application entry point
```

## Features

- **14 Interactive Slides** - Full-screen scrollable presentation
- **5-Act Narrative Structure** - Themed sections (Init, Intelligence, Operations, Identity, Debrief)
- **Audio System** - Background music with smart ducking for interactive elements
- **Accessibility** - Full keyboard navigation, screen reader support, reduced motion
- **Responsive Design** - Mobile-first approach with fluid typography
- **Custom Cursor** - Sci-fi themed custom cursor (desktop only)
- **Data Visualizations** - Charts, heatmaps, treemaps using Recharts

## Slide Overview

1. **IntroSlide** - System initialization with interactive charging sequence
2. **ScaleSlide** - Mission timeline and scope (start date, end date, exercise count)
3. **RankingSlide** - User ranking percentile visualization
4. **FrequencySlide** - Total workouts, volume, hours, weekly average
5. **GrindSlide** - Peak weekday leaderboard
6. **HeatmapSlide** - 12-month consistency heatmap
7. **PeakMonthSlide** - Most active month
8. **TopExercisesSlide** - Signature move and top exercises
9. **VolumeSlide** - Total volume with muscle group treemap
10. **BodySlide** - Interactive body model with strength trends
11. **SoundtrackSlide** - Top workout songs with vinyl player
12. **ArchetypeSlide** - Operator identity with RPG stats
13. **OutroSlide** - Season reward card generation
14. **OutroSlide_2** - Cycle complete and reset

## Data Format

Workout data is expected in JSON format with the following structure:

```json
{
  "rawLogs": [
    {
      "date": "2024-01-15",
      "exerciseName": "Bench Press (Barbell)",
      "weight": 80,
      "reps": 8,
      "sets": 3
    }
  ]
}
```

Place your workout data in `src/data/clean_workouts.json`.

## Customization

### Audio Files

Audio files should be placed in the `public/audio/` directory:
- `soundtrack_2.mp3` - Main background music
- `charge_1.mp3`, `charge_2.mp3`, `charge_3.mp3` - Charge sounds
- `explosion.mp3` - Explosion sound effect

### Music Files

Vinyl music files should be placed in `public/music/` directory with numeric filenames (e.g., `1.mp3`, `2.mp3`).

### Styling

Global styles are defined in `src/index.css`. The project uses a dark theme with neon green accents (`#CCFF00`).

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Custom cursor is disabled on touch devices automatically.

## License

Private project - All rights reserved
