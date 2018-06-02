const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MatchSchema = new Schema({
  id: Number,
  season: Number,
  city: String,
  date: String,
  team1: String,
  team2: String,
  toss_winner: String,
  toss_decision: String,
  result: String,
  dl_applied: Number,
  winner: String,
  win_by_runs: Number,
  win_by_wickets: Number,
  player_of_match: String,
  venue: String,
  umpire1: String,
  umpire2: String,
  umpire3: String
});

const Match = mongoose.model('match', MatchSchema);

module.exports = Match;