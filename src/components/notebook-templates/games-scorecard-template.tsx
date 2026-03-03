'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Plus, Users, Target, Medal, Crown, Info, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface GamesScoreCardTemplateProps {
  title: string;
  notebookId?: string;
}

interface Player {
  id: number;
  name: string;
  score: number;
  wins: number;
}

interface Match {
  id: number;
  game: string;
  players: string[];
  winner: string;
  date: string;
  scores: { [key: string]: number };
}

export function GamesScoreCardTemplate({ title, notebookId }: GamesScoreCardTemplateProps) {
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: 'Alice', score: 450, wins: 8 },
    { id: 2, name: 'Bob', score: 380, wins: 6 },
    { id: 3, name: 'Charlie', score: 420, wins: 7 },
    { id: 4, name: 'Diana', score: 390, wins: 5 },
  ]);

  const [matches, setMatches] = useState<Match[]>([
    { id: 1, game: 'Chess', players: ['Alice', 'Bob'], winner: 'Alice', date: 'Jan 24', scores: { Alice: 1, Bob: 0 } },
    { id: 2, game: 'Scrabble', players: ['Charlie', 'Diana'], winner: 'Charlie', date: 'Jan 24', scores: { Charlie: 285, Diana: 240 } },
    { id: 3, game: 'Table Tennis', players: ['Alice', 'Charlie'], winner: 'Alice', date: 'Jan 25', scores: { Alice: 21, Charlie: 18 } },
  ]);

  const [saving, setSaving] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveData = () => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`games-scorecard-${notebookId}`, JSON.stringify({ players, matches }));
      } catch (error) {
        console.error("Failed to save:", error);
      } finally {
        setSaving(false);
      }
    }, 500);
  };

  useEffect(() => {
    if (!notebookId) return;
    try {
      const saved = localStorage.getItem(`games-scorecard-${notebookId}`);
      if (saved) {
        const data = JSON.parse(saved);
        setPlayers(data.players || []);
        setMatches(data.matches || []);
      }
    } catch (error) {
      console.error("Failed to load:", error);
    }
  }, [notebookId]);

  useEffect(() => {
    saveData();
  }, [players, matches]);

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="h-full bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-neutral-900 dark:to-neutral-800 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
              {title}
            </h1>
            <button
              onClick={() => setShowDocumentation(true)}
              className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
              title="Documentation"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">Track matches and scores</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-yellow-500 to-amber-500 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-5 w-5" />
              <p className="text-sm opacity-90">Total Matches</p>
            </div>
            <p className="text-3xl font-bold">{matches.length}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-5 w-5" />
              <p className="text-sm opacity-90">Players</p>
            </div>
            <p className="text-3xl font-bold">{players.length}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-5 w-5" />
              <p className="text-sm opacity-90">Games Played</p>
            </div>
            <p className="text-3xl font-bold">3</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-white dark:bg-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                Leaderboard
              </h3>
            </div>
            <div className="space-y-3">
              {sortedPlayers.map((player, idx) => (
                <div
                  key={player.id}
                  className={`p-4 rounded-lg border-2 ${
                    idx === 0
                      ? 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/20 border-yellow-400 dark:border-yellow-700'
                      : 'bg-neutral-50 dark:bg-neutral-700/50 border-neutral-200 dark:border-neutral-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      idx === 0 ? 'bg-yellow-500 text-white' :
                      idx === 1 ? 'bg-gray-400 text-white' :
                      idx === 2 ? 'bg-amber-600 text-white' :
                      'bg-neutral-300 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300'
                    }`}>
                      {idx === 0 ? <Crown className="h-5 w-5" /> : idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-neutral-900 dark:text-white">{player.name}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{player.wins} wins</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white">{player.score}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">points</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Recent Matches</h3>
              <Button className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                New Match
              </Button>
            </div>
            <div className="space-y-3">
              {matches.map(match => (
                <Card key={match.id} className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/10 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-neutral-900 dark:text-white">{match.game}</h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{match.date}</p>
                    </div>
                    <Medal className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="space-y-2">
                    {match.players.map(player => (
                      <div key={player} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {player === match.winner && <Trophy className="h-4 w-4 text-yellow-600" />}
                          <span className={`text-sm ${player === match.winner ? 'font-bold text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400'}`}>
                            {player}
                          </span>
                        </div>
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {match.scores[player]}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-white dark:bg-neutral-800">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Record New Match</h3>
          <div className="grid md:grid-cols-5 gap-3">
            <select className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg">
              <option>Select Game</option>
              <option>Chess</option>
              <option>Scrabble</option>
              <option>Table Tennis</option>
              <option>Badminton</option>
              <option>Cards</option>
            </select>
            <select className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg">
              <option>Player 1</option>
              {players.map(p => <option key={p.id}>{p.name}</option>)}
            </select>
            <select className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg">
              <option>Player 2</option>
              {players.map(p => <option key={p.id}>{p.name}</option>)}
            </select>
            <select className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg">
              <option>Winner</option>
              {players.map(p => <option key={p.id}>{p.name}</option>)}
            </select>
            <Button className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Record Match
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-center">
          <Trophy className="h-12 w-12 mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">Track Your Gaming Journey</h3>
          <p className="text-yellow-100">Record matches, track scores, and see who's leading</p>
        </Card>

        {/* Documentation Modal */}
        <AnimatePresence>
          {showDocumentation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowDocumentation(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="sticky top-0 bg-gradient-to-r from-yellow-500 to-amber-600 p-6 flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Games Scorecard Guide</h2>
                      <p className="text-yellow-100 text-sm">Track matches and scores</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDocumentation(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🏆 Overview</h3>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      Games Scorecard helps you track competitive gaming sessions with friends and family. Record match results, maintain player leaderboards, track individual statistics, and celebrate victories. Perfect for game nights, tournaments, or casual competitive play.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">✨ Key Features</h3>
                    <div className="grid gap-3">
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-400 mb-1">🎮 Player Leaderboard</h4>
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">Ranked player standings with total scores and win counts.</p>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <h4 className="font-semibold text-amber-900 dark:text-amber-400 mb-1">📊 Match History</h4>
                        <p className="text-sm text-amber-800 dark:text-amber-300">Complete record of all matches with dates, players, and scores.</p>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 dark:text-orange-400 mb-1">🏅 Win Tracking</h4>
                        <p className="text-sm text-orange-800 dark:text-orange-300">Track total wins for each player across all games.</p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <h4 className="font-semibold text-red-900 dark:text-red-400 mb-1">🎯 Score Management</h4>
                        <p className="text-sm text-red-800 dark:text-red-300">Record detailed scores for each match and player.</p>
                      </div>
                      <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
                        <h4 className="font-semibold text-pink-900 dark:text-pink-400 mb-1">📈 Statistics Dashboard</h4>
                        <p className="text-sm text-pink-800 dark:text-pink-300">View total matches, active players, and top performers.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🚀 How to Use</h3>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">Add Players</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Create player profiles for everyone participating in games.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">Record Matches</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Log each match with game type, players, and winner.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">Enter Scores</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Add detailed scores for each player in the match.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">Check Leaderboard</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">View player rankings sorted by total score and wins.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-sm font-bold">5</div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">Review History</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Browse past matches to see performance over time.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-sm font-bold">6</div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">Track Progress</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Monitor win counts and cumulative scores for each player.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💡 Pro Tips</h3>
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 space-y-2">
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Record immediately</strong> - Log matches right after they finish</p>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Be accurate</strong> - Enter correct scores to maintain fair leaderboards</p>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Include dates</strong> - Track when matches occurred for historical reference</p>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Celebrate wins</strong> - Acknowledge top performers and victories</p>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Track multiple games</strong> - Record different game types separately</p>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Review trends</strong> - Look at match history to see improvement over time</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💾 Data Storage</h3>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                      <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                        <strong>Your gaming data is automatically saved locally.</strong> All players, matches, scores, and statistics are stored in your browser's local storage. Look for the "Saving..." indicator to confirm storage.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-6">
                  <button
                    onClick={() => setShowDocumentation(false)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                  >
                    Got it!
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
