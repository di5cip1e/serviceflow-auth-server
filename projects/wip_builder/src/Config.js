export const Config = {
  // Display
  width: 1920,
  height: 1080,

  // Grid
  tileWidth: 128,
  tileHeight: 64,
  gridSize: 15,

  // Economy
  baseIncome: 10,
  populationIncomeBonus: 5, // +1 income per this many population
  happinessMin: -0.5,
  happinessMax: 1.5,
  happinessPenaltyThreshold: 10, // Population above this incurs happiness penalty
  happinessPenaltyRate: 0.1, // Penalty per population above threshold

  // Timing
  tickInterval: 5000, // Income tick every 5 seconds
};
