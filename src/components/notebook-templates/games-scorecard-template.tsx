'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Plus, Users, Target, Medal, Crown, Info, X, Trash2, Edit2, Loader2, Bot, TrendingUp, BarChart3, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TemplateFooter } from './template-footer';
import { Button } from '@/components/ui/button';

interface GamesScoreCardTemplateProps {
  title: string;
  notebookId?: string;
}

interface Sport {
  id: string;
  name: string;
  icon: string;
}

interface Team {
  id: string;
  name: string;
  sport: string;
  wins: number;
  losses: number;
  draws: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

interface Match {
  id: string;
  sport: string;
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  winner: string | null;
  date: string;
}

interface GameData {
  sports: Sport[];
  teams: Team[];
  matches: Match[];
}

export function GamesScoreCardTemplate({ title, notebookId }: GamesScoreCardTemplateProps) {
  const [sports, setSports] = useState<Sport[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  
  const [showAddSport, setShowAddSport] = useState(false);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [showAIPrediction, setShowAIPrediction] = useState(false);
  
  const [sportForm, setSportForm] = useState({ name: '', icon: '⚽' });
  const [teamForm, setTeamForm] = useState({ name: '', sport: '' });
  const [matchForm, setMatchForm] = useState({ sport: '', team1: '', team2: '', score1: 0, score2: 0 });
  
  const [aiPrediction, setAiPrediction] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedTeam1, setSelectedTeam1] = useState('');
  const [selectedTeam2, setSelectedTeam2] = useState('');

  const [saving, setSaving] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveData = () => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`games-scorecard-${notebookId}`, JSON.stringify({ sports, teams, matches }));
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
        const data: GameData = JSON.parse(saved);
        setSports(data.sports || []);
        setTeams(data.teams || []);
        setMatches(data.matches || []);
      }
    } catch (error) {
      console.error("Failed to load:", error);
    }
  }, [notebookId]);

  useEffect(() => {
    saveData();
  }, [sports, teams, matches]);

  const addSport = () => {
    if (!sportForm.name.trim()) return;
    const newSport: Sport = { id: Date.now().toString(), name: sportForm.name, icon: sportForm.icon };
    setSports([...sports, newSport]);
    setSportForm({ name: '', icon: '⚽' });
    setShowAddSport(false);
  };

  const addTeam = () => {
    if (!teamForm.name.trim() || !teamForm.sport) return;
    const newTeam: Team = {
      id: Date.now().toString(),
      name: teamForm.name,
      sport: teamForm.sport,
      wins: 0,
      losses: 0,
      draws: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0
    };
    setTeams([...teams, newTeam]);
    setTeamForm({ name: '', sport: '' });
    setShowAddTeam(false);
  };

  const addMatch = () => {
    if (!matchForm.team1 || !matchForm.team2 || matchForm.team1 === matchForm.team2) return;
    
    const winner = matchForm.score1 > matchForm.score2 ? matchForm.team1 :
                   matchForm.score2 > matchForm.score1 ? matchForm.team2 : null;
    
    const newMatch: Match = {
      id: Date.now().toString(),
      sport: matchForm.sport,
      team1: matchForm.team1,
      team2: matchForm.team2,
      score1: matchForm.score1,
      score2: matchForm.score2,
      winner,
      date: new Date().toLocaleDateString()
    };
    
    setMatches([newMatch, ...matches]);
    
    // Update team statistics
    setTeams(teams.map(team => {
      if (team.id === matchForm.team1) {
        return {
          ...team,
          wins: winner === team.id ? team.wins + 1 : team.wins,
          losses: winner === matchForm.team2 ? team.losses + 1 : team.losses,
          draws: !winner ? team.draws + 1 : team.draws,
          goalsFor: team.goalsFor + matchForm.score1,
          goalsAgainst: team.goalsAgainst + matchForm.score2,
          points: team.points + (winner === team.id ? 3 : !winner ? 1 : 0)
        };
      }
      if (team.id === matchForm.team2) {
        return {
          ...team,
          wins: winner === team.id ? team.wins + 1 : team.wins,
          losses: winner === matchForm.team1 ? team.losses + 1 : team.losses,
          draws: !winner ? team.draws + 1 : team.draws,
          goalsFor: team.goalsFor + matchForm.score2,
          goalsAgainst: team.goalsAgainst + matchForm.score1,
          points: team.points + (winner === team.id ? 3 : !winner ? 1 : 0)
        };
      }
      return team;
    }));
    
    setMatchForm({ sport: '', team1: '', team2: '', score1: 0, score2: 0 });
    setShowAddMatch(false);
  };

  const predictWinner = async () => {
    if (!selectedTeam1 || !selectedTeam2) return;
    
    const team1 = teams.find(t => t.id === selectedTeam1);
    const team2 = teams.find(t => t.id === selectedTeam2);
    if (!team1 || !team2) return;
    
    setAiLoading(true);
    try {
      const context = `Team 1: ${team1.name}
Wins: ${team1.wins}, Losses: ${team1.losses}, Draws: ${team1.draws}
Goals For: ${team1.goalsFor}, Goals Against: ${team1.goalsAgainst}
Points: ${team1.points}

Team 2: ${team2.name}
Wins: ${team2.wins}, Losses: ${team2.losses}, Draws: ${team2.draws}
Goals For: ${team2.goalsFor}, Goals Against: ${team2.goalsAgainst}
Points: ${team2.points}`;
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notebookId,
          mode: 'chat',
          message: `Based on the following team statistics, predict which team is more likely to win and explain why:\n\n${context}`,
          context: []
        })
      });
      
      if (!res.ok) throw new Error('AI request failed');
      const data = await res.json();
      setAiPrediction(data.response || 'Unable to generate prediction');
    } catch (error) {
      console.error('AI prediction error:', error);
      setAiPrediction('Failed to generate prediction. Please check your API key.');
    } finally {
      setAiLoading(false);
    }
  };

  const sortedTeams = [...teams].sort((a, b) => b.points - a.points);

  return (
    <div className="h-full min-h-0 flex flex-col bg-gradient-to-br from-purple-50 to-pink-50 dark:from-neutral-900 dark:to-neutral-800">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-8">
        <div className="max-w-5xl mx-auto space-y-6">
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

        <div className="grid sm:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-yellow-500 to-amber-500 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-5 w-5" />
              <p className="text-sm opacity-90">Sports</p>
            </div>
            <p className="text-3xl font-bold">{sports.length}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-5 w-5" />
              <p className="text-sm opacity-90">Teams</p>
            </div>
            <p className="text-3xl font-bold">{teams.length}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-5 w-5" />
              <p className="text-sm opacity-90">Matches</p>
            </div>
            <p className="text-3xl font-bold">{matches.length}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Bot className="h-5 w-5" />
              <p className="text-sm opacity-90">AI Predictions</p>
            </div>
            <Button onClick={() => setShowAIPrediction(true)} className="mt-2 w-full bg-white/20 hover:bg-white/30 text-white text-xs">
              Predict Winner
            </Button>
          </Card>
        </div>
        
        <div className="grid sm:grid-cols-3 gap-4">
          <Button onClick={() => setShowAddSport(true)} className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Sport
          </Button>
          <Button onClick={() => setShowAddTeam(true)} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Team
          </Button>
          <Button onClick={() => setShowAddMatch(true)} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Record Match
          </Button>
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
              {teams.length === 0 ? (
                <p className="text-center text-neutral-400 py-8">No teams yet. Add teams to see standings.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-100 dark:bg-neutral-700">
                      <tr>
                        <th className="text-left p-2 font-semibold text-neutral-700 dark:text-neutral-300">#</th>
                        <th className="text-left p-2 font-semibold text-neutral-700 dark:text-neutral-300">Team</th>
                        <th className="text-center p-2 font-semibold text-neutral-700 dark:text-neutral-300">W</th>
                        <th className="text-center p-2 font-semibold text-neutral-700 dark:text-neutral-300">L</th>
                        <th className="text-center p-2 font-semibold text-neutral-700 dark:text-neutral-300">D</th>
                        <th className="text-center p-2 font-semibold text-neutral-700 dark:text-neutral-300">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTeams.map((team, idx) => (
                        <tr key={team.id} className={`border-b border-neutral-200 dark:border-neutral-700 ${idx === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}>
                          <td className="p-2">
                            {idx === 0 ? <Crown className="h-4 w-4 text-yellow-600" /> : idx + 1}
                          </td>
                          <td className="p-2 font-medium text-neutral-900 dark:text-white">{team.name}</td>
                          <td className="p-2 text-center text-green-600">{team.wins}</td>
                          <td className="p-2 text-center text-red-600">{team.losses}</td>
                          <td className="p-2 text-center text-neutral-600 dark:text-neutral-400">{team.draws}</td>
                          <td className="p-2 text-center font-bold text-neutral-900 dark:text-white">{team.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
              {matches.length === 0 ? (
                <p className="text-center text-neutral-400 py-8">No matches recorded yet.</p>
              ) : (
                matches.map(match => {
                  const team1 = teams.find(t => t.id === match.team1);
                  const team2 = teams.find(t => t.id === match.team2);
                  const sport = sports.find(s => s.id === match.sport);
                  return (
                    <Card key={match.id} className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/10 border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white">{sport?.icon} {sport?.name || 'Match'}</h4>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">{match.date}</p>
                        </div>
                        <Medal className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {match.winner === match.team1 && <Trophy className="h-4 w-4 text-yellow-600" />}
                            <span className={`text-sm ${match.winner === match.team1 ? 'font-bold text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400'}`}>
                              {team1?.name || 'Team 1'}
                            </span>
                          </div>
                          <span className="font-bold text-neutral-900 dark:text-white">{match.score1}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {match.winner === match.team2 && <Trophy className="h-4 w-4 text-yellow-600" />}
                            <span className={`text-sm ${match.winner === match.team2 ? 'font-bold text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400'}`}>
                              {team2?.name || 'Team 2'}
                            </span>
                          </div>
                          <span className="font-bold text-neutral-900 dark:text-white">{match.score2}</span>
                        </div>
                        {!match.winner && <p className="text-xs text-center text-neutral-500 mt-2">Draw</p>}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Add Sport Modal */}
        <AnimatePresence>
          {showAddSport && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddSport(false)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-neutral-800 rounded-2xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Add New Sport</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Sport Name</label>
                    <input type="text" value={sportForm.name} onChange={e => setSportForm({...sportForm, name: e.target.value})}
                      placeholder="e.g., Football, Basketball" className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Icon (Emoji)</label>
                    <input type="text" value={sportForm.icon} onChange={e => setSportForm({...sportForm, icon: e.target.value})}
                      placeholder="⚽" className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg outline-none text-2xl" />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => setShowAddSport(false)} className="flex-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white">Cancel</Button>
                    <Button onClick={addSport} className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white">Add Sport</Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Team Modal */}
        <AnimatePresence>
          {showAddTeam && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddTeam(false)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-neutral-800 rounded-2xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Add New Team</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Team Name</label>
                    <input type="text" value={teamForm.name} onChange={e => setTeamForm({...teamForm, name: e.target.value})}
                      placeholder="e.g., Manchester United" className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Sport</label>
                    <select value={teamForm.sport} onChange={e => setTeamForm({...teamForm, sport: e.target.value})}
                      className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg outline-none">
                      <option value="">Select Sport</option>
                      {sports.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => setShowAddTeam(false)} className="flex-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white">Cancel</Button>
                    <Button onClick={addTeam} className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">Add Team</Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Match Modal */}
        <AnimatePresence>
          {showAddMatch && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddMatch(false)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-neutral-800 rounded-2xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Record Match</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Sport</label>
                    <select value={matchForm.sport} onChange={e => setMatchForm({...matchForm, sport: e.target.value})}
                      className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg outline-none">
                      <option value="">Select Sport</option>
                      {sports.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Team 1</label>
                      <select value={matchForm.team1} onChange={e => setMatchForm({...matchForm, team1: e.target.value})}
                        className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg outline-none">
                        <option value="">Select Team</option>
                        {teams.filter(t => !matchForm.sport || t.sport === matchForm.sport).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Team 2</label>
                      <select value={matchForm.team2} onChange={e => setMatchForm({...matchForm, team2: e.target.value})}
                        className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg outline-none">
                        <option value="">Select Team</option>
                        {teams.filter(t => (!matchForm.sport || t.sport === matchForm.sport) && t.id !== matchForm.team1).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Score 1</label>
                      <input type="number" value={matchForm.score1} onChange={e => setMatchForm({...matchForm, score1: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Score 2</label>
                      <input type="number" value={matchForm.score2} onChange={e => setMatchForm({...matchForm, score2: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => setShowAddMatch(false)} className="flex-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white">Cancel</Button>
                    <Button onClick={addMatch} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white">Record Match</Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Prediction Modal */}
        <AnimatePresence>
          {showAIPrediction && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAIPrediction(false)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-neutral-800 rounded-2xl p-6 w-full max-w-2xl">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                  <Bot className="h-6 w-6 text-purple-600" />
                  AI Match Prediction
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Team 1</label>
                      <select value={selectedTeam1} onChange={e => setSelectedTeam1(e.target.value)}
                        className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg outline-none">
                        <option value="">Select Team</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Team 2</label>
                      <select value={selectedTeam2} onChange={e => setSelectedTeam2(e.target.value)}
                        className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg outline-none">
                        <option value="">Select Team</option>
                        {teams.filter(t => t.id !== selectedTeam1).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <Button onClick={predictWinner} disabled={!selectedTeam1 || !selectedTeam2 || aiLoading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:opacity-50">
                    {aiLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing...</> : <><Sparkles className="h-4 w-4 mr-2" />Predict Winner</>}
                  </Button>
                  {aiPrediction && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-400 mb-2 flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        AI Analysis
                      </h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{aiPrediction}</p>
                    </div>
                  )}
                  <Button onClick={() => setShowAIPrediction(false)} className="w-full bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white">Close</Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
      <TemplateFooter />
    </div>
  );
}
