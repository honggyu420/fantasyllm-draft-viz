// Draft Visualization JavaScript
let draftData = null;
let currentPickIndex = -1;
let isPlaying = false;
let playbackSpeed = 1;
let animationTimeout = null;

// Team colors and styling
const teamColors = {
  o3: {
    primary: "#7B68EE",
    secondary: "#9370DB",
    gradient: "linear-gradient(135deg, #7B68EE, #9370DB)",
  },
  "claude-sonnet-4": {
    primary: "#F59E0B",
    secondary: "#D97706",
    gradient: "linear-gradient(135deg, #F59E0B, #D97706)",
  },
  "claude-code": {
    primary: "#FF6B6B",
    secondary: "#FFE66D",
    gradient: "linear-gradient(135deg, #FF6B6B, #FFE66D)",
  },
  "gpt-4.1": {
    primary: "#10B981",
    secondary: "#059669",
    gradient: "linear-gradient(135deg, #10B981, #059669)",
  },
  "gemini-2.5-pro": {
    primary: "#4ECDC4",
    secondary: "#44A1A0",
    gradient: "linear-gradient(135deg, #4ECDC4, #44A1A0)",
  },
  "deepseek-r1": {
    primary: "#3B82F6",
    secondary: "#2563EB",
    gradient: "linear-gradient(135deg, #3B82F6, #2563EB)",
  },
  "grok-4": {
    primary: "#EC4899",
    secondary: "#DB2777",
    gradient: "linear-gradient(135deg, #EC4899, #DB2777)",
  },
};

// Position colors
const positionColors = {
  GKP: "#F59E0B",
  DEF: "#3B82F6",
  MID: "#10B981",
  FWD: "#EF4444",
};

// Load draft data on page load
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("data/state.json");
    draftData = await response.json();
    initializeDraftBoard();
    setupEventListeners();
  } catch (error) {
    console.error("Error loading draft data:", error);
  }
});

// Initialize the draft board
function initializeDraftBoard() {
  const board = document.getElementById("draft-board");
  board.innerHTML = "";

  // Create team columns
  Object.entries(draftData.teams).forEach(([teamId, teamData]) => {
    const column = createTeamColumn(teamId, teamData);
    board.appendChild(column);
  });

  // Initialize round markers
  initializeRoundMarkers();
}

// Create a team column
function createTeamColumn(teamId, teamData) {
  const column = document.createElement("div");
  column.className = "team-column";
  column.id = `team-${teamId}`;

  const teamColor = teamColors[teamId];
  column.style.setProperty("--team-primary", teamColor.primary);
  column.style.setProperty("--team-secondary", teamColor.secondary);

  // Team header
  const header = document.createElement("div");
  header.className = "team-header";
  header.style.background = teamColor.gradient;
  header.innerHTML = `
        <h3>${formatTeamName(teamId)}</h3>
    `;
  column.appendChild(header);

  // Roster sections
  const roster = document.createElement("div");
  roster.className = "team-roster";

  // Create position sections
  ["GKP", "DEF", "MID", "FWD"].forEach((position) => {
    const section = document.createElement("div");
    section.className = "position-section";
    section.id = `${teamId}-${position}`;

    const posHeader = document.createElement("div");
    posHeader.className = "position-header";
    posHeader.innerHTML = `<span>${position}</span><span class="position-count">0/${getPositionLimit(
      position
    )}</span>`;
    section.appendChild(posHeader);

    const slots = document.createElement("div");
    slots.className = "player-slots";

    // Create empty slots
    for (let i = 0; i < getPositionLimit(position); i++) {
      const slot = document.createElement("div");
      slot.className = "player-slot empty";
      slot.dataset.position = position;
      slot.dataset.index = i;
      slots.appendChild(slot);
    }

    section.appendChild(slots);
    roster.appendChild(section);
  });

  column.appendChild(roster);
  return column;
}

