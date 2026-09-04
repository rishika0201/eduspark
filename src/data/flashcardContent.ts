export interface FlashcardContent {
  front: string;
  back: string;
}

export interface ChapterFlashcards {
  [chapter: string]: FlashcardContent[];
}

export interface SubjectFlashcards {
  [subject: string]: ChapterFlashcards;
}

/** Class 10 CBSE-style cheat-sheet cards: front = topic label; back = condensed facts (no study-coaching copy). */
export const flashcardData: SubjectFlashcards = {
  Mathematics: {
    'Real Numbers': [
      {
        front: "Real Numbers — Euclid's division lemma",
        back:
          '• Given positive integers a and b, ∃ unique q, r with a = bq + r, 0 ≤ r < b.\n• Used to prove irrationality of √2, √3, etc., and to find HCF (Euclidean algorithm).\n• Algorithm: replace (a,b) with (b,r) until r = 0; then HCF = last non-zero remainder.',
      },
      {
        front: 'Real Numbers — Fundamental theorem of arithmetic',
        back:
          '• Every composite n > 1 can be written as a product of primes; unique up to order.\n• Canonical form: n = p₁^a₁ p₂^a₂ … with primes pᵢ.\n• For two numbers: HCF × LCM = product of the two numbers.',
      },
      {
        front: 'Real Numbers — Rational vs irrational',
        back:
          '• Rational: p/q (q ≠ 0); decimal terminates or repeats.\n• Irrational: cannot be p/q; non-terminating, non-repeating decimals (e.g. √2, π).\n• √p is irrational if prime p divides n but p² does not (standard Class 10 exercises).',
      },
    ],
    'Rational Numbers': [
      {
        front: 'Rational Numbers — definition & closure',
        back:
          '• ℚ = { p/q | p,q ∈ ℤ, q ≠ 0 }.\n• Closed under +, −, ×; division by non-zero rational stays in ℚ.\n• Between any two distinct rationals there are infinitely many rationals (denseness on the line).',
      },
      {
        front: 'Rational Numbers — decimal form',
        back:
          '• Terminating decimal ⇔ denominator (in lowest terms) has prime factors only 2 and 5.\n• Repeating non-terminating decimal ⇔ other primes appear in denominator.\n• Conversion: multiply by 10ᵏ, subtract to eliminate repeating block, solve for x.',
      },
    ],
    Polynomials: [
      {
        front: 'Polynomials — degree & zeros',
        back:
          '• Real k is a zero of p(x) if p(k) = 0 ⇔ (x − k) is a factor (Factor theorem).\n• Linear: at most 1 zero; quadratic: ≤ 2; cubic: ≤ 3.\n• Graph cuts x-axis at real zeros; turning points bounded by degree.',
      },
      {
        front: 'Polynomials — zeros of quadratic',
        back:
          'For ax² + bx + c (a ≠ 0):\n• Sum of zeros α + β = −b/a\n• Product αβ = c/a\n• If α, β known: p(x) = a(x − α)(x − β).',
      },
      {
        front: 'Polynomials — division algorithm',
        back:
          'For polynomials f(x), g(x) ≠ 0, ∃ q(x), r(x) with f(x) = g(x)q(x) + r(x) where deg r < deg g (or r = 0).\n• Used in factorization and finding remaining factors after one factor known.',
      },
    ],
    'Pair of Linear Equations': [
      {
        front: 'Pair of linear equations — consistency (lines)',
        back:
          'a₁x + b₁y + c₁ = 0 ; a₂x + b₂y + c₂ = 0\n• a₁/a₂ ≠ b₁/b₂: intersecting → unique solution (consistent).\n• a₁/a₂ = b₁/b₂ = c₁/c₂: coincident → infinitely many solutions (dependent).\n• a₁/a₂ = b₁/b₂ ≠ c₁/c₂: parallel → no solution (inconsistent).',
      },
      {
        front: 'Pair of linear equations — algebraic methods',
        back:
          '• Substitution: solve one equation for a variable, plug into the other.\n• Elimination: match coefficients, add/subtract to eliminate one variable.\n• Cross-multiplication (Cramer-style) formula for 2×2 systems as in NCERT.',
      },
    ],
    'Quadratic Equations': [
      {
        front: 'Quadratic equations — discriminant',
        back:
          'For ax² + bx + c = 0, a ≠ 0: discriminant D = b² − 4ac.\n• D > 0: two distinct real roots.\n• D = 0: two equal real roots.\n• D < 0: no real roots (complex conjugate pair later).',
      },
      {
        front: 'Quadratic equations — roots',
        back:
          '• Roots: x = (−b ± √D) / (2a).\n• Sum of roots = −b/a; product = c/a.\n• If sum S and product P known: x² − Sx + P = 0.',
      },
      {
        front: 'Quadratic equations — completing the square',
        back:
          'ax² + bx + c = 0 → divide by a, move constant, add (b/2a)² to both sides, write left side as perfect square, take square roots.\n• Same algebra as deriving the quadratic formula.',
      },
    ],
    'Arithmetic Progressions': [
      {
        front: 'AP — nth term',
        back:
          'Sequence with constant difference d: a, a+d, a+2d, …\n• nth term: aₙ = a + (n − 1)d.\n• Three terms in AP: middle = average of neighbors; e.g. a−d, a, a+d.',
      },
      {
        front: 'AP — sum of n terms',
        back:
          '• Sₙ = n/2 [2a + (n − 1)d] = n/2 (a + l) where l = last term.\n• Sum of first n natural numbers: n(n+1)/2.\n• Sum of first n odd numbers: n².',
      },
    ],
    'Similar Triangles': [
      {
        front: 'Similar triangles — criteria',
        back:
          '• AA (or AAA): two equal angles ⇒ similar.\n• SSS: proportional corresponding sides.\n• SAS: one equal angle included between proportional sides.\n• All congruent figures are similar; converse false.',
      },
      {
        front: 'Similar triangles — areas',
        back:
          '• If corresponding sides are in ratio k, areas are in ratio k².\n• Altitudes, medians, angle bisectors to corresponding sides are in ratio k.\n• Basic proportionality theorem (BPT/Thales): line ∥ to one side divides other two sides proportionally.',
      },
    ],
    Circles: [
      {
        front: 'Circles — tangent theorems',
        back:
          '• Tangent ⊥ radius at point of contact.\n• Two tangents from an external point are equal in length.\n• Angle between tangent and chord through contact point = angle in alternate segment.',
      },
      {
        front: 'Circles — chords & angles',
        back:
          '• Equal chords are equidistant from centre; converse true.\n• Perpendicular from centre bisects chord.\n• Angle at centre = 2 × angle at circumference subtended by same arc.',
      },
      {
        front: 'Circles — length formulas (reference)',
        back:
          '• Circumference C = 2πr; area A = πr².\n• Length of arc subtending θ° at centre = (θ/360) × 2πr.\n• Sector area (θ°) = (θ/360) × πr².',
      },
    ],
    'Coordinate Geometry': [
      {
        front: 'Coordinate geometry — distance & section',
        back:
          '• Distance: √[(x₂−x₁)² + (y₂−y₁)²].\n• Section formula (m₁ : m₂): ((m₁x₂ + m₂x₁)/(m₁+m₂), (m₁y₂ + m₂y₁)/(m₁+m₂)).\n• Midpoint: average of coordinates.',
      },
      {
        front: 'Coordinate geometry — area of triangle',
        back:
          'Vertices (x₁,y₁), (x₂,y₂), (x₃,y₃):\n• Area = ½ |x₁(y₂−y₃) + x₂(y₃−y₁) + x₃(y₁−y₂)|.\n• Collinear ⇔ area = 0.',
      },
    ],
    Constructions: [
      {
        front: 'Constructions — similar triangle (scale k)',
        back:
          '• Draw base, copy angle at one end to get ray; mark segment k times a reference length along ray (or use parallel line through a divided segment) to get scaled triangle (AA similarity).\n• Number of steps and justification: corresponding angles equal, sides proportional.',
      },
      {
        front: 'Constructions — tangents from external point',
        back:
          '• Perpendicular bisector of OP (O centre, P external) meets circle at diameter endpoints of circle with OP as hypotenuse; tangent points lie where line from P touches circle (right angle at tangent).\n• Standard NCERT: draw circle, join OP, midpoint M, draw circle diameter OP, intersect original circle, join P to intersection points.',
      },
    ],
    'Trigonometric Ratios': [
      {
        front: 'Trigonometric ratios — identities',
        back:
          '• sin²θ + cos²θ = 1\n• 1 + tan²θ = sec²θ\n• 1 + cot²θ = cosec²θ\n• tan θ = sin θ / cos θ; cot θ = cos θ / sin θ.',
      },
      {
        front: 'Trigonometric ratios — complementary angles',
        back:
          '• sin(90°−θ) = cos θ; cos(90°−θ) = sin θ\n• tan(90°−θ) = cot θ; cot(90°−θ) = tan θ\n• sec(90°−θ) = cosec θ; cosec(90°−θ) = sec θ.',
      },
      {
        front: 'Trigonometric ratios — standard angles',
        back:
          '• sin 30°=1/2, 45°=1/√2, 60°=√3/2\n• cos 30°=√3/2, 45°=1/√2, 60°=1/2\n• tan 30°=1/√3, 45°=1, 60°=√3',
      },
    ],
    'Heights and Distances': [
      {
        front: 'Heights & distances — angle of elevation/depression',
        back:
          '• Angle of elevation: upward from horizontal to line of sight.\n• Angle of depression: downward from horizontal; equals angle of elevation of same line (alternate interior angles if horizontal lines parallel).\n• Model with right triangle; use tan/sin/cos with known side.',
      },
      {
        front: 'Heights & distances — tower & shadow',
        back:
          '• If sun’s elevation θ, height h, shadow s: tan θ = h/s.\n• Two simultaneous right triangles from different points → system of equations in unknown height/distance.',
      },
    ],
    Statistics: [
      {
        front: 'Statistics — mean (grouped)',
        back:
          '• Mean x̄ = Σfᵢxᵢ / Σfᵢ (xᵢ = class mark).\n• Step-deviation shortcut: x̄ = a + (Σfᵢdᵢ/Σfᵢ) × h with dᵢ = (xᵢ − a)/h.',
      },
      {
        front: 'Statistics — mode (grouped)',
        back:
          '• Modal class: highest frequency.\n• Mode ≈ l + [(f₁ − f₀)/(2f₁ − f₀ − f₂)] × h\n  l = lower limit of modal class; f₁ modal freq; f₀,f₂ adjacent; h class width.',
      },
      {
        front: 'Statistics — median (grouped)',
        back:
          '• Median class: first class whose cumulative frequency ≥ n/2.\n• Median ≈ l + [(n/2 − cf)/f] × h\n  cf = cum. freq. before median class; f = freq. of median class.',
      },
    ],
    Probability: [
      {
        front: 'Probability — classical definition',
        back:
          '• P(E) = favourable outcomes / total equally likely outcomes.\n• 0 ≤ P(E) ≤ 1; P(not E) = 1 − P(E).\n• Sure event P=1; impossible event P=0.',
      },
      {
        front: 'Probability — compound events',
        back:
          '• Mutually exclusive: P(A or B) = P(A) + P(B).\n• Independent (definition level): P(A and B) = P(A)×P(B) (for syllabus problems as stated).\n• Complement rule often simplifies “at least one” problems.',
      },
    ],
  },
  Science: {
    'Light - Reflection and Refraction': [
      {
        front: 'Light — laws of reflection',
        back:
          '• Incident ray, reflected ray, normal lie in same plane.\n• Angle of incidence i = angle of reflection r (measured from normal).\n• Plane mirror: virtual image, same size, laterally inverted, distance behind mirror = object distance in front.',
      },
      {
        front: 'Light — spherical mirrors (summary)',
        back:
          '• Concave: converging; focal length f = R/2 (R radius of curvature).\n• Mirror formula: 1/v + 1/u = 1/f (Cartesian sign convention).\n• Linear magnification m = h′/h = −v/u.',
      },
      {
        front: 'Light — refraction & Snell’s law',
        back:
          '• Light bends when medium changes: sin i / sin r = n₂/n₁ = v₁/v₂ (form as in NCERT).\n• Refractive index n = c/v.\n• Lens formula: 1/v − 1/u = 1/f (sign per convention); power P = 1/f (metres), dioptre.',
      },
    ],
    Electricity: [
      {
        front: 'Electricity — Ohm’s law & resistance',
        back:
          '• Ohm’s law (metallic conductors, steady temp.): V = IR.\n• R = ρL/A (ρ resistivity).\n• Series: R = R₁ + R₂; same I.\n• Parallel: 1/R = 1/R₁ + 1/R₂; same V.',
      },
      {
        front: 'Electricity — power & energy',
        back:
          '• P = VI = I²R = V²/R.\n• Energy E = Pt = VIt (joule).\n• 1 kWh = 3.6 × 10⁶ J.\n• Joule heating: H = I²Rt.',
      },
      {
        front: 'Electricity — domestic circuit (facts)',
        back:
          '• Live wire (~220 V w.r.t neutral); fuse/MCB in live.\n• Earth wire: safety path for leakage; top pin of 3-pin plug is earth.\n• Overloading: too many devices → high current; short-circuit: very low R path → very high I.',
      },
    ],
    'Chemical Reactions and Equations': [
      {
        front: 'Chemical reactions — types',
        back:
          '• Combination: A + B → AB.\n• Decomposition: AB → A + B (may need heat/light/electrolysis).\n• Displacement: more reactive replaces less in compound.\n• Double displacement: exchange of ions; often precipitation.',
      },
      {
        front: 'Chemical reactions — redox (intro)',
        back:
          '• Oxidation: gain of O or loss of H or loss of electrons (loosely).\n• Reduction: loss of O or gain of H or gain of electrons.\n• Redox: simultaneous oxidation and reduction.\n• Balance atoms first, then charges/electrons in ionic redox (board level).',
      },
    ],
    'Life Processes': [
      {
        front: 'Life processes — nutrition modes',
        back:
          '• Autotrophic: CO₂ + H₂O → glucose (photosynthesis) using sunlight/chlorophyll; O₂ by-product.\n• Heterotrophic: holozoic (ingestion → digestion → absorption → assimilation → egestion); saprotrophic; parasitic.',
      },
      {
        front: 'Life processes — respiration',
        back:
          '• Aerobic: glucose + O₂ → CO₂ + H₂O + energy (mitochondria).\n• Anaerobic in yeast: ethanol + CO₂ + energy.\n• In muscle fatigue: lactic acid + energy (anaerobic).',
      },
      {
        front: 'Life processes — transportation (human)',
        back:
          '• Double circulation: systemic + pulmonary; four-chamber heart.\n• Artery away from heart (oxygenated except pulmonary artery); vein toward heart (deoxygenated except pulmonary vein).\n• Blood: plasma + RBC (O₂), WBC (immunity), platelets (clotting).',
      },
    ],
    'Heredity and Evolution': [
      {
        front: 'Heredity — Mendel (monohybrid)',
        back:
          '• Traits controlled by factors (genes); alleles T/t.\n• F₁ uniform; F₂ ratio 3:1 (dominant : recessive) for monohybrid cross.\n• Genotype vs phenotype; homozygous / heterozygous.',
      },
      {
        front: 'Heredity — sex determination (humans)',
        back:
          '• XY males; XX females.\n• Male gametes: X or Y; female: X only.\n• Child sex depends on which sperm (X/Y) fertilizes egg (as in NCERT).',
      },
      {
        front: 'Evolution — evidence & classification lens',
        back:
          '• Fossils, comparative anatomy, embryology, molecular similarities.\n• Speciation: accumulation of variation + geographical/isolation factors over generations.\n• Evolution not “progress” to “higher”; adaptation to environment.',
      },
    ],
  },
  'Social Science': {
    'Nationalism in India': [
      {
        front: 'Nationalism in India — 1919–1922',
        back:
          '• Rowlatt Act (1919): detention without trial → Hartal (6 April 1919), Jallianwala Bagh (13 April 1919, Amritsar).\n• Khilafat + Non-Cooperation (1920): Gandhi leadership; bonfire of foreign cloth, boycott schools/courts, titles returned.\n• Chauri Chaura (Feb 1922) → Gandhi withdrew movement.',
      },
      {
        front: 'Nationalism in India — Civil Disobedience',
        back:
          '• Lahore Congress (Dec 1929): Purna Swaraj resolution; 26 Jan 1930 Independence Day observed.\n• Dandi March (12 Mar – 6 Apr 1930): salt law broken.\n• Gandhi–Irwin Pact (1931); Round Table Conferences; movement resumed then withdrawn.',
      },
      {
        front: 'Nationalism in India — Quit India 1942',
        back:
          '• August Kranti / Quit India Resolution (Bombay, Aug 1942).\n• “Do or die”; mass arrests of Congress leaders; underground networks; parallel governments in some areas.\n• Context: WWII; failure of Cripps Mission; widespread repression.',
      },
    ],
    'The Rise of Nationalism in Europe': [
      {
        front: 'Europe — French Revolution & nationalism',
        back:
          '• 1789: sovereignty shifts from monarchy to “people”; la patrie, le citoyen.\n• Civil Code (Napoleonic): equality before law, property rights, simplified administration (also exported by conquest).',
      },
      {
        front: 'Europe — 1848: liberalism & nation-states',
        back:
          '• Revolutions in Paris, Vienna, Berlin, Milan, Venice, Rome, etc.\n• Demands: constitution, parliamentary freedom, nationhood.\n• Frankfort Parliament (German national assembly) — limited success; conservative powers regained control by 1849.',
      },
    ],
  },
};
