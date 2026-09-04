export interface Topic {
  name: string;
  subtopics?: string[];
  videoCount?: number;
  questionCount?: number;
  videoUrl?: string;
}

export interface Unit {
  name: string;
  topics: (string | Topic)[];
  page?: string;
}

export interface SubjectSyllabus {
  units: Unit[];
  description?: string;
  totalTopics?: number;
}

export interface Syllabus {
  [subject: string]: SubjectSyllabus;
}

export interface ClassSyllabusMap {
  [className: string]: Syllabus;
}

export interface BoardSyllabusMap {
  [board: string]: ClassSyllabusMap;
}

export const syllabusData: BoardSyllabusMap = {
  "CBSE": {
    "Class 10": {
      "Mathematics": {
        description: "CBSE Class 10 Mathematics - Comprehensive curriculum covering algebra, geometry, and trigonometry",
        totalTopics: 15,
        units: [
          {
            name: "Number Systems",
            topics: [
              {
                name: "Real Numbers",
                subtopics: ["Euclid's Division Lemma", "Fundamental Theorem of Arithmetic", "Irrational Numbers"],
                videoCount: 8,
                questionCount: 45,
                videoUrl: "https://www.youtube.com/embed/IakQ3khHxDE"
              },
              {
                name: "Rational Numbers",
                subtopics: ["Properties", "Operations", "Decimal Representation"],
                videoCount: 6,
                questionCount: 32,
                videoUrl: "https://www.youtube.com/embed/KUkTtr2P8aM"
              }
            ]
          },
          {
            name: "Algebra",
            topics: [
              {
                name: "Polynomials",
                subtopics: ["Division Algorithm", "Zeros of Polynomials", "Factorization"],
                videoCount: 10,
                questionCount: 58,
                videoUrl: "https://www.youtube.com/embed/sqF00lvY6Uw"
              },
              {
                name: "Pair of Linear Equations",
                subtopics: ["Graphical Method", "Algebraic Methods", "Application Problems"],
                videoCount: 12,
                questionCount: 72,
                videoUrl: "https://www.youtube.com/embed/tgs9hamaEBk"
              },
              {
                name: "Quadratic Equations",
                subtopics: ["Standard Form", "Factorization Method", "Quadratic Formula", "Nature of Roots"],
                videoCount: 14,
                questionCount: 85,
                videoUrl: "https://www.youtube.com/embed/T1WIjt-AsY0"
              },
              {
                name: "Arithmetic Progressions",
                subtopics: ["Common Difference", "Nth Term", "Sum of Terms"],
                videoCount: 9,
                questionCount: 50,
                videoUrl: "https://www.youtube.com/embed/BavgZE25B6k"
              }
            ]
          },
          {
            name: "Geometry",
            topics: [
              {
                name: "Similar Triangles",
                subtopics: ["Similarity Criteria", "Properties", "Theorems"],
                videoCount: 11,
                questionCount: 65,
                videoUrl: "https://www.youtube.com/embed/giOFaJj0sFI"
              },
              {
                name: "Circles",
                subtopics: ["Tangents", "Angles in Circles", "Power of a Point"],
                videoCount: 10,
                questionCount: 58,
                videoUrl: "https://www.youtube.com/embed/y3dSZme35yA"
              },
              {
                name: "Coordinate Geometry",
                subtopics: ["Distance Formula", "Section Formula", "Area of Triangle"],
                videoCount: 8,
                questionCount: 48,
                videoUrl: "https://www.youtube.com/embed/NGIGsgacxmg"
              },
              { name: "Constructions", subtopics: ["Division of Line Segment", "Tangents", "Similar Figures"], videoCount: 7, questionCount: 35 }
            ]
          },
          {
            name: "Trigonometry",
            topics: [
              {
                name: "Trigonometric Ratios",
                subtopics: ["Sine, Cosine, Tangent", "Complementary Angles", "Trigonometric Identities"],
                videoCount: 12,
                questionCount: 75,
                videoUrl: "https://www.youtube.com/embed/BfV_5K67hHE"
              },
              {
                name: "Heights and Distances",
                subtopics: ["Angle of Elevation", "Angle of Depression", "Real-world Applications"],
                videoCount: 9,
                questionCount: 52,
                videoUrl: "https://www.youtube.com/embed/QmDhai2fKzk"
              }
            ]
          },
          {
            name: "Statistics & Probability",
            topics: [
              {
                name: "Statistics",
                subtopics: ["Mean, Median, Mode", "Grouped Data", "Cumulative Frequency"],
                videoCount: 10,
                questionCount: 60,
                videoUrl: "https://www.youtube.com/embed/bO8kDKo4qH0"
              },
              {
                name: "Probability",
                subtopics: ["Experimental Probability", "Theoretical Probability", "Compound Events"],
                videoCount: 8,
                questionCount: 48,
                videoUrl: "https://www.youtube.com/embed/OCdKJ9hffgw"
              }
            ]
          }
        ]
      },
      "Science": {
        description: "CBSE Class 10 Science - Physics, Chemistry, and Biology integrated",
        totalTopics: 18,
        units: [
          {
            name: "Physics",
            topics: [
              { 
                name: "Light - Reflection and Refraction", 
                subtopics: ["Reflection", "Refraction", "Lens Formula", "Power of Lens"], 
                videoCount: 15, 
                questionCount: 90,
                videoUrl: "https://www.youtube.com/embed/8Rwv2hvdZFo"
              },
              { 
                name: "The Human Eye and the Colourful World", 
                subtopics: ["Structure of Eye", "Defects of Vision", "Dispersion", "Atmospheric Refraction"], 
                videoCount: 10, 
                questionCount: 58,
                videoUrl: "https://www.youtube.com/embed/VWNxgkOr55Y"
              },
              { 
                name: "Electricity", 
                subtopics: ["Electric Charge", "Electric Current", "Ohm's Law", "Resistance", "Power"], 
                videoCount: 16, 
                questionCount: 95,
                videoUrl: "https://www.youtube.com/embed/J3DvsZfYEfs"
              },
              { 
                name: "Magnetic Effects of Electric Current", 
                subtopics: ["Magnetic Field", "Force on Conductor", "Electromagnetic Induction"], 
                videoCount: 12, 
                questionCount: 70,
                videoUrl: "https://www.youtube.com/embed/lYGBsKJ0LYs"
              },
              { 
                name: "Energy Sources", 
                subtopics: ["Conventional Sources", "Non-conventional Sources", "Energy Conservation"], 
                videoCount: 11, 
                questionCount: 65,
                videoUrl: "https://www.youtube.com/embed/iZp2GMJ4828"
              }
            ]
          },
          {
            name: "Chemistry",
            topics: [
              { 
                name: "Chemical Reactions and Equations", 
                subtopics: ["Types of Reactions", "Redox Reactions", "Balancing Equations"], 
                videoCount: 12, 
                questionCount: 72,
                videoUrl: "https://www.youtube.com/embed/gQ-X9wV8TXQ"
              },
              { 
                name: "Acids, Bases and Salts", 
                subtopics: ["Properties", "pH Scale", "Reactions", "Salts"], 
                videoCount: 10, 
                questionCount: 60,
                videoUrl: "https://www.youtube.com/embed/qKl4mieovu0"
              },
              { 
                name: "Metals and Non-metals", 
                subtopics: ["Properties", "Reactivity Series", "Extraction", "Corrosion"], 
                videoCount: 13, 
                questionCount: 78,
                videoUrl: "https://www.youtube.com/embed/YV1BFWi-AWY"
              },
              { 
                name: "Carbon and its Compounds", 
                subtopics: ["Bonding", "Nomenclature", "Functional Groups", "Proteins and Fats"], 
                videoCount: 14, 
                questionCount: 85,
                videoUrl: "https://www.youtube.com/embed/mb3csoFqLGs"
              },
              { 
                name: "Periodic Classification of Elements", 
                subtopics: ["Mendeleev's Table", "Modern Periodic Table", "Trends", "Properties"], 
                videoCount: 11, 
                questionCount: 65,
                videoUrl: "https://www.youtube.com/embed/TM04CP9FL0k"
              }
            ]
          },
          {
            name: "Biology",
            topics: [
              { 
                name: "Life Processes", 
                subtopics: ["Nutrition", "Respiration", "Transportation", "Excretion"], 
                videoCount: 15, 
                questionCount: 90,
                videoUrl: "https://www.youtube.com/embed/2anxgj0TUgQ"
              },
              { 
                name: "Control and Coordination", 
                subtopics: ["Nervous System", "Hormones", "Reflex Action"], 
                videoCount: 12, 
                questionCount: 72,
                videoUrl: "https://www.youtube.com/embed/vKfpJ2QejNA"
              },
              { 
                name: "How do Organisms Reproduce?", 
                subtopics: ["Asexual Reproduction", "Sexual Reproduction", "Reproductive Health"], 
                videoCount: 13, 
                questionCount: 78,
                videoUrl: "https://www.youtube.com/embed/RxXsUm8pwaA"
              },
              { 
                name: "Heredity and Evolution", 
                subtopics: ["Heredity", "Variation", "Evolution", "Speciation"], 
                videoCount: 14, 
                questionCount: 85,
                videoUrl: "https://www.youtube.com/embed/PeoNpqD73aU"
              }
            ]
          }
        ]
      },
      "English": {
        description: "CBSE Class 10 English Language and Literature",
        totalTopics: 10,
        units: [
          {
            name: "Reading Skills",
            topics: [
              { 
                name: "Unseen Passage", 
                subtopics: ["Narrative", "Factual", "Discursive"], 
                videoCount: 8, 
                questionCount: 45,
                videoUrl: "https://www.youtube.com/embed/IjKPTR5j8ZA"
              },
              { 
                name: "Comprehension Questions", 
                subtopics: ["MCQ", "Short Answer", "Long Answer"], 
                videoCount: 6, 
                questionCount: 35,
                videoUrl: "https://www.youtube.com/embed/qwgkK7IxD0g"
              }
            ]
          },
          {
            name: "Writing Skills",
            topics: [
              { 
                name: "Letter Writing", 
                subtopics: ["Formal Letters", "Informal Letters"], 
                videoCount: 7, 
                questionCount: 40,
                videoUrl: "https://www.youtube.com/embed/vk1PSYJTqeM"
              },
              { 
                name: "Essay Writing", 
                subtopics: ["Descriptive", "Narrative", "Argumentative"], 
                videoCount: 9, 
                questionCount: 50,
                videoUrl: "https://www.youtube.com/embed/i-3SF_Zz8CE"
              },
              { 
                name: "Creative Writing", 
                subtopics: ["Story Writing", "Dialogue Writing"], 
                videoCount: 6, 
                questionCount: 32,
                videoUrl: "https://www.youtube.com/embed/8kMClGCH7EM"
              }
            ]
          },
          {
            name: "Grammar",
            topics: [
              { 
                name: "Tenses", 
                subtopics: ["Simple, Continuous, Perfect"], 
                videoCount: 8, 
                questionCount: 48,
                videoUrl: "https://www.youtube.com/embed/xm5e5I7xcU4"
              },
              { 
                name: "Parts of Speech", 
                subtopics: ["Nouns", "Verbs", "Adjectives", "Adverbs"], 
                videoCount: 10, 
                questionCount: 60,
                videoUrl: "https://www.youtube.com/embed/howS4U9GANY"
              }
            ]
          },
          {
            name: "Literature",
            topics: [
              { 
                name: "Poetry", 
                subtopics: ["Prose Poems", "Analytical Study"], 
                videoCount: 12, 
                questionCount: 70,
                videoUrl: "https://www.youtube.com/embed/9YXD3k1MnWI"
              },
              { 
                name: "Drama", 
                subtopics: ["Shakespeare", "Contemporary"], 
                videoCount: 10, 
                questionCount: 58,
                videoUrl: "https://www.youtube.com/embed/hbdFSzwbAKs"
              },
              { 
                name: "Prose", 
                subtopics: ["Main Course", "Supplementary Reader"], 
                videoCount: 15, 
                questionCount: 80,
                videoUrl: "https://www.youtube.com/embed/5qWMtuHwNuE"
              }
            ]
          }
        ]
      },
      "Social Science": {
        description: "CBSE Class 10 Social Science - History, Geography, Civics, Economics",
        totalTopics: 10,
        units: [
          {
            name: "History",
            topics: [
              { 
                name: "The Rise of Nationalism in Europe", 
                subtopics: ["Nationalism", "Nation-states", "Imperialism"], 
                videoCount: 10, 
                questionCount: 60,
                videoUrl: "https://www.youtube.com/embed/ySNeX4av-uA"
              },
              { 
                name: "Nationalism in India", 
                subtopics: ["Freedom Struggle", "Independence Movement"], 
                videoCount: 12, 
                questionCount: 72,
                videoUrl: "https://www.youtube.com/embed/Q4UZheK9zNg"
              },
              { 
                name: "India and the Contemporary World", 
                subtopics: ["Partition", "Decolonization"], 
                videoCount: 9, 
                questionCount: 52,
                videoUrl: "https://www.youtube.com/embed/n96yn8IfE-4"
              }
            ]
          },
          {
            name: "Geography",
            topics: [
              { 
                name: "Resources and Development", 
                subtopics: ["Types of Resources", "Conservation"], 
                videoCount: 11, 
                questionCount: 65,
                videoUrl: "https://www.youtube.com/embed/g_NEwN-91pE"
              },
              { 
                name: "Forests and Wildlife", 
                subtopics: ["Biodiversity", "Conservation Strategies"], 
                videoCount: 10, 
                questionCount: 58,
                videoUrl: "https://www.youtube.com/embed/2upMn--0t9M"
              },
              { 
                name: "Water Resources", 
                subtopics: ["Sources", "Management", "Pollution"], 
                videoCount: 9, 
                questionCount: 50,
                videoUrl: "https://www.reddit.com/r/CBSE/comments/1qid4l4/class_10_water_resources_free_short_notes_bonus/"
              }
            ]
          },
          {
            name: "Civics",
            topics: [
              { 
                name: "Democracy and Diversity", 
                subtopics: ["Democratic Government", "Representation"], 
                videoCount: 8, 
                questionCount: 45,
                videoUrl: "https://www.youtube.com/embed/kNh_4EtB31A"
              },
              { 
                name: "Rights and Duties", 
                subtopics: ["Fundamental Rights", "Constitutional Duties"], 
                videoCount: 9, 
                questionCount: 52,
                videoUrl: "https://www.youtube.com/embed/l6Fum52RQ8A"
              }
            ]
          },
          {
            name: "Economics",
            topics: [
              { 
                name: "Development", 
                subtopics: ["Economic Development", "HDI", "Poverty"], 
                videoCount: 10, 
                questionCount: 58,
                videoUrl: "https://www.youtube.com/embed/wJbCv4Hdat8"
              },
              { 
                name: "Sectors of Indian Economy", 
                subtopics: ["Primary, Secondary, Tertiary"], 
                videoCount: 11, 
                questionCount: 65,
                videoUrl: "https://www.youtube.com/embed/6avWRnhAvSU"
              }
            ]
          }
        ]
      }
    },
    "Class 12": {
      "Mathematics": {
        description: "CBSE Class 12 Mathematics - Advanced topics in calculus, algebra, and geometry",
        totalTopics: 13,
        units: [
          {
            name: "Relations and Functions",
            topics: [
              { name: "Relations and Functions", subtopics: ["Domain and Range", "Types of Functions", "Composition of Functions"], videoCount: 10, questionCount: 60 },
              { name: "Inverse Trigonometric Functions", subtopics: ["Principal Values", "Properties", "Equations"], videoCount: 11, questionCount: 65 }
            ]
          },
          {
            name: "Algebra",
            topics: [
              { name: "Matrices", subtopics: ["Operations", "Determinants", "Inverse", "Systems of Equations"], videoCount: 14, questionCount: 85 },
              { name: "Determinants", subtopics: ["Properties", "Applications", "Cofactors"], videoCount: 12, questionCount: 72 }
            ]
          },
          {
            name: "Calculus",
            topics: [
              { name: "Continuity and Differentiability", subtopics: ["Limits", "Continuity", "Derivatives", "Chain Rule"], videoCount: 15, questionCount: 90 },
              { name: "Applications of Derivatives", subtopics: ["Tangents", "Normals", "Increasing/Decreasing", "Maxima and Minima"], videoCount: 14, questionCount: 85 },
              { name: "Integrals", subtopics: ["Indefinite Integration", "Definite Integration", "Integration by Parts", "Substitution"], videoCount: 16, questionCount: 95 },
              { name: "Applications of Integrals", subtopics: ["Area under Curves", "Volume of Solids"], videoCount: 12, questionCount: 70 },
              { name: "Differential Equations", subtopics: ["Formation", "Solution Methods", "Applications"], videoCount: 11, questionCount: 65 }
            ]
          },
          {
            name: "Vectors and 3D Geometry",
            topics: [
              { name: "Vectors", subtopics: ["Operations", "Scalar and Vector Products", "Angle between Vectors"], videoCount: 12, questionCount: 72 },
              { name: "Three Dimensional Geometry", subtopics: ["Lines", "Planes", "Distance", "Angles"], videoCount: 13, questionCount: 78 }
            ]
          },
          {
            name: "Probability",
            topics: [
              { name: "Probability", subtopics: ["Conditional Probability", "Bayes' Theorem", "Random Variables", "Distributions"], videoCount: 13, questionCount: 78 }
            ]
          },
          {
            name: "Linear Programming",
            topics: [
              { name: "Linear Programming Problems", subtopics: ["Graphical Method", "Feasible Region", "Optimal Solution"], videoCount: 10, questionCount: 58 }
            ]
          }
        ]
      },
      "Physics": {
        description: "CBSE Class 12 Physics - Electricity, Magnetism, Optics, Modern Physics",
        totalTopics: 10,
        units: [
          {
            name: "Electrostatics",
            topics: [
              { name: "Electric Charges and Fields", subtopics: ["Coulomb's Law", "Electric Field", "Superposition"], videoCount: 12, questionCount: 72 },
              { name: "Electrostatic Potential and Capacitance", subtopics: ["Potential", "Equipotential", "Capacitors", "Dielectrics"], videoCount: 14, questionCount: 85 }
            ]
          },
          {
            name: "Current Electricity",
            topics: [
              { name: "Electric Current", subtopics: ["Resistance", "Ohm's Law", "Kirchhoff's Laws"], videoCount: 13, questionCount: 78 },
              { name: "EMF and Internal Resistance", subtopics: ["Cells", "Batteries", "Energy Conversion"], videoCount: 11, questionCount: 65 }
            ]
          },
          {
            name: "Magnetism",
            topics: [
              { name: "Magnetic Effects of Current", subtopics: ["Biot-Savart Law", "Ampere's Law", "Force on Conductor"], videoCount: 12, questionCount: 72 },
              { name: "Magnetism and Matter", subtopics: ["Magnetic Field", "Magnetic Properties", "Electromagnetic Induction"], videoCount: 13, questionCount: 78 }
            ]
          },
          {
            name: "Electromagnetic Induction",
            topics: [
              { name: "Electromagnetic Induction", subtopics: ["Faraday's Law", "Lenz's Law", "Self Inductance"], videoCount: 12, questionCount: 72 },
              { name: "Alternating Current", subtopics: ["AC Circuits", "Resonance", "Power"], videoCount: 11, questionCount: 65 }
            ]
          },
          {
            name: "Optics",
            topics: [
              { name: "Ray Optics", subtopics: ["Reflection", "Refraction", "Mirrors", "Lenses"], videoCount: 14, questionCount: 85 },
              { name: "Wave Optics", subtopics: ["Interference", "Diffraction", "Polarization"], videoCount: 13, questionCount: 78 }
            ]
          },
          {
            name: "Modern Physics",
            topics: [
              { name: "Dual Nature of Matter", subtopics: ["Photoelectric Effect", "de Broglie Waves", "Davisson-Germer Experiment"], videoCount: 11, questionCount: 65 },
              { name: "Atoms and Nuclei", subtopics: ["Bohr Model", "Atomic Structure", "Nuclear Physics", "Radioactivity"], videoCount: 14, questionCount: 85 },
              { name: "Semiconductor Electronics", subtopics: ["Semiconductors", "Diodes", "Transistors", "Integrated Circuits"], videoCount: 12, questionCount: 72 },
              { name: "Communication Systems", subtopics: ["Modulation", "Demodulation", "Bandwidth"], videoCount: 10, questionCount: 58 }
            ]
          }
        ]
      },
      "Chemistry": {
        description: "CBSE Class 12 Chemistry - Organic, Inorganic, and Physical Chemistry",
        totalTopics: 13,
        units: [
          {
            name: "Solutions and Colligative Properties",
            topics: [
              { name: "Solutions", subtopics: ["Solubility", "Expressing Concentration", "Colligative Properties"], videoCount: 12, questionCount: 72 },
              { name: "Colligative Properties", subtopics: ["Raoult's Law", "Boiling Point Elevation", "Freezing Point Depression"], videoCount: 11, questionCount: 65 }
            ]
          },
          {
            name: "Electrochemistry",
            topics: [
              { name: "Electrochemistry", subtopics: ["Redox Reactions", "Electrodes", "EMF", "Cells"], videoCount: 13, questionCount: 78 },
              { name: "Corrosion and Protection", subtopics: ["Causes", "Prevention", "Electroplating"], videoCount: 10, questionCount: 58 }
            ]
          },
          {
            name: "Chemical Kinetics",
            topics: [
              { name: "Rate of Reaction", subtopics: ["Factors Affecting Rate", "Order of Reaction", "Rate Law"], videoCount: 12, questionCount: 72 },
              { name: "Activation Energy", subtopics: ["Temperature Dependence", "Collision Theory", "Catalysis"], videoCount: 11, questionCount: 65 }
            ]
          },
          {
            name: "Surface Chemistry",
            topics: [
              { name: "Adsorption", subtopics: ["Types", "Applications", "Isotherms"], videoCount: 10, questionCount: 58 },
              { name: "Colloids", subtopics: ["Properties", "Classification", "Colloidal Solutions"], videoCount: 9, questionCount: 52 }
            ]
          },
          {
            name: "General Principles and Extraction of Metals",
            topics: [
              { name: "Metallurgy", subtopics: ["Occurrence", "Extraction", "Refining", "Uses"], videoCount: 11, questionCount: 65 }
            ]
          },
          {
            name: "Transition Metals",
            topics: [
              { name: "d-Block Elements", subtopics: ["Properties", "Complexes", "Color"], videoCount: 12, questionCount: 72 }
            ]
          },
          {
            name: "Coordination Compounds",
            topics: [
              { name: "Coordination Compounds", subtopics: ["Ligands", "Bonding", "Nomenclature", "Isomerism"], videoCount: 13, questionCount: 78 }
            ]
          },
          {
            name: "Organic Chemistry",
            topics: [
              { name: "Haloalkanes and Haloarenes", subtopics: ["Nomenclature", "Properties", "Reactions"], videoCount: 12, questionCount: 72 },
              { name: "Alcohols, Phenols, and Ethers", subtopics: ["Structure", "Properties", "Reactions", "Uses"], videoCount: 13, questionCount: 78 },
              { name: "Aldehydes, Ketones, and Carboxylic Acids", subtopics: ["Structure", "Properties", "Reactions", "Preparations"], videoCount: 14, questionCount: 85 },
              { name: "Amines and Amino Acids", subtopics: ["Structure", "Classification", "Properties", "Reactions"], videoCount: 12, questionCount: 72 },
              { name: "Polymers", subtopics: ["Classification", "Polymerization", "Applications"], videoCount: 10, questionCount: 58 },
              { name: "Biomolecules", subtopics: ["Carbohydrates", "Proteins", "Lipids", "Nucleic Acids"], videoCount: 13, questionCount: 78 }
            ]
          }
        ]
      },
      "Biology": {
        description: "CBSE Class 12 Biology - Genetics, Evolution, Ecology, and Biotechnology",
        totalTopics: 10,
        units: [
          {
            name: "Reproduction",
            topics: [
              { name: "Sexual Reproduction", subtopics: ["Gametogenesis", "Fertilization", "Embryo Development"], videoCount: 13, questionCount: 78 },
              { name: "Reproductive Health", subtopics: ["Diseases", "Prevention", "Contraception"], videoCount: 10, questionCount: 58 }
            ]
          },
          {
            name: "Genetics and Evolution",
            topics: [
              { name: "Principles of Inheritance", subtopics: ["Mendelian Genetics", "Gene Interaction", "Linkage"], videoCount: 14, questionCount: 85 },
              { name: "Molecular Basis of Inheritance", subtopics: ["DNA", "Gene Expression", "Protein Synthesis"], videoCount: 15, questionCount: 90 },
              { name: "Evolution", subtopics: ["Theories", "Evidence", "Population Genetics"], videoCount: 12, questionCount: 72 }
            ]
          },
          {
            name: "Ecology and Environment",
            topics: [
              { name: "Organisms and Environment", subtopics: ["Ecology", "Habitat", "Population"], videoCount: 12, questionCount: 72 },
              { name: "Ecosystem", subtopics: ["Components", "Food Chains", "Energy Flow", "Biodiversity"], videoCount: 13, questionCount: 78 },
              { name: "Biodiversity Conservation", subtopics: ["Threats", "Protected Areas", "Strategies"], videoCount: 11, questionCount: 65 }
            ]
          },
          {
            name: "Biotechnology",
            topics: [
              { name: "Biotechnology and its Applications", subtopics: ["Genetic Engineering", "PCR", "Cloning"], videoCount: 14, questionCount: 85 },
              { name: "Microbes and Human Welfare", subtopics: ["Useful Microbes", "Vaccines", "Antibiotics"], videoCount: 11, questionCount: 65 }
            ]
          }
        ]
      }
    }
  },
  "State Board": {
    "Class 10": {
      "Mathematics": {
        description: "Tamil Nadu State Board Class 10 Mathematics - Samacheer Kalvi Curriculum",
        totalTopics: 8,
        units: [
          { 
            name: "Relations and Functions", 
            topics: [
              { name: "Relations", videoUrl: "https://www.youtube.com/embed/0Ew_XPei0I0", videoCount: 1, questionCount: 45 },
              { name: "Functions", videoUrl: "https://www.youtube.com/embed/CZ3Fj7wFYXo", videoCount: 1, questionCount: 40 },
              { name: "Composition of Functions", videoUrl: "https://www.youtube.com/embed/MGqtjcGrIdE", videoCount: 1, questionCount: 35 }
            ] 
          },
          { 
            name: "Numbers and Sequences", 
            topics: [
              { name: "Euclid’s Division Lemma", videoUrl: "https://www.youtube.com/embed/3qHn-cDpaVk", videoCount: 1, questionCount: 42 },
              { name: "Arithmetic Progression", videoUrl: "https://www.youtube.com/embed/Dgu_JxFU0qo", videoCount: 1, questionCount: 48 },
              { name: "Geometric Progression", videoUrl: "https://www.youtube.com/embed/b6GireBnzB0", videoCount: 1, questionCount: 44 }
            ] 
          },
          { 
            name: "Algebra", 
            topics: [
              { name: "Simultaneous Linear Equations", videoUrl: "https://www.youtube.com/embed/fnhNcP_gOlo", videoCount: 1, questionCount: 50 },
              { name: "GCD and LCM", videoUrl: "https://www.youtube.com/embed/Oid_cLlN8yw", videoCount: 1, questionCount: 38 },
              { name: "Quadratic Equations", videoUrl: "https://www.youtube.com/embed/ki-YzB_TZDQ", videoCount: 1, questionCount: 55 }
            ] 
          },
          { 
            name: "Geometry", 
            topics: [
              { name: "Thales Theorem", videoUrl: "https://www.youtube.com/embed/unPLorR-KcY", videoCount: 1, questionCount: 30 },
              { name: "Pythagoras Theorem", videoUrl: "https://www.youtube.com/embed/XLvdaz0hbq8", videoCount: 1, questionCount: 35 },
              { name: "Circles and Tangents", videoUrl: "https://www.youtube.com/embed/EAvqanbV3xI", videoCount: 1, questionCount: 40 }
            ] 
          },
          { 
            name: "Coordinate Geometry", 
            topics: [
              { name: "Area of Triangle", videoUrl: "https://www.youtube.com/embed/lujYd4WF1-4", videoCount: 1, questionCount: 32 },
              "Slope of a Line", 
              "Equation of a Line"
            ] 
          },
          { name: "Trigonometry", topics: ["Trigonometric Ratios", "Heights and Distances"] },
          { name: "Mensuration", topics: ["Surface Area of Solids", "Volume of Solids"] },
          { name: "Statistics and Probability", topics: ["Measures of Dispersion", "Probability Events"] }
        ]
      },
      "Science": {
        description: "Tamil Nadu State Board Class 10 Science - Integrated Physics, Chemistry, and Biology",
        totalTopics: 23,
        units: [
          { 
            name: "Physics", 
            topics: [
              { name: "Laws of Motion", videoUrl: "https://www.youtube.com/embed/-HSDnFOhws0", videoCount: 1, questionCount: 65 },
              { name: "Optics", videoUrl: "https://www.youtube.com/embed/5Q6eC51l4Xo", videoCount: 1, questionCount: 58 },
              { name: "Thermal Physics", videoUrl: "https://www.youtube.com/embed/mdSeg8XDoKw", videoCount: 1, questionCount: 52 },
              { name: "Electricity", videoUrl: "https://www.youtube.com/embed/XiQLyK-Y-bY", videoCount: 1, questionCount: 70 },
              { name: "Acoustics", videoUrl: "https://www.youtube.com/embed/zUL4E2i6ocQ", videoCount: 1, questionCount: 45 },
              { name: "Nuclear Physics", videoUrl: "https://www.youtube.com/embed/1y6JFCd9KuA", videoCount: 1, questionCount: 55 }
            ] 
          },
          { 
            name: "Chemistry", 
            topics: [
              { name: "Atoms and Molecules", videoUrl: "https://www.youtube.com/embed/WUKDExuEm2M", videoCount: 1, questionCount: 60 },
              { name: "Periodic Classification", videoUrl: "https://www.youtube.com/embed/7NS5UvIrCVI", videoCount: 1, questionCount: 62 },
              { name: "Solutions", videoUrl: "https://www.youtube.com/embed/qrHa2J0AiWQ", videoCount: 1, questionCount: 48 },
              { name: "Chemical Reactions", videoUrl: "https://www.youtube.com/embed/eODuNkXTkbg", videoCount: 1, questionCount: 65 },
              { name: "Carbon and its Compounds", videoUrl: "https://www.youtube.com/embed/dgws0yx5jP4", videoCount: 1, questionCount: 70 }
            ] 
          },
          { 
            name: "Biology", 
            topics: [
              { name: "Plant Anatomy", videoUrl: "https://www.youtube.com/embed/mB5WYhdPEGM", videoCount: 1, questionCount: 55 },
              "Structural Organisation", 
              "Transportation in Plants", 
              "Nervous System", 
              "Hormones", 
              "Reproduction", 
              "Heredity", 
              "Evolution", 
              "Biotechnology", 
              "Health and Diseases", 
              "Environmental Management"
            ] 
          },
          { 
            name: "Computer Science", 
            topics: [
              { name: "Visual Communication", videoUrl: "https://www.youtube.com/embed/TUqK7Vek6CY", videoCount: 1, questionCount: 20 }
            ] 
          }
        ]
      },
      "Social Science": {
        description: "Tamil Nadu State Board Class 10 Social Science - History, Geography, Civics, Economics",
        totalTopics: 27,
        units: [
          { 
            name: "History", 
            topics: [
              { name: "Outbreak of WWI", videoUrl: "https://www.youtube.com/embed/texH3JGbSSc", videoCount: 1, questionCount: 75 },
              { name: "Between World Wars", videoUrl: "https://www.youtube.com/embed/3Xgi7uYSRiI", videoCount: 1, questionCount: 60 },
              { name: "WWII", videoUrl: "https://www.youtube.com/embed/Mg1ukrldeXE", videoCount: 1, questionCount: 65 },
              { name: "World After WWII", videoUrl: "https://www.youtube.com/embed/vUaIsDNjAwo", videoCount: 1, questionCount: 55 },
              { name: "Social Reform Movements", videoUrl: "https://www.youtube.com/embed/emf1hksqohs", videoCount: 1, questionCount: 50 },
              { name: "Early Revolts against British", videoUrl: "https://www.youtube.com/embed/9TxIlzeTxAE", videoCount: 1, questionCount: 45 },
              { name: "Anti-Colonial Movements", videoUrl: "https://www.youtube.com/embed/roKrETsURno", videoCount: 1, questionCount: 52 },
              { name: "Freedom Struggle in TN", videoUrl: "https://www.youtube.com/embed/hr3aqAceE_4", videoCount: 1, questionCount: 48 },
              { name: "Social Transformation in TN", videoUrl: "https://www.youtube.com/embed/9ea2qydQlb8", videoCount: 1, questionCount: 40 }
            ] 
          },
          { 
            name: "Geography", 
            topics: [
              { name: "India - Location and Relief", videoUrl: "https://www.youtube.com/embed/dcGNvhuaM9c", videoCount: 1, questionCount: 80 },
              { name: "Climate and Vegetation", videoUrl: "https://www.youtube.com/embed/PpTH2UBmAis", videoCount: 1, questionCount: 65 },
              { name: "Agriculture", videoUrl: "https://www.youtube.com/embed/yu4O5zH4kXg", videoCount: 1, questionCount: 70 },
              { name: "Resources and Industries", videoUrl: "https://www.youtube.com/embed/EyuZFV-jPPs", videoCount: 1, questionCount: 72 },
              { name: "Population and Trade", videoUrl: "https://www.youtube.com/embed/_dBVolsHtqw", videoCount: 1, questionCount: 58 },
              { name: "Physical Geography of TN", videoUrl: "https://www.youtube.com/embed/JuEx3xW0rA4", videoCount: 1, questionCount: 65 },
              { name: "Human Geography of TN", videoUrl: "https://www.youtube.com/embed/sFctUGpd1MI", videoCount: 1, questionCount: 52 }
            ] 
          },
          { 
            name: "Civics", 
            topics: [
              { name: "Indian Constitution", videoUrl: "https://www.youtube.com/embed/D1VvA9p0K-E", videoCount: 1, questionCount: 50 },
              { name: "Central Government", videoUrl: "https://www.youtube.com/embed/oFdOoDDy1xM", videoCount: 1, questionCount: 65 },
              { name: "State Government", videoUrl: "https://www.youtube.com/embed/NZAt789-uD0", videoCount: 1, questionCount: 62 },
              { name: "Foreign Policy", videoUrl: "https://www.youtube.com/embed/Mnjp9Dh_68s", videoCount: 1, questionCount: 45 },
              { name: "International Relations", videoUrl: "https://www.youtube.com/embed/rhN6KIDfxZ8", videoCount: 1, questionCount: 48 }
            ] 
          },
          { 
            name: "Economics", 
            topics: [
              { name: "GDP and Growth", videoUrl: "https://www.youtube.com/embed/vV0vN_G-s6w", videoCount: 1, questionCount: 45 },
              { name: "Globalization and Trade", videoUrl: "https://www.youtube.com/embed/N6-Ej3wF3zg", videoCount: 1, questionCount: 55 },
              { name: "Food Security", videoUrl: "https://www.youtube.com/embed/qn6C-lFconY", videoCount: 1, questionCount: 52 },
              { name: "Government and Taxes", videoUrl: "https://www.youtube.com/embed/hhnErqLNjhU", videoCount: 1, questionCount: 48 },
              { name: "Industrial Clusters in TN", videoUrl: "https://www.youtube.com/embed/YVbOmkFpZgA", videoCount: 1, questionCount: 42 }
            ] 
          }
        ]
      }
    }
  }
};