// Format team name for display
function formatTeamName(teamId) {
  const names = {
    o3: "O3",
    "claude-sonnet-4": "Claude Sonnet",
    "claude-code": "Claude Code",
    "gpt-4.1": "GPT-4.1",
    "gemini-2.5-pro": "Gemini 2.5 Pro",
    "deepseek-r1": "DeepSeek R1",
    "grok-4": "Grok 4",
  };
  return names[teamId] || teamId;
}

// Get position limits
function getPositionLimit(position) {
  const limits = { GKP: 2, DEF: 5, MID: 5, FWD: 3 };
  return limits[position] || 0;
}

// Setup event listeners
function setupEventListeners() {
  document
    .getElementById("play-pause-btn")
    .addEventListener("click", togglePlayback);
  document.getElementById("reset-btn").addEventListener("click", resetDraft);

  // Speed control interaction - improved for mobile
  const speedControl = document.getElementById("speed-control");
  let speedTimeout;
  let isExpanded = false;

  // Better mobile detection
  const isMobile = () => {
    return (
      window.innerWidth <= 768 ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0
    );
  };

  // Add touch device class for CSS targeting
  if (isMobile()) {
    document.body.classList.add("touch-device");
  }

  // Mouse events for desktop only
  speedControl.addEventListener("mouseenter", () => {
    if (!isMobile()) {
      clearTimeout(speedTimeout);
      speedControl.classList.add("expanded");
      isExpanded = true;
    }
  });

  speedControl.addEventListener("mouseleave", () => {
    if (!isMobile()) {
      speedTimeout = setTimeout(() => {
        speedControl.classList.remove("expanded");
        isExpanded = false;
      }, 500);
    }
  });

  // Touch/click events for mobile and desktop
  speedControl.addEventListener("click", (e) => {
    // On mobile, if not expanded, always expand regardless of what was clicked
    if (isMobile() && !isExpanded) {
      e.preventDefault();
      e.stopPropagation();

      // Clear any existing timeout
      clearTimeout(speedTimeout);

      // Expand
      isExpanded = true;
      speedControl.classList.add("expanded");

      // Auto-collapse after 4 seconds if no selection
      speedTimeout = setTimeout(() => {
        speedControl.classList.remove("expanded");
        isExpanded = false;
      }, 4000);

      return; // Exit early to prevent other logic
    }

    // Desktop behavior or mobile when expanded
    if (!e.target.classList.contains("speed-option")) {
      e.preventDefault();
      e.stopPropagation();

      // Clear any existing timeout
      clearTimeout(speedTimeout);

      // Toggle expansion
      isExpanded = !isExpanded;
      speedControl.classList.toggle("expanded", isExpanded);

      // Auto-collapse on mobile after 4 seconds if no selection
      if (isMobile() && isExpanded) {
        speedTimeout = setTimeout(() => {
          speedControl.classList.remove("expanded");
          isExpanded = false;
        }, 4000);
      }
    }
  });

  // Close speed control when clicking outside (mobile only)
  document.addEventListener("click", (e) => {
    if (isMobile() && isExpanded && !speedControl.contains(e.target)) {
      clearTimeout(speedTimeout);
      speedControl.classList.remove("expanded");
      isExpanded = false;
    }
  });

  // Speed option selection
  document.querySelectorAll(".speed-option").forEach((option) => {
    option.addEventListener("click", (e) => {
      // On mobile when collapsed, don't stop propagation so the parent handler can expand
      if (!(isMobile() && !isExpanded)) {
        e.stopPropagation();
      }
      e.preventDefault();
      clearTimeout(speedTimeout);

      // If mobile and collapsed, don't change speed - just let it expand
      if (isMobile() && !isExpanded) {
        return;
      }

      // Remove active class from all options
      document
        .querySelectorAll(".speed-option")
        .forEach((o) => o.classList.remove("active"));
      // Add active class to clicked option
      e.target.classList.add("active");
      // Update playback speed
      playbackSpeed = parseFloat(e.target.dataset.speed);

      // Collapse after selection
      setTimeout(() => {
        speedControl.classList.remove("expanded");
        isExpanded = false;
      }, 200);
    });
  });

  // Progress bar interaction
  const progressBar = document.querySelector(".progress-bar");
  const totalTeams = Object.keys(draftData.teams).length;

  progressBar.addEventListener("click", (e) => {
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;

    // Calculate the exact pick position clicked
    const exactPick = percent * draftData.pick_history.length;

    // Calculate which round this falls into
    const currentRound = Math.ceil(exactPick / totalTeams);

    // Calculate the start and end picks of this round
    const roundStartPick = (currentRound - 1) * totalTeams;
    const roundEndPick = Math.min(
      currentRound * totalTeams - 1,
      draftData.pick_history.length - 1
    );

    // Determine which boundary is closer
    const distanceToStart = Math.abs(exactPick - roundStartPick);
    const distanceToEnd = Math.abs(exactPick - roundEndPick);

    // Jump to the closer boundary
    const targetPick =
      distanceToStart <= distanceToEnd ? roundStartPick : roundEndPick;
    jumpToPick(targetPick);
  });

  // Add hover tooltip for progress bar
  let tooltip = null;
  progressBar.addEventListener("mouseenter", () => {
    tooltip = document.createElement("div");
    tooltip.className = "progress-tooltip";
    document.body.appendChild(tooltip);
  });

  progressBar.addEventListener("mousemove", (e) => {
    if (!tooltip) return;

    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const hoveredRound = Math.max(
      1,
      Math.min(
        draftData.total_rounds,
        Math.ceil(percent * draftData.total_rounds)
      )
    );

    tooltip.textContent = `Round ${hoveredRound}`;
    tooltip.style.left = e.pageX + "px";
    tooltip.style.top = rect.top + window.scrollY - 30 + "px";
  });

  progressBar.addEventListener("mouseleave", () => {
    if (tooltip) {
      tooltip.remove();
      tooltip = null;
    }
  });
}

