/**
 * data.js - Data loader and cache for WellBeingBar
 * Fetches and caches all practice data JSON files
 */
const Data = (() => {
  let _practices = null;
  let _categories = null;
  let _benefits = null;
  let _science = null;
  let _traditions = null;
  let _routines = null;
  let _challenges = null;
  let _teachers = null;
  let _parables = null;
  let _medicinal_plants = null;

  async function _load(url) {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Failed to load ${url}: ${resp.status}`);
    return resp.json();
  }

  async function _loadSafe(url) {
    try { return await _load(url); } catch(e) { console.warn('Optional data not loaded:', url); return null; }
  }

  async function init() {
    if (!_practices || !_categories) {
      const [practices, categories, benefits, science, traditions, routines, challenges, teachers, parables, medicinalPlants] = await Promise.all([
        _load('data/practices.json'),
        _load('data/categories.json'),
        _loadSafe('data/benefits.json'),
        _loadSafe('data/science.json'),
        _loadSafe('data/traditions.json'),
        _loadSafe('data/routines.json'),
        _loadSafe('data/challenges.json'),
        _loadSafe('data/teachers.json'),
        _loadSafe('data/parables.json'),
        _loadSafe('data/medicinal-plants.json')
      ]);
      _practices = practices;
      _categories = categories;
      _benefits = benefits;
      _science = science;
      _traditions = traditions;
      _routines = routines;
      _challenges = challenges;
      _teachers = teachers;
      _parables = parables;
      _medicinal_plants = medicinalPlants;
    }
  }

  // Practices
  function getAllPractices() { return _practices || []; }
  function getPractice(id) { return (_practices || []).find(p => p.id === id) || null; }
  function getPracticesByCategory(cat) { return (_practices || []).filter(p => p.category === cat); }
  function getPracticesByTag(tag) { return (_practices || []).filter(p => p.tags && p.tags.includes(tag)); }
  function getPracticesByDifficulty(level) { return (_practices || []).filter(p => p.difficulty === level); }
  function getPracticesBySetting(setting) { return (_practices || []).filter(p => p.settings && p.settings.includes(setting)); }
  function getPracticesByBestFor(need) { return (_practices || []).filter(p => p.best_for && p.best_for.includes(need)); }
  function getPracticesByOrigin(origin) { return (_practices || []).filter(p => p.origin === origin); }
  function getRelatedPractices(practiceId) {
    const p = getPractice(practiceId);
    if (!p || !p.related_practices) return [];
    return p.related_practices.map(id => getPractice(id)).filter(Boolean);
  }

  // Categories
  function getCategories() { return _categories || []; }
  function getCategory(id) { return (_categories || []).find(c => c.id === id) || null; }

  // Benefits
  function getBenefits() { return _benefits || {}; }
  function getBenefitScore(practice, dimension) {
    if (!practice || !practice.benefits) return 0;
    return practice.benefits[dimension] || 0;
  }
  function getOverallBenefitScore(practice) {
    if (!practice || !practice.benefits) return 0;
    const dims = ['emotional', 'physical', 'mental', 'social', 'spiritual'];
    let total = 0;
    dims.forEach(d => { total += practice.benefits[d] || 0; });
    return Math.round((total / (dims.length * 5)) * 100);
  }

  // Science
  function getScience() { return _science || {}; }
  function getScienceLabel(rating) {
    const labels = { 1: 'anecdotal', 2: 'preliminary', 3: 'clinical_trials', 4: 'strong_evidence', 5: 'extensive_meta' };
    return labels[rating] || 'unknown';
  }
  function getScienceColor(rating) {
    const colors = { 1: '#E0E0E0', 2: '#CE93D8', 3: '#7E57C2', 4: '#4A148C', 5: '#311B92' };
    return colors[rating] || '#999';
  }

  // Difficulty
  function getDifficultyLabel(level) {
    const labels = { 1: 'beginner', 2: 'easy', 3: 'moderate', 4: 'challenging', 5: 'advanced' };
    return labels[level] || 'unknown';
  }
  function getDifficultyColor(level) {
    const colors = { 1: '#4CAF50', 2: '#8BC34A', 3: '#FFC107', 4: '#FF9800', 5: '#F44336' };
    return colors[level] || '#999';
  }

  // Traditions
  function getTraditions() { return _traditions || []; }
  function getTradition(id) { return (_traditions || []).find(t => t.id === id) || null; }

  // Routines
  function getRoutines() { return _routines || []; }
  function getRoutine(id) { return (_routines || []).find(r => r.id === id) || null; }

  // Challenges
  function getChallenges() { return _challenges || []; }
  function getChallenge(id) { return (_challenges || []).find(c => c.id === id) || null; }

  // Teachers
  function getTeachers() { return _teachers || []; }
  function getTeacher(id) { return (_teachers || []).find(t => t.id === id) || null; }
  function getTeachersByCategory(cat) { return (_teachers || []).filter(t => t.category === cat); }

  // Parables
  function getParables() { return _parables || []; }
  function getParable(id) { return (_parables || []).find(p => p.id === id) || null; }

  // Medicinal Plants
  function getMedicinalPlants() { return _medicinal_plants || []; }
  function getMedicinalPlant(id) { return (_medicinal_plants || []).find(p => p.id === id) || null; }
  function getMedicinalPlantsByCategory(cat) { return (_medicinal_plants || []).filter(p => p.category === cat); }
  function getMedicinalPlantCategories() {
    const plants = getMedicinalPlants();
    return [...new Set(plants.map(p => p.category))];
  }

  // Top practices
  function getTopByScience(limit) {
    return getAllPractices().filter(p => p.science_rating > 0)
      .sort((a, b) => b.science_rating - a.science_rating).slice(0, limit || 10);
  }
  function getTopByBenefit(dimension, limit) {
    return getAllPractices().filter(p => p.benefits && p.benefits[dimension] > 0)
      .sort((a, b) => (b.benefits[dimension] || 0) - (a.benefits[dimension] || 0)).slice(0, limit || 10);
  }
  function getMostAccessible(limit) {
    return getAllPractices().filter(p => p.difficulty <= 2 && p.equipment_needed === 'none' && p.cost_tier === 1)
      .sort((a, b) => a.time_commitment.minimum_minutes - b.time_commitment.minimum_minutes).slice(0, limit || 10);
  }

  return {
    init,
    getAllPractices, getPractice, getPracticesByCategory, getPracticesByTag,
    getPracticesByDifficulty, getPracticesBySetting, getPracticesByBestFor,
    getPracticesByOrigin, getRelatedPractices,
    getCategories, getCategory,
    getBenefits, getBenefitScore, getOverallBenefitScore,
    getScience, getScienceLabel, getScienceColor,
    getDifficultyLabel, getDifficultyColor,
    getTraditions, getTradition,
    getRoutines, getRoutine,
    getChallenges, getChallenge,
    getTeachers, getTeacher, getTeachersByCategory,
    getParables, getParable,
    getMedicinalPlants, getMedicinalPlant, getMedicinalPlantsByCategory, getMedicinalPlantCategories,
    getTopByScience, getTopByBenefit, getMostAccessible
  };
})();
