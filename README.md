# Fantasy LLM Draft Visualization

## Draft Data Structure

The draft data is stored in `data/state.json` with the following structure:

### Main Fields

- `draft_id`: Unique identifier for the draft
- `status`: Draft status (e.g., "completed")
- `total_rounds`: 15 rounds total
- `teams`: Object containing team rosters
- `pick_history`: Array of all draft picks made
- `draft_order`: Array showing pick order

### Team Structure

Each team has:

- `model`: The LLM model name
- `roster`: Object with positions (GKP, DEF, MID, FWD) containing player arrays

### Player Object

```json
{
  "id": 430,
  "name": "Haaland",
  "team": "Man City",
  "position": "FWD",
  "draft_rank": 2
}
```

### Pick History Entry

```json
{
  "round": 1,
  "pick": 1,
  "team": "o3",
  "player_id": 430,
  "player_name": "Haaland",
  "player_position": "FWD",
  "reasoning": "Draft reasoning text...",
  "timestamp": "2025-08-02T04:09:22.048443"
}
```

## Key Insights from Draft

### Teams (7 total)

1. o3
2. claude-sonnet-4
3. claude-code
4. gpt-4.1
5. gemini-2.5-pro
6. deepseek-r1
7. grok-4

### Draft Pattern

- Snake draft format (1-7, 7-1, 1-7, etc.)
- 15 rounds total
- 105 total picks made

### Position Requirements

- GKP: 2 players
- DEF: 5 players
- MID: 5 players
- FWD: 3 players

### First Round Highlights

1. o3 → Haaland (FWD)
2. claude-sonnet → M.Salah (MID)
3. claude-code → Palmer (MID)
4. gpt-4.1 → Saka (MID)
5. gemini-2.5-pro → Watkins (FWD)
6. deepseek-r1 → Isak (FWD)
7. grok-4 → Ekitiké (FWD)

### Team Strategies Observed

- **o3**: FWD-first strategy, securing Haaland #1 overall
- **claude-sonnet**: MID-heavy approach, took Salah #2
- **claude-code**: Also MID-focused, Palmer at #3
- **gpt-4.1**: Balanced approach with premium MIDs
- **gemini-2.5-pro**: FWD priority with Watkins
- **deepseek-r1**: FWD focus with Isak
- **grok-4**: Aggressive FWD strategy

### Notable Patterns

- Goalkeepers weren't picked until pick #47
- Defenders started going at pick #28
- Heavy emphasis on premium forwards and midfielders early
- Each team has detailed reasoning for their picks

## Visualization Requirements

### Core Features Needed

1. **Draft Board**: 7 columns for teams showing their rosters
2. **Animation System**: Replay draft picks sequentially
3. **Player Cards**: Show player name, team, position, draft rank
4. **Pick Indicator**: Highlight current pick being made
5. **Round/Pick Counter**: Display current draft position
6. **Reasoning Display**: Show LLM's reasoning for each pick

### Enhanced Features

1. **Statistics Dashboard**: Value picks, reaches, position distribution
2. **Playback Controls**: Play/pause, speed adjustment
3. **Hover Effects**: Show player details on hover
4. **Team Logos/Colors**: Visual distinction between teams
5. **Sound Effects**: Optional audio for picks

### Technical Considerations

- Static site for GitHub Pages deployment
- No backend required - all data in JSON
- Smooth animations for engaging experience
- Mobile responsive design
- Performance optimized for 105 picks

## Running Locally

To test the visualization locally:

```bash
# Option 1: Python HTTP Server (included)
python3 serve.py

# Option 2: Python's built-in server
python3 -m http.server 8000

# Option 3: Node.js http-server (if installed)
npx http-server -p 8000
```

Then open http://localhost:8000 in your browser.

## Deploying to GitHub Pages

1. Push all files to a GitHub repository
2. Go to Settings → Pages
3. Select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Save and wait for deployment

The site will be available at: `https://[username].github.io/[repository-name]/`

## Features Implemented

✅ **Animated Draft Board**: 7 columns showing each LLM team's roster
✅ **Draft Replay**: Watch picks happen sequentially with smooth animations
✅ **Player Cards**: Interactive cards showing player details
✅ **Playback Controls**: Play/pause, speed adjustment (0.5x to 4x)
✅ **Progress Bar**: Click to jump to any point in the draft
✅ **Statistics Dashboard**: Real-time stats including best value picks and reaches
✅ **Pick Details**: Click any player to see the LLM's reasoning
✅ **Responsive Design**: Works on mobile, tablet, and desktop
✅ **Dark Theme**: Modern design with neon accents

## Visual Design

- **Dark theme** with subtle gradients for a modern look
- **Team-specific colors** for easy identification
- **Position colors**: GKP (Yellow), DEF (Blue), MID (Green), FWD (Red)
- **Glassmorphism effects** on cards and panels
- **Smooth animations** for all interactions
- **Particle effects** for high-value picks
