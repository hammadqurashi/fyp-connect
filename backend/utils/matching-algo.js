import natural from "natural";

export function getTextSimilarity(textA, textB) {
  if (!textA || !textB) return 0;

  // Tokenize
  const tokenizer = new natural.WordTokenizer();
  const tokensA = tokenizer.tokenize(textA.toLowerCase());
  const tokensB = tokenizer.tokenize(textB.toLowerCase());

  // Build term frequency vectors
  const allWords = Array.from(new Set([...tokensA, ...tokensB]));
  const vectorA = allWords.map(
    (word) => tokensA.filter((t) => t === word).length
  );
  const vectorB = allWords.map(
    (word) => tokensB.filter((t) => t === word).length
  );

  // Compute cosine similarity
  const dot = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magA = Math.sqrt(vectorA.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(vectorB.reduce((sum, val) => sum + val * val, 0));

  if (magA === 0 || magB === 0) return 0;

  return dot / (magA * magB); // returns a realistic 0 to 1 similarity
}

function jaccardSimilarity(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);

  const intersection = [...setA].filter((x) => setB.has(x));
  const union = new Set([...setA, ...setB]);

  return union.size === 0 ? 0 : intersection.length / union.size;
}

export const calculateMatchPercentage = (sup, students, groupText) => {
  const groupSkills = [...new Set(students.flatMap((s) => s.skills))];
  const groupInterests = [...new Set(students.flatMap((s) => s.interests))];
  const groupDepartment = students[0]?.department;

  const skillsScore = jaccardSimilarity(groupSkills, sup.skills);
  const interestScore = jaccardSimilarity(groupInterests, sup.interests);
  const departmentScore = sup.department === groupDepartment ? 1 : 0;

  const textScore = getTextSimilarity(
    groupText,
    `${sup.description} ${sup.interests.join(" ")}`
  );

  const finalScore =
    skillsScore * 0.35 +
    interestScore * 0.25 +
    departmentScore * 0.2 +
    textScore * 0.2;

  return Math.round(finalScore * 100);
};