// Toggle playback
function togglePlayback() {
  isPlaying = !isPlaying;
  const playIcon = document.querySelector(".play-icon");
  const pauseIcon = document.querySelector(".pause-icon");

  if (isPlaying) {
    playIcon.classList.add("hidden");
    pauseIcon.classList.remove("hidden");

    if (currentPickIndex >= draftData.pick_history.length - 1) {
      resetDraft();
    }
    playNextPick();
  } else {
    playIcon.classList.remove("hidden");
    pauseIcon.classList.add("hidden");
    clearTimeout(animationTimeout);
  }
}

// Play next pick
function playNextPick() {
  if (!isPlaying || currentPickIndex >= draftData.pick_history.length - 1) {
    isPlaying = false;
    document.querySelector(".play-icon").classList.remove("hidden");
    document.querySelector(".pause-icon").classList.add("hidden");
    return;
  }

  currentPickIndex++;
  animatePick(currentPickIndex);

  // Schedule next pick
  const delay = 1500 / playbackSpeed; // 1.5 seconds per pick at 1x speed
  animationTimeout = setTimeout(() => playNextPick(), delay);
}

// Animate a single pick
function animatePick(pickIndex) {
  const pick = draftData.pick_history[pickIndex];
  updateDraftStatus(pick);

  // Create and animate player card
  const playerCard = createPlayerCard(pick);
  addPlayerToTeam(pick.team, pick.player_position, playerCard, pick);

  // Update progress
  updateProgress(pickIndex + 1);

  // Removed particle effects for cleaner UI
}

