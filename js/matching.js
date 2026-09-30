(function () {
  function normalize(value) {
    return String(value || '').trim().toLocaleLowerCase('ru');
  }

  function hasSkill(skills, skill) {
    const target = normalize(skill);
    return Array.isArray(skills) && skills.some(function (item) { return normalize(item) === target; });
  }

  function scoreOffer(profile, offer) {
    const exact = hasSkill(profile.teachSkills, offer.learn) && hasSkill(profile.learnSkills, offer.teach);
    const teachesWanted = hasSkill(profile.learnSkills, offer.teach);
    const wantsWhatYouTeach = hasSkill(profile.teachSkills, offer.learn);
    if (exact) return { type: 'exact', score: 3, label: 'Точное совпадение' };
    if (teachesWanted || wantsWhatYouTeach) return { type: 'good', score: 2, label: 'Хорошее совпадение' };
    return { type: 'regular', score: 1, label: 'В каталоге' };
  }

  function findMatches(profile, offers, currentUserId) {
    return offers
      .filter(function (offer) { return offer.userId !== currentUserId && offer.ownerId !== 'self'; })
      .map(function (offer) { return Object.assign({}, offer, { match: scoreOffer(profile, offer) }); })
      .sort(function (first, second) {
        return second.match.score - first.match.score || String(first.userName).localeCompare(String(second.userName), 'ru');
      });
  }

  window.SkillSwapMatching = { scoreOffer: scoreOffer, findMatches: findMatches };
})();