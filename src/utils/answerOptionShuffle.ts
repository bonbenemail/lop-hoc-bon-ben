export const shuffleQuestionOptions = (
  options: string[],
  correctIndex: number,
  seed: string
): { options: string[]; correctIndex: number } => {
  const shuffledIndices = options.map((_, index) => index);
  let state = 2166136261;

  for (const character of seed) {
    state = Math.imul(state ^ character.charCodeAt(0), 16777619) >>> 0;
  }

  for (let index = shuffledIndices.length - 1; index > 0; index--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [shuffledIndices[index], shuffledIndices[swapIndex]] = [
      shuffledIndices[swapIndex],
      shuffledIndices[index],
    ];
  }

  return {
    options: shuffledIndices.map((index) => options[index]),
    correctIndex: shuffledIndices.indexOf(correctIndex),
  };
};