// Update draft status display
function updateDraftStatus(pick) {
  const pickDisplay = document.getElementById("current-pick-display");
  pickDisplay.innerHTML = `
        <span class="pick-context">R${pick.round} • P${pick.pick}</span>
        <span class="picking-team" style="color: ${
          teamColors[pick.team].primary
        }">
            ${formatTeamName(pick.team)}
        </span>
        <span class="picking-action">
            selects
        </span>
        <span class="player-name">${pick.player_name}</span>
        <span class="player-position" style="color: ${
          positionColors[pick.player_position]
        }">${pick.player_position}</span>
    `;

  // Update pick label on handle
  document.getElementById("pick-label").textContent = `Pick ${pick.pick}`;

  // Check if scrolling is needed and set appropriate delay for team column flashing
  let teamFlashDelay = 0;

  if (window.innerWidth <= 1400) {
    // Check if horizontal scroll is needed
    const board = document.querySelector(".draft-board");
    const teamElement = document.getElementById(`team-${pick.team}`);
    if (teamElement && board) {
      const teamRect = teamElement.getBoundingClientRect();
      const boardRect = board.getBoundingClientRect();
      const isTeamVisible =
        teamRect.left >= boardRect.left && teamRect.right <= boardRect.right;

      if (!isTeamVisible) {
        teamFlashDelay = 250; // Match player card delay
      }
    }
  }

  // Team column flashing with dynamic delay
  setTimeout(() => {
    const teamColumn = document.getElementById(`team-${pick.team}`);
    if (teamColumn) {
      teamColumn.classList.add("picking");
      setTimeout(() => {
        teamColumn.classList.remove("picking");
      }, 800);
    }
  }, teamFlashDelay);

  // Auto-scroll is now handled diagonally in the addPlayerCard function
}

// Create player card
function createPlayerCard(pick) {
  const card = document.createElement("div");
  card.className = "player-card";
  card.style.setProperty(
    "--position-color",
    positionColors[pick.player_position]
  );

  // Get player details from roster
  const team = draftData.teams[pick.team];
  const player = team.roster[pick.player_position].find(
    (p) => p.id === pick.player_id
  );

  card.innerHTML = `
        <div class="player-name">${pick.player_name}</div>
        <div class="player-info">
            <span class="player-team">${player ? player.team : ""}</span>
            <span class="draft-rank">#${
              player ? player.draft_rank : pick.pick
            }</span>
        </div>
    `;

  // Add click handler for details
  card.addEventListener("click", () => showPickDetails(pick));

  return card;
}

// Add player to team roster
function addPlayerToTeam(teamId, position, playerCard, pick) {
  const section = document.getElementById(`${teamId}-${position}`);
  const slots = section.querySelectorAll(".player-slot.empty");

  if (slots.length > 0) {
    const slot = slots[0];
    slot.classList.remove("empty");
    slot.innerHTML = "";
    slot.appendChild(playerCard);

    // Update count
    const filledSlots = section.querySelectorAll(
      ".player-slot:not(.empty)"
    ).length;
    section.querySelector(
      ".position-count"
    ).textContent = `${filledSlots}/${getPositionLimit(position)}`;

    // Start with player card hidden and delay appearance until flash time
    playerCard.style.opacity = "0";

    requestAnimationFrame(() => {
      let needsScroll = false;
      let scrollDelay = 0;

      // Check if horizontal scrolling is needed (mobile)
      if (window.innerWidth <= 1400) {
        const board = document.querySelector(".draft-board");
        const teamElement = document.getElementById(`team-${pick.team}`);
        if (teamElement && board) {
          const teamRect = teamElement.getBoundingClientRect();
          const boardRect = board.getBoundingClientRect();
          const isTeamVisible =
            teamRect.left >= boardRect.left &&
            teamRect.right <= boardRect.right;

          if (!isTeamVisible) {
            needsScroll = true;
            scrollDelay = 250;
            setTimeout(() => {
              scrollToPlayerCardDiagonal(playerCard, pick.team);
            }, 50);
          }
        }
      }

      // Check if vertical scrolling is needed (always check)
      const rect = playerCard.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const cardTop = rect.top;
      const cardBottom = rect.bottom;
      const visibleTop = 50;
      const visibleBottom = viewportHeight - 50;

      if (cardTop < visibleTop || cardBottom > visibleBottom) {
        needsScroll = true;
        if (scrollDelay === 0) {
          scrollDelay = 100;
        }
        setTimeout(() => {
          scrollToPlayerCard(playerCard);
        }, 50);
      }

      // Show player card and add flashing
      setTimeout(() => {
        playerCard.style.transition = "opacity 0.3s ease-out";
        playerCard.style.opacity = "1";
        playerCard.classList.add("new-pick");
      }, scrollDelay);

      // Remove the highlight class after animation completes
      setTimeout(() => {
        playerCard.classList.remove("new-pick");
      }, scrollDelay + 800);
    });
  }
}

// Show pick details
function showPickDetails(pick) {
  const detailsPanel = document.getElementById("pick-details");
  const content = document.getElementById("details-content");

  content.innerHTML = `
        <div class="pick-summary">
            <div class="pick-player-name">${pick.player_name}</div>
            <div class="pick-meta">
                <span class="pick-position" style="color: ${
                  positionColors[pick.player_position]
                }">${pick.player_position}</span>
                <span class="separator">•</span>
                <span>Pick #${pick.pick}</span>
                <span class="separator">•</span>
                <span>Round ${pick.round}</span>
            </div>
            <div class="pick-team">by <span style="color: ${
              teamColors[pick.team].primary
            }">${formatTeamName(pick.team)}</span></div>
        </div>
        ${
          pick.reasoning
            ? `
        <div class="pick-reasoning">
            ${pick.reasoning}
        </div>
        `
            : ""
        }
    `;

  detailsPanel.classList.add("show");
}

// Close pick details
function closePickDetails() {
  document.getElementById("pick-details").classList.remove("show");
}

// Removed particle effects for cleaner UI

// Update progress bar
function updateProgress(completedPicks) {
  const percent = (completedPicks / draftData.pick_history.length) * 100;
  document.getElementById("progress-fill").style.width = percent + "%";
  document.getElementById("progress-handle").style.left = percent + "%";
}

// Jump to specific pick
function jumpToPick(pickIndex) {
  // Reset board
  resetDraft(false);

  // Apply all picks up to target
  for (let i = 0; i <= pickIndex && i < draftData.pick_history.length; i++) {
    currentPickIndex = i;
    const pick = draftData.pick_history[i];

    // Add player without animation
    const playerCard = createPlayerCard(pick);
    const section = document.getElementById(
      `${pick.team}-${pick.player_position}`
    );
    const slots = section.querySelectorAll(".player-slot.empty");

    if (slots.length > 0) {
      const slot = slots[0];
      slot.classList.remove("empty");
      slot.innerHTML = "";
      slot.appendChild(playerCard);

      // Update count
      const filledSlots = section.querySelectorAll(
        ".player-slot:not(.empty)"
      ).length;
      section.querySelector(
        ".position-count"
      ).textContent = `${filledSlots}/${getPositionLimit(
        pick.player_position
      )}`;
    }
  }

  // Update status
  if (currentPickIndex >= 0) {
    updateDraftStatus(draftData.pick_history[currentPickIndex]);
    updateProgress(currentPickIndex + 1);
  }
}

// Reset draft
function resetDraft(updateStatus = true) {
  currentPickIndex = -1;
  isPlaying = false;
  clearTimeout(animationTimeout);

  // Reset UI
  document.querySelector(".play-icon").classList.remove("hidden");
  document.querySelector(".pause-icon").classList.add("hidden");

  // Clear all player slots
  document.querySelectorAll(".player-slot").forEach((slot) => {
    slot.classList.add("empty");
    slot.innerHTML = "";
  });

  // Reset position counts
  document.querySelectorAll(".position-count").forEach((count) => {
    const position = count.closest(".position-section").id.split("-")[1];
    count.textContent = `0/${getPositionLimit(position)}`;
  });

  // Reset progress
  updateProgress(0);

  if (updateStatus) {
    document.getElementById("current-pick-display").innerHTML =
      '<span class="picking-team">Click play to begin draft</span>';
    document.getElementById("pick-label").textContent = "Pick 1";
  }
}

// Initialize round markers on the progress bar
function initializeRoundMarkers() {
  const markersContainer = document.getElementById("round-markers");
  if (!markersContainer) return;

  markersContainer.innerHTML = "";

  const totalPicks = draftData.pick_history.length;
  const totalTeams = Object.keys(draftData.teams).length;

  // Add a marker at the start of each round
  for (let round = 1; round <= draftData.total_rounds; round++) {
    const pickNumber = (round - 1) * totalTeams + 1;
    const position = ((pickNumber - 1) / totalPicks) * 100;

    const marker = document.createElement("div");
    marker.className = "round-marker";

    // Make round 1 more prominent
    if (round === 1) {
      marker.classList.add("major");

      // Add label for round 1
      const label = document.createElement("div");
      label.className = "round-marker-label";
      label.textContent = `R${round}`;
      marker.appendChild(label);
    }

    marker.style.left = position + "%";
    markersContainer.appendChild(marker);
  }
}

// Scroll diagonally to player card on mobile (both horizontal and vertical)
function scrollToPlayerCardDiagonal(playerCard, teamId) {
  const board = document.querySelector(".draft-board");
  const teamElement = document.getElementById(`team-${teamId}`);

  if (!teamElement || !board) return;

  // Use native smooth scrolling with proper setup
  const teamRect = teamElement.getBoundingClientRect();
  const boardRect = board.getBoundingClientRect();
  const horizontalTarget =
    teamElement.offsetLeft - (boardRect.width - teamRect.width) / 2;

  board.scrollTo({
    left: horizontalTarget,
    behavior: "smooth",
  });

  // Then check if we need to scroll vertically with reduced delay
  setTimeout(() => {
    const cardRect = playerCard.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const controlsHeight = 100; // Height of floating controls
    const effectiveViewportHeight = viewportHeight - controlsHeight;

    // Check if card is already reasonably visible
    const cardTop = cardRect.top;
    const cardBottom = cardRect.bottom;
    const reasonableTop = 50; // Margin from top
    const reasonableBottom = effectiveViewportHeight - 50; // Margin from bottom (accounting for controls)

    // Only scroll if card is not in reasonable view
    if (cardTop < reasonableTop || cardBottom > reasonableBottom) {
      const cardCenter = cardRect.top + cardRect.height / 2;
      const targetCenter = effectiveViewportHeight / 2;
      const verticalTarget = window.scrollY + cardCenter - targetCenter;

      window.scrollTo({
        top: Math.max(0, verticalTarget),
        behavior: "smooth",
      });
    }
  }, 200); // Reduced delay for vertical scroll
}

// Scroll vertically to center the player card in view
function scrollToPlayerCard(playerCard) {
  const rect = playerCard.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  // In horizontal scroll mode, account for the floating controls at the bottom
  const isHorizontalMode = window.innerWidth <= 1400;
  const controlsHeight = isHorizontalMode ? 100 : 0; // Approximate height of floating controls
  const effectiveViewportHeight = viewportHeight - controlsHeight;

  // Calculate the ideal scroll position to center the card in the effective viewport
  const cardCenter = rect.top + rect.height / 2;
  const targetCenter = effectiveViewportHeight / 2;
  const idealScrollY = window.scrollY + cardCenter - targetCenter;

  // Only scroll if the card is not already visible in a good position
  const cardTop = rect.top;
  const cardBottom = rect.bottom;
  const visibleTop = 50; // Leave some margin at top
  const visibleBottom = effectiveViewportHeight - 50; // Leave margin at bottom

  // Check if card is already well-positioned
  if (cardTop < visibleTop || cardBottom > visibleBottom) {
    window.scrollTo({
      top: Math.max(0, idealScrollY),
      behavior: "smooth",
    });
  }
}

// Scroll to team when they make a pick (horizontal scroll mode)
function scrollToActiveTeam(teamId) {
  if (window.innerWidth > 1400) return; // Only in horizontal scroll mode

  const teamElement = document.getElementById(`team-${teamId}`);
  if (teamElement) {
    // Add active highlight
    document.querySelectorAll(".team-column").forEach((col) => {
      col.classList.remove("active-pick");
    });
    teamElement.classList.add("active-pick");

    // Scroll to team
    teamElement.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });

    // Remove highlight after animation
    setTimeout(() => {
      teamElement.classList.remove("active-pick");
    }, 2000);
  }
}

// Global function for closing details
window.closePickDetails = closePickDetails;
