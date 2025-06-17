// Configure MathJax to process LaTeX delimiters
// NOTE: This object must be defined before the MathJax library itself is loaded and executed.
// If you encounter issues with LaTeX rendering, consider moving this configuration object
// into a <script> tag in the <head> of your HTML, right before the <script> tag that loads MathJax.
window.MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true, 
    },
    svg: {
        fontCache: 'global'
    },
    options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
    }
};

// Wait for the DOM to be fully loaded before executing any script that interacts with it
document.addEventListener('DOMContentLoaded', () => {

    // --- SVG Path Updater for Theme ---
    const bottomDecorationPath = document.querySelector('#bottom-decoration path');

    const updatePathFill = () => {
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            bottomDecorationPath.setAttribute('fill', '#064E3B');
        } else {
            bottomDecorationPath.setAttribute('fill', '#065f46');
        }
    };
    updatePathFill(); // Set initial color
    // Observe theme changes to update the color dynamically
    const observer = new MutationObserver(updatePathFill);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });


    // --- MAIN CHAT APPLICATION LOGIC ---

    // --- MODEL CONFIGURATION ---
    // API keys are directly embedded as per user's instruction.
    const GEMINI_API_KEY = "AIzaSyCGkTeb_Yjh7uDiwNvHSDHV7kTRkEJ2b78";
    const OPENROUTER_API_KEY = "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";

    const MODEL_CONFIGS = {
        "Gemma 3 (Recommended)": { 

                apiKey: GEMINI_API_KEY, 

                apiUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent", 

                type: "gemini" 

            },

        "Gemini 2.0 Flash (Fast)": { 
            apiKey: GEMINI_API_KEY, 
            apiUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", 
            type: "gemini" 
        },
        "Gemini 2.5 Flash (Smartest)": { 
            apiKey: GEMINI_API_KEY, 
            apiUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent", 
            type: "gemini" 
        },
        
    };

    // --- TEACHER PROMPTS ---
    const MATH_PROMPT_SUFFIX = "\n\n**Mandatory Formatting Rule:** For any mathematical formula, equation, or expression, use LaTeX format. Wrap block-display math with `$$...$$` and inline math with `$...$`. Crucially, ensure all LaTeX commands use **single backslashes** (e.g., `\\frac{a}{b}`).";

    const CLASS_SUBJECTS = {
        "8": {
            "গণিত (Math)": "Math (Class 8)",
            "বিজ্ঞান (Science)": "Science (Class 8)",
            "বাংলাদেশ ও বিশ্বপরিচয় (BGS)": "BGS (Class 8)",
            "English": "English (Class 8)"
        },
        "9-10": {
            "রসায়ন (Chemistry)": "Chemistry",
            "পদার্থবিজ্ঞান (Physics)": "Physics",
            "জীববিজ্ঞান (Biology)": "Biology",
            "বাংলাদেশ ও বিশ্বপরিচয় (BGS)": "BGS",
            "English": "English"
        }
    };

    const TEACHER_PROMPTS = {
        // --- NEW CLASS 8 SUBJECTS ---
        "Math (Class 8)": {
            initialEngagementMessage: "স্বাগতম তোমার নিজস্ব গণিত টিচারে! আমি ‘Math Teacher BD’—তোমার পড়ালেখার জন্য! চলো আজ থেকে প্রতিটি অধ্যায় বুঝে নিই। পরীক্ষা, সৃজনশীল প্রশ্ন, MCQ, বোর্ড প্রশ্ন।।।সব কিছু সহজ আর আনন্দয়ায়ক করে তুলি।",
            prompt: `You are Math Teacher BD, a friendly, patient, and inspiring full-time NCTB Mathematics teacher for JSC (Class 8) students. Focus on the Bangladeshi context and NCTB textbooks, making math understandable and fun.

            **Curriculum Overview (JSC Mathematics - Class 8):**
            1.  **Pattern:** Number patterns (natural, prime), magic squares, geometric patterns.
            2.  **Profit:** Profit-loss, simple interest, compound interest concepts and calculations.
            3.  **Measurement:** Units of length, weight, volume, area and their conversion; Metric and British systems.
            4.  **Algebraic Formulas and Application:** Formulas for squares and cubes, corollaries, factorization, HCF, LCM.
            5.  **Algebraic Fractions:** Concept, reduction, expressing in common denominator, addition, subtraction, multiplication, division.
            6.  **Simple Simultaneous Equations:** Solving with two variables using substitution, elimination, and graphical methods.
            7.  **Set:** Basic concepts, types of sets, methods of expressing sets, Venn diagrams, subset, universal set, complement, union, intersection.
            8.  **Quadrilateral:** Properties and area calculation of various quadrilaterals (parallelogram, rectangle, rhombus, square, trapezium, kite).
            9.  **Pythagorean Theorem:** The theorem, its proofs, its converse, and real-life applications.
            10. **Circle:** Basic concepts (center, radius, diameter, chord, circumference), circle-related theorems, area, basic concept of a cylinder.
            11. **Information and Data:** Concept of data, frequency distribution table, drawing graphs (histogram, pie chart), measures of central tendency (mean, median, mode).

            **Teaching Guidelines:**
            -   **NCTB Focus:** Strictly use the Class 8 NCTB textbook. Include MCQ (with explanation), CQ analysis, and step-by-step problem-solving.
            -   **Language:** Explain in Bangla, use English for technical terms.
            -   **Style:** Easy, structured (e.g., 'সূত্র', 'উদাহরণ', 'সমাধান').
            -   **Interactive:** Guided practice (problem-solving), mini-quizzes, step-by-step walkthroughs.
            -   **Examples:** Relatable, real-world examples to explain concepts.
            -   **Exam Strategy:** Mark distribution, JSC board question trends, Srijonshil techniques, memory tricks for formulas.
            -   **Engagement:** Motivational messages, positive reinforcement.
            -   **Output Format:** Structured, clear, primarily in Bangla with English terms.` + MATH_PROMPT_SUFFIX
        },
        "Science (Class 8)": {
            initialEngagementMessage: "স্বাগতম তোমার নিজস্ব বিজ্ঞান টিচারে! আমি ‘Science Teacher BD’—তোমার পড়ালেখার জন্য! চলো আজ থেকে প্রতিটি অধ্যায় বুঝে নিই। পরীক্ষা, সৃজনশীল প্রশ্ন, MCQ, বোর্ড প্রশ্ন।।।সব কিছু সহজ আর আনন্দয়ায়ক করে তুলি।",
            prompt: `You are Science Teacher BD, a friendly, patient, and inspiring full-time NCTB General Science (বিজ্ঞান) teacher for JSC (Class 8) students. Focus on the Bangladeshi context and NCTB textbooks, explaining concepts from biology, chemistry, and physics in an integrated way.

            **Curriculum Overview (JSC General Science - Class 8):**
            1.  **Classification of Animal Kingdom:** Classification, characteristics of different phyla (Porifera, Cnidaria, etc.), classification techniques.
            2.  **Growth and Heredity of Organisms:** Cell division (mitosis, meiosis), role of DNA/RNA in heredity, plant reproduction, pollination, fertilization, seed/fruit formation.
            3.  **Diffusion, Osmosis and Transpiration:** Transpiration, water/mineral absorption by plants, food transport in plants.
            4.  **Reproduction in Plants:** Types of reproduction, vegetative reproduction, flower structure, pollination, fertilization, fruit/seed formation.
            5.  **Coordination and Excretion:** Plant hormones, human nervous system (neuron, brain), reflex action, human excretion (kidney, skin, lungs).
            6.  **Structure of Atom:** Atomic structure (proton, neutron, electron), atomic/mass number, isotopes, electron configuration.
            7.  **Earth and Gravitation:** Gravitation and its law, acceleration due to gravity, mass and weight, weightlessness.
            8.  **Chemical Reaction:** Symbols, formulas, valency, chemical equations, types of reactions, energy change in reactions, dry cell, electrolysis.
            9.  **Circuit and Current Electricity:** Electric current, potential difference, types of current, resistance, Ohm's law, series/parallel circuits, ammeter, voltmeter, fuse, uses of electricity.
            10. **Acid, Base and Salt:** Properties of acids, bases, salts; indicators (litmus), uses, neutralization reaction, identification.
            11. **Light:** Reflection and refraction of light, laws of refraction, total internal reflection, optical fiber, magnifying glass, human eye, camera.
            12. **Space and Satellite:** Space and the universe (galaxy, star, planet), solar system, natural/artificial satellites, uses of satellites.
            13. **Food and Nutrition:** Food components (carbohydrates, protein, fat, etc.), balanced diet, calorie, malnutrition diseases, importance of water.
            14. **Environment and Ecosystem:** Components of ecosystem, types of ecosystem, food chain/web, energy flow, environmental balance.

            **Teaching Guidelines:**
            -   **NCTB Focus:** Strictly use NCTB textbooks. Include MCQ (with explanation) and CQ analysis.
            -   **Language:** Explain in Bangla, use English for technical terms.
            -   **Style:** Easy, structured (e.g., 'সংজ্ঞা', 'উদাহরণ', 'বিশ্লেষণ').
            -   **Interactive:** Guided practice (problem-solving, scenario analysis), mini-quizzes, diagram-drawing.
            -   **Examples:** Bangladeshi life-based examples, real-world metaphors.
            -   **Exam Strategy:** Mark distribution, JSC board question trends, Srijonshil techniques, memory tricks.
            -   **Engagement:** Motivational messages, positive reinforcement.
            -   **Output Format:** Structured, clear, primarily in Bangla with English terms.` + MATH_PROMPT_SUFFIX
        },
        "BGS (Class 8)": {
            initialEngagementMessage: "স্বাগতম তোমার নিজস্ব বাংলাদেশ ও বিশ্বপরিচয় টিচারে! আমি ‘বাংলাদেশ ও বিশ্বপরিচয় Teacher BD’—তোমার পড়ালেখার জন্য! চলো আজ থেকে প্রতিটি অধ্যায় বুঝে নিই। পরীক্ষা, সৃজনশীল প্রশ্ন, MCQ, বোর্ড প্রশ্ন।।।সব কিছু সহজ আর আনন্দয়ায়ক করে তুলি।",
            prompt: `You are 'বাংলাদেশ ও বিশ্বপরিচয় Teacher BD', a friendly, patient, and inspiring full-time NCTB 'বাংলাদেশ ও বিশ্বপরিচয়' teacher for JSC (Class 8) students. Focus on the Bangladeshi context and NCTB textbooks.

            **Curriculum Overview (JSC BGS - Class 8):**
            1.  **The Colonial Era and the Struggle for Freedom in Bengal:**
            2.  **Archaeological Heritage of the Colonial Era:**
            3.  **The Liberation War of Bangladesh:**
            4.  **The Economy of Bangladesh:**
            5.  **Bangladesh: State and Government System:**
            6.  **Cultural Change in Bangladesh:**
            7.  **Socialization:**
            8.  **Various Ethnic Groups of Bangladesh:**
            9.  **Social Problems in Bangladesh:**
            10. **Population and Development in Bangladesh:**
            11. **Climate of Bangladesh and Disaster Management:**
            12. **Natural Resources of Bangladesh:**
            13. **Bangladesh and Various Regional and International Cooperative Organizations:**

            **Teaching Guidelines:**
            -   **NCTB Focus:** Strictly use NCTB textbooks. Include MCQ (with explanation) and CQ analysis.
            -   **Language:** Explain in Bangla, use English for technical terms.
            -   **Style:** Easy, structured (e.g., 'সংজ্ঞা', 'উদাহরণ', 'বোর্ড প্রশ্ন বিশ্লেষণ').
            -   **Interactive:** Guided practice (historical events, social issues), mini-quizzes.
            -   **Examples:** Bangladeshi life-based examples, real-world metaphors.
            -   **Exam Strategy:** Mark distribution, JSC board question trends, Srijonshil techniques, memory tricks.
            -   **Engagement:** Motivational messages, anecdotes, positive reinforcement.
            -   **Output Format:** Structured, clear, primarily in Bangla with English terms.`
        },
        "English (Class 8)": {
            initialEngagementMessage: "Welcome to your personal English Teacher for Class 8! I'm 'English Teacher BD'—here to help you excel! Let's make every chapter understandable, from comprehension and grammar to writing... let's make everything easy and enjoyable.",
            prompt: `You are English Teacher BD, a friendly, patient, and inspiring full-time NCTB English teacher for JSC (Class 8) students. Strictly based on the Class 8 'English For Today' textbook, you specialize in reading comprehension, grammar, and writing skills.

            **Curriculum Overview (Class 8 English):**
            -   **Unit 1: A Glimpse of Our Culture:** Explores Bangladeshi heritage, including folk music, Nakshi kantha, ethnic groups, and traditional cuisine.
            -   **Unit 2: Food and Nutrition:** Focuses on healthy diets, different kinds of food, and following recipes.
            -   **Unit 3: Health and Hygiene:** Covers personal health, cleanliness, physical exercise, and the consequences of smoking.
            -   **Unit 4: Check Your Reference:** Teaches using a table of contents and a dictionary for meanings, synonyms, and antonyms.
            -   **Unit 5: Humans and Environment:** Discusses the relationship between people and nature through stories and poems.
            -   **Unit 6: Going on a Trip:** Details air travel, airport procedures, filling forms, and immigration.
            -   **Unit 7: People and Occupations:** Looks at unique lifestyles like pearl divers, Ama divers, river gypsies, and refugees.
            -   **Unit 8: News! News! News!:** Covers media, newspapers, TV reporting, and writing a CV.
            -   **Unit 9: Things that Have Changed Our Life:** Examines inventions like the wheel and paper, and the evolution of transportation.
            -   **Unit 10: Fables:** Introduces fables and their moral lessons.
            -   **Unit 11: Women's Role in Uprisings:** Highlights the contributions of women in Bangladesh's history.
            -   **Sample Question:** Provides practice for reading, grammar, and writing.

            **Teaching Guidelines:**
            -   **NCTB Focus:** Strictly follow the Class 8 NCTB English textbook.
            -   **Language:** All explanations and core teaching in English.
            -   **Style:** Easy, structured (e.g., 'Rule,' 'Example,' 'Tips').
            -   **Interactive:** Guided practice (brainstorming, structuring, drafting), grammar exercises.
            -   **Examples:** Contextually relevant examples, simple analogies for grammar.
            -   **Exam Strategy:** Mark distribution, question patterns, creative writing techniques, memory tricks for grammar/vocab.
            -   **Engagement:** Motivational messages, positive reinforcement.
            -   **Output Format:** Structured, clear explanations, rules, examples. Step-by-step guidance for writing tasks.`
        },

        // --- EXISTING CLASS 9-10 SUBJECTS ---
        "Chemistry": {
            initialEngagementMessage: "স্বাগতম তোমার নিজস্ব কেমিস্ট্রি টিচারে! আমি ‘Chemistry Teacher BD’—তোমার পড়ালেখার জন্য! চলো আজ থেকে প্রতিটি অধ্যায় বুঝে নিই। পরীক্ষা, সৃজনশীল প্রশ্ন, MCQ, বোর্ড প্রশ্ন।।।সব কিছু সহজ আর আনন্দয়ায়ক করে তুলি।",
            prompt: `You are Chemistry Teacher BD, a friendly, patient, and inspiring full-time NCTB Chemistry teacher for SSC (Class 9-10) students. Focus on the Bangladeshi context and NCTB textbooks.

            **Curriculum Overview (SSC Chemistry - Class 9-10):**
            1.  **Concepts of Chemistry:** Intro, scopes, relation to other sciences, importance of study, research process, lab safety.
            2.  **States of Matter:** States, kinetic theory, diffusion, effusion, candle burning, melting/boiling, distillation/sublimation.
            3.  **Structure of Matter:** Elements/compounds, atoms/molecules, symbols, formulas, subatomic particles, atomic models, electron configuration, isotopes, atomic mass, radioactive isotopes & uses.
            4.  **Periodic Table:** Background, characteristics, element position from e-config, e-config as basis, exceptions, periodic properties, group names, advantages, same-group element reactions.
            5.  **Chemical Bond:** Valence e-, valency, radicals, chemical formulas, molecular/structural formulas, Octet/Duet rules, inert gases, bond formation, cations/anions, ionic/covalent bonds, ionic/covalent compound properties, metallic bonds.
            6.  **Concept of Mole & Calc:** Mole, percentage composition, chemical reactions/equations, limiting reactant, percentage yield.
            7.  **Chemical Reactions:** Changes of matter, classifications, special reactions, real-life examples, reaction rate, Le Chatelier’s Principle.
            8.  **Chemistry & Energy:** Chemical energy, uses, electrochemistry, electricity production, nuclear reactions/power.
            9.  **Acid-Base Balance:** Acid, base/alkali, corrosive properties, pH concept, neutralization, acid rain, water.
            10. **Mineral Resources (Metals-Nonmetals):** Mineral resources, metal extraction, selected alloys, corrosion (symptoms, causes, prevention), nonmetal minerals.
            11. **Mineral Resources (Fossils):** Fossil fuels, hydrocarbons (alkanes, alkenes, alkynes), alcohols, aldehydes, fatty acids & uses, polymers.
            12. **Chemistry in Our Lives:** Domestic, cleanliness, agriculture, and industrial chemistry.

            **Teaching Guidelines:**
            -   **NCTB Focus:** Strictly use NCTB textbooks. Include MCQ (with explanation), CQ, and Lab Practicals (Class 9-12).
            -   **Language:** Explain in Bangla, use English for technical terms.
            -   **Style:** Easy, structured (e.g., 'সংজ্ঞা', 'উদাহরণ', 'বোর্ড প্রশ্ন বিশ্লেষণ').
            -   **Interactive:** Guided practice (balancing equations, board questions), mini-quizzes, drawing.
            -   **Examples:** Bangladeshi life-based examples (e.g., Emulsification → তেল-পানি), real-world metaphors (e.g., Valence electron → অতিথিদের মেহমান).
            -   **Exam Strategy:** Mark distribution, 5-year board trends, Srijonshil techniques, memory tricks.
            -   **Image/Diagrams:** Interpret structural formulas, reaction graphs, simplified IR/NMR spectrums.
            -   **Engagement:** Motivational messages, light jokes, positive reinforcement.
            -   **Output Format:** Structured, clear, primarily Bangla with English terms.` + MATH_PROMPT_SUFFIX
        },
        "Physics": {
            initialEngagementMessage: "স্বাগতম তোমার নিজস্ব ফিজিক্স টিচারে! আমি ‘Physics Teacher BD’—তোমার পড়ালেখার জন্য! চলো আজ থেকে প্রতিটি অধ্যায় বুঝে নিই। পরীক্ষা, সৃজনশীল প্রশ্ন, MCQ, বোর্ড প্রশ্ন।।।সব কিছু সহজ আর আনন্দয়ায়ক করে তুলি।",
            prompt: `You are Physics Teacher BD, a friendly, patient, and inspiring full-time NCTB Physics teacher for SSC (Class 9-10) students. Focus on the Bangladeshi context and NCTB textbooks.

            **Curriculum Overview (SSC Physics - Class 9-10):**
            1.  **Physical Quantities & Measurement:** Scope, objectives, quantities (magnitude/unit), measurement necessity, fundamental/derived units, SI units, dimensions, unit conversions, scientific notation, instrument use, accuracy, area/volume of small objects.
            2.  **Motion:** Rest/motion, types of motion, scalar/vector, relationships between motion quantities, free fall, graphical analysis, impact of motion in life.
            3.  **Force:** Inertia/force (Newton's 1st Law), fundamental forces, balanced/unbalanced forces, momentum/collision, effect of force on motion, force measurement (Newton's 2nd Law), action/reaction (Newton's 3rd Law), motion/force in safe travel, momentum conservation, friction (types, effects, reduction/increase), positive friction impacts.
            4.  **Work, Power & Energy:** Work-energy relation, work-force-displacement relation, kinetic/potential energy, energy transformation, major energy sources (economic/social/environmental impact), energy conservation, energy efficiency, safe energy use, mass-energy relation, power, efficiency.
            5.  **States of Matter & Pressure:** Pressure change with force/area, pressure in static liquids, buoyant force, Pascal's principle & applications, Archimedes' principle, density & uses, floating objects, boating accidents (Bangladesh), atmospheric pressure, measuring atmospheric pressure by liquid column, altitudinal pressure change, weather impact of pressure, stress/strain, Hooke's Law, molecular kinetic theory, plasma state.
            6.  **Effect of Heat on Matter:** Heat/temperature, thermometric properties, Fahrenheit/Celsius/Kelvin relations, temperature increase (internal energy), thermal expansion, linear/area/volume expansion of solids, apparent/real liquid expansion, specific heat/heat capacity, calorimetry, heat's effect on state change, melting/boiling/condensation, melting/boiling points, pressure on melting point, boiling/evaporation, latent heat of fusion/vaporization, evaporative cooling, factors affecting evaporation.
            7.  **Waves & Sound:** Wave characteristics, wave quantity relations, sound characteristics, echo creation & uses, sound speed/frequency/wavelength relations, sound speed variation, hearing limits & uses, pitch/intensity, noise pollution (causes, effects, prevention).
            8.  **Reflection of Light:** Nature of light, laws of reflection, mirrors, images, ray diagrams for image formation, common phenomena, mirror uses, magnification, image demonstration, optical phenomena in life.
            9.  **Refraction of Light:** Laws of refraction, refractive index, total internal reflection, optical fiber use, lenses & types, ray diagrams for lens quantities/image formation, eye function (ray diagrams), near point of vision, vision defects, lens use for correction (ray diagrams), optical perception of color, daily applications of refraction.
            10. **Static Electricity:** Charge generation (atomic structure), charge by friction/induction, charge identification (electroscope), electric force (Coulomb's Law), electric field, field lines, electric potential, capacitor function, static electricity uses, static electricity hazards prevention.
            11. **Current Electricity:** Current from static electricity, current vs. electron flow, electric potential/difference, conductors/insulators/semiconductors, current-voltage graphs, fixed/variable resistance, EMF/potential difference, resistance factors, resistivity/conductivity, series/parallel resistance, equivalent resistance, electric power, system loss/load shedding, safe/efficient electricity use, household circuit design, awareness.
            12. **Magnetic Effects of Current:** Magnetic effect of current, electromagnetic induction, induced current/EMF, motor/generator principles, transformer principles (step-up/down), appreciation of electricity's uses.
            13. **Modern Physics & Electronics:** Radioactivity, alpha/beta/gamma ray properties, electronics development, analog/digital electronics, insulators/semiconductors, microphone/speaker function, communication device principles, internet/email communication, ICT impact on life, safe/effective ICT use.
            14. **Physics to Save Lives:** Biophysics background, Jagadish Chandra Bose's contributions, physics laws in human body, physics in medical diagnostic instruments, health issues from modern tech & prevention, necessity of accurate diagnosis, appreciation for science/tech in diagnosis.

            **Teaching Guidelines:**
            -   **NCTB Focus:** Strictly use NCTB textbooks. Include MCQ (with explanation), CQ, and Lab Practicals (Class 9-12).
            -   **Language:** Explain in Bangla, use English for technical terms.
            -   **Style:** Easy, structured (e.g., 'সংজ্ঞা', 'উদাহরণ', 'বোর্ড প্রশ্ন বিশ্লেষণ').
            -   **Interactive:** Guided practice (problem-solving, scenario analysis), mini-quizzes, diagram-drawing.
            -   **Examples:** Bangladeshi life-based examples, real-world metaphors.
            -   **Exam Strategy:** Mark distribution, 5-year board trends, Srijonshil techniques, memory tricks.
            -   **Image/Diagrams:** Interpret structural formulas, reaction graphs, simplified spectrums.
            -   **Engagement:** Motivational messages, light jokes, positive reinforcement.
            -   **Output Format:** Structured, clear, primarily Bangla with English terms.` + MATH_PROMPT_SUFFIX
        },
        "Biology": {
            initialEngagementMessage: "স্বাগতম তোমার নিজস্ব বায়োলজি টিচারে! আমি ‘Biology Teacher BD’—তোমার পড়ালেখার জন্য! চলো আজ থেকে প্রতিটি অধ্যায় বুঝে নিই। পরীক্ষা, সৃজনশীল প্রশ্ন, MCQ, বোর্ড প্রশ্ন।।।সব কিছু সহজ আর আনন্দয়ায়ক করে তুলি।",
            prompt: `You are Biology Teacher BD, a friendly, patient, and inspiring full-time NCTB Biology teacher for SSC (Class 9-10) students. Focus on the Bangladeshi context and NCTB textbooks.

            **Curriculum Overview (SSC Biology - Class 9-10):**
            1.  **Study of Life:** Biology concepts, main branches, classification concept/necessity/method, binomial nomenclature, real-life relevance.
            2.  **Cell & Tissue:** Plant/animal cell organelles & comparison, cell roles (nerve, muscle, blood), cell utility, tissue concept (plant/animal), tissue function, tissue/organ/organ system organization, practical observation (onion, protozoa), drawing, instrument use, cell contribution.
            3.  **Cell Division:** Concept, types, mitosis (stages, importance), meiosis (significance in gametes), cell division in life continuity.
            4.  **Vital Energy:** ATP as energy source, photosynthesis (sugar, light, chlorophyll role, organism dependence), respiration (aerobic/anaerobic, importance), photosynthesis vs. respiration, experiments (chlorophyll, light, heat release), plant contribution, sensitivity towards plants.
            5.  **Food, Nutrition & Digestion:** Plant nutrients, deficiency symptoms, animal food components/sources, ideal food pyramid, deficiency diseases (prevention/remedy), kilocalorie/kilojoule, BMR/BMI (importance, relation, age/gender effects), exercise/rest, food preservation chemicals, digestive organs/glands (liver, pancreas), enzyme role, intestinal diseases (prevention/remedy), diet planning, poster for awareness.
            6.  **Transport in Organisms:** Plant transport (concept, necessity), plant-water relation, water/mineral absorption, transport of photosynthetic products, transpiration (concept, significance, control factors, necessity), human circulation, blood components/groups, blood donation (rules, social responsibility), circulation process, heart structure/function, blood pressure, ideal BP, cholesterol (types, limits, utility, health risk), cholesterol in circulation, BP diseases (symptoms, causes, prevention/remedy), keeping heart healthy, measuring BP/pulse, awareness.
            7.  **Gaseous Exchange:** Plant gaseous exchange, human respiratory system (parts, functions), lung structure/function, breathing process/gaseous exchange, respiratory diseases (symptoms, causes, prevention/remedy), exhaled gas nature, drawing lungs, awareness.
            8.  **Excretion:** Human excretion, excretory products, kidney structure/function, nephron structure/function, kidney role in osmoregulation, kidney stone prevention/remedy, kidney failure (symptoms, management), dialysis, transplant/post-mortem kidney donation, urinary tract diseases, public opinion on donation, drawing kidneys/nephrons, social awareness, kidney health awareness.
            9.  **Support & Movement:** Human skeleton, support role of skeleton, bone/joint types & functions, muscle action, tendon/ligament function, osteoporosis/arthritis (causes, symptoms, remedies), drawing skeleton, bone health awareness.
            10. **Coordination:** Plant coordination, animal coordination, nervous system parts/functions, nerve/neuron structure/function, reflex action, emotion processing, hormones (functions, prevention of issues), hormonal abnormalities, stroke (causes, symptoms), neurological disorders, tobacco/drug effects, awareness.
            11. **Reproduction in Organisms:** Concept, flower as reproductive organ, sexual reproduction in flowering plants (life cycle), asexual/sexual reproduction in animals, nature of reproduction, male/female fertilization difference, human reproduction (embryo diagrams), hormones in reproduction, human embryo development, AIDS (causes, prevention, remedy), AIDS awareness poster, empathy for AIDS patients.
            12. **Heredity & Evolution:** Heredity concept, characteristic carriers, trait transfer, DNA replication/role/test necessity, sex determination (ancestral role), genetic disorders, evolution concept, natural selection, species survival, resemblance/dissimilarity with parents, DNA test contribution.
            13. **Environment of Organisms:** Ecosystem (concept, component interrelation), food chain/web, energy flow/nutrient relation, trophic levels, energy pyramid, pyramid effect on food chain/web, biodiversity (types), biodiversity in ecosystem stability, interaction/interdependence in environmental balance, environmental conservation methods/importance, drawing environment components/energy flow, appreciation/awareness.
            14. **Biotechnology:** Concept, tissue culture (concept, use in crop production), genetic engineering (purpose, use in crop/insulin/hormone production), utility, genetic engineering in animal disease cure, poster for awareness, contribution to daily life.

            **Teaching Guidelines:**
            -   **NCTB Focus:** Strictly use NCTB textbooks. Include MCQ (with explanation), CQ, and Lab Practicals (Class 9-12).
            -   **Language:** Explain in Bangla, use English for technical terms.
            -   **Style:** Easy, structured (e.g., 'সংজ্ঞা', 'উদাহরণ', 'বোর্ড প্রশ্ন বিশ্লেষণ').
            -   **Interactive:** Guided practice (biological processes, problem-solving), mini-quizzes, diagram-drawing.
            -   **Examples:** Bangladeshi life-based examples, real-world metaphors.
            -   **Exam Strategy:** Mark distribution, 5-year board trends, Srijonshil techniques, memory tricks.
            -   **Image/Diagrams:** Interpret biological diagrams, charts.
            -   **Engagement:** Motivational messages, anecdotes, positive reinforcement.
            -   **Output Format:** Structured, clear, primarily Bangla with English terms.`
        },
        "BGS": {
            initialEngagementMessage: "স্বাগতম তোমার নিজস্ব বাংলাদেশ ও বিশ্বপরিচয় টিচারে! আমি ‘বাংলাদেশ ও বিশ্বপরিচয় Teacher BD’—তোমার পড়ালেখার জন্য! চলো আজ থেকে প্রতিটি অধ্যায় বুঝে নিই। পরীক্ষা, সৃজনশীল প্রশ্ন, MCQ, বোর্ড প্রশ্ন।।।সব কিছু সহজ আর আনন্দয়ায়ক করে তুলি।",
            prompt: `You are 'বাংলাদেশ ও বিশ্বপরিচয় Teacher BD', a friendly, patient, and inspiring full-time NCTB 'বাংলাদেশ ও বিশ্বপরিচয়' teacher for SSC (Class 9-10) students. Focus on the Bangladeshi context and NCTB textbooks.

            **Curriculum Overview (SSC Bangladesh & Global Studies - Class 9-10):**
            1.  **East Bengal Movement & Rise of Nationalism (1947-1990):** Bengali rise, nationalism events, Language Movement (1952, 26-point), Awami Muslim League, 1954 election, 1969 uprising, Agartala Conspiracy Case, Bangabandhu's March 7 speech, autonomy movement, discrimination.
            2.  **Independent Bangladesh:** March 7 speech's importance, Liberation War background, wartime govt. role, roles of groups (parties, students, etc.), war criminal trials, international recognition, post-independence industry/commerce, national assets.
            3.  **Solar System & Earth:** Planets, satellites, stars, galaxies, comets, meteors; solar system structure, Earth's size/motion, sun's effects, heat/air variation, climate change, moon/sun influence, Earth's internal structure, internal/external forces, day/night, natural/social events, time differences, planetary impact on life, awareness.
            4.  **Bangladesh Geography & Climate:** Geographical location/boundaries, physiography/climate, rivers (origin, flow, uses), physiography/resources impact on life, climate change (causes, effects, preparedness), natural disasters (flood, drought, cyclone, etc.).
            5.  **Bangladesh Rivers & Natural Resources:** Major rivers (Padma, Brahmaputra, etc.), tributaries, flow/characteristics, resource concept, resource management, resource impact on life, conservation, awareness.
            6.  **State, Citizenship & Law:** State concept/elements, citizenship concept, state functions, citizenship acquisition, dual citizenship, state-citizen relation, law concept/sources/necessity/types, citizen duties, law enforcement.
            7.  **Bangladesh Govt. Organs & Admin:** Relation/roles of state organs, legislative/executive/judicial concepts/structure/function, local administration evaluation, rights/responsibilities.
            8.  **Bangladesh Democracy & Election:** Democracy concept, election concept, political party concept, electoral system, related info, democratic system.
            9.  **UN & Bangladesh:** UN formation, structure/function, objectives, Bangladesh's role/activities, peacekeeping contributions, women/child rights, respect for UN functions.
            10. **Sustainable Development Goals (SDGs):** SDG concept/importance, goals/objectives, Bangladesh's progress/challenges, Bangladesh's role/contribution, strategies.
            11. **National Resources & Economic System:** National resource concept/types, Bangladesh's resources, importance, conservation, economic system concepts/types, Bangladesh's system, awareness.
            12. **Economic Indicators & Bangladesh Economy:** GNP, GDP, per capita income, GNP vs. GDP, sector-wise economy, main features, economic progress, productivity/employment, problem-solving awareness.
            13. **Bangladesh Govt. Finance & Banking:** Public finance, income/expenditure sources, expenditure sectors, banking concept, types, central/commercial bank functions, banking in poverty reduction/employment, financial awareness.
            14. **Bangladesh Family Structure & Socialization:** Family concept/types, functions, changes in family/socialization, gender roles, socialization concept, family/institution roles.
            15. **Bangladesh Social Change:** Concept, factors/impacts, objectives, women's role, impact on rural/urban society.
            16. **Bangladesh Social Problems & Remedies:** Problem/remedy, social disorder/anarchy, moral decay, violence against women (causes/remedy), child labor (remedy), AIDS (concept/remedy), drug addiction (remedy), corruption (remedy).

            **Teaching Guidelines:**
            -   **NCTB Focus:** Strictly use NCTB textbooks. Include MCQ (with explanation), CQ, and analytical exercises.
            -   **Language:** Explain in Bangla, use English for technical terms.
            -   **Style:** Easy, structured (e.g., 'সংজ্ঞা', 'উদাহরণ', 'বোর্ড প্রশ্ন বিশ্লেষণ').
            -   **Interactive:** Guided practice (historical events, social issues, problem-solving), mini-quizzes, map/diagram analysis.
            -   **Examples:** Bangladeshi life-based examples, real-world metaphors.
            -   **Exam Strategy:** Mark distribution, 5-year board trends, Srijonshil techniques, memory tricks.
            -   **Image/Diagrams:** Interpret maps, charts, graphs, historical images.
            -   **Engagement:** Motivational messages, anecdotes, positive reinforcement.
            -   **Output Format:** Structured, clear, primarily Bangla with English terms.`
        },
        "English": {
            initialEngagementMessage: "Welcome to your personal English Teacher! I'm 'English Teacher BD'—here to help you excel in your studies! I'm here to assist you! Let's make every chapter understandable, from paragraphs, emails, letters, and dialogues to grammar... let's make everything easy and enjoyable.",
            prompt: `You are English Teacher BD, a friendly, patient, and inspiring full-time NCTB English teacher for SSC (Class 9-10) students. Strictly based on NCTB textbooks, you specialize in writing components (Paragraphs, Emails, Letters, Dialogues) and grammar.

            **Teaching Guidelines:**
            -   **NCTB Focus:** Follow NCTB English textbooks. Focus on practical application for writing and clear grammar rules.
            -   **Language:** All explanations and core teaching in English.
            -   **Style:** Easy, structured (e.g., 'Rule,' 'Example,' 'Tips').
            -   **Interactive:** Guided practice (brainstorming, structuring, drafting), grammar exercises, collaborative problem-solving.
            -   **Examples:** Contextually relevant writing examples, simple analogies for grammar.
            -   **Exam Strategy:** Mark distribution, 5-year board trends, creative writing techniques, memory tricks for grammar/vocab.
            -   **Writing Specifics:**
                -   **Paragraph:** Topic sentences, supporting details, coherence, unity.
                -   **Email/Letter:** Appropriate format, salutations, body content, closings (formal/informal).
                -   **Dialogue:** Natural conversation flow, character voice, punctuation.
            -   **Grammar Specifics:** Fundamental topics (Tenses, Parts of Speech, Sentence Structure, Voice, Narration, Articles, Prepositions) with clear rules and practice.
            -   **Engagement:** Motivational messages, anecdotes, positive reinforcement.
            -   **Output Format:** Structured, clear explanations, rules, examples. Step-by-step guidance for writing tasks, grammar exercises with explanations.`
        }
    };

    // --- GLOBAL STATE & DOM REFERENCES ---
    let messages = [];
    let selectedModel = Object.keys(MODEL_CONFIGS)[0]; 
    let systemPrompt = null;
    
    const dom = {
        chatWindow: document.getElementById('chat-window'),
        messageInput: document.getElementById('message-input'),
        sendButton: document.getElementById('send-button'),
        modelSelect: document.getElementById('model-select'),
        classSelect: document.getElementById('class-select'),
        subjectContainer: document.getElementById('subject-container'),
        subjectSelect: document.getElementById('subject-select'),
        restartChatButton: document.getElementById('restart-chat-button'),
        themeToggle: document.getElementById('theme-toggle'),
        errorBanner: document.getElementById('error-banner'),
        themeToggleKnob: document.getElementById('theme-toggle-knob'),
        themeLabel: document.getElementById('theme-label'),
        mainSidebar: document.getElementById('main-sidebar'),
        sidebarOverlay: document.getElementById('sidebar-overlay'),
        menuToggle: document.getElementById('menu-toggle'),
        sidebarCloseButton: document.getElementById('sidebar-close-button'),
    };
    
    const ICONS = {
        user: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
        ai: `👋`,
        copy: `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>`,
        copied: `<svg class="w-4 h-4 text-[var(--accent-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`,
        restart: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 11M20 20l-1.5-1.5A9 9 0 013.5 13" /></svg>`,
        menu: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>`,
        close: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`,
    };

    // --- CORE FUNCTIONS ---
    const handleSuggestionClick = (prompt) => {
        dom.messageInput.value = prompt;
        adjustTextareaHeight();
        handleSend();
    };

    const renderWelcomeScreen = () => {
        const suggestions = [
            { icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>`, text: 'AI Study Tips' },
            { icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h4a2 2 0 012 2v2M5 15h14"></path></svg>`, text: 'Future AI Careers' },
            { icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>`, text: 'Responsible AI' },
            { icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>`, text: 'পরীক্ষার প্রস্তুতির টিপস' }
        ];

        let buttonsHTML = suggestions.map(s => `
            <button onclick="handleSuggestionClick('${s.text}')" class="flex items-center justify-center text-left p-4 bg-[var(--button-bg)] border border-[var(--border-color)] rounded-xl hover:bg-[var(--button-hover-bg)] hover:shadow-md transition-all duration-200 group">
                <div class="mr-4 text-[var(--text-color)] group-hover:text-[var(--accent-color)] transition-colors">${s.icon}</div>
                <span class="font-semibold text-md">${s.text}</span>
            </button>
        `).join('');

        dom.chatWindow.innerHTML = `
            <div class="flex-1 flex flex-col justify-center items-center text-center max-w-2xl mx-auto px-4 animate-fade-in-up">
                <h1 class="text-4xl md:text-5xl font-bold text-[var(--text-color)] mb-3">
                    <span class="inline-block mr-2 animate-wiggle">👋</span> Hi! I'm TBD Chat –
                </h1>
                <h2 class="text-3xl md:text-4xl font-semibold text-[var(--text-color)] mb-8">
                    your AI study buddy.<br/>How can I help you grow today?
                </h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">${buttonsHTML}</div>
            </div>`;
    };
    
    const copyToClipboard = (text) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed'; 
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand('copy');
            return true;
        } catch (err) {
            console.error('Failed to copy text: ', err);
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    };

    const createCopyButton = (textToCopy) => {
        const copyButton = document.createElement('button');
        copyButton.className = 'message-copy-button';
        copyButton.title = 'Copy message';
        copyButton.innerHTML = ICONS.copy;
        copyButton.onclick = (e) => {
            e.stopPropagation();
            if (copyToClipboard(textToCopy)) {
                copyButton.innerHTML = ICONS.copied;
                setTimeout(() => { copyButton.innerHTML = ICONS.copy; }, 2000);
            } else {
                showError('Failed to copy text.');
            }
        };
        return copyButton;
    };
    
    const renderMessage = (msg) => {
        const isUser = msg.sender === 'user';
        const wrapper = document.createElement('div');
        // CHANGE: Wrapper now just aligns the message left or right.
        wrapper.className = `chat-message-wrapper animate-fade-in-up ${isUser ? 'user' : ''}`; 
        
        // CHANGE: Avatar element creation has been removed.
        
        const msgBubble = document.createElement('div');
        msgBubble.className = `relative group chat-message-bubble ${isUser ? 'user-message-bubble' : 'ai-message-bubble'}`;
        
        const prose = document.createElement('div');
        prose.className = `prose ${isUser ? 'text-[var(--user-msg-text)]' : 'text-[var(--ai-msg-text)]'}`;
        
        if (msg.streaming) {
            prose.innerHTML = `<div class="flex items-center space-x-3 text-[var(--ai-msg-text)]"><svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Generating response...</span></div>`;
        } else {
            prose.innerHTML = marked.parse(msg.text || ''); 
        }
        
        msgBubble.appendChild(prose);
        msg.domElement = prose;

        // CHANGE: The bubble is now the only child of the wrapper.
        wrapper.appendChild(msgBubble);
        return wrapper;
    };
    
    const renderAllMessages = () => {
        dom.chatWindow.innerHTML = '';
        if (messages.length === 0) {
            renderWelcomeScreen();
            return;
        }
        messages.forEach(msg => {
            const messageElement = renderMessage(msg);
            dom.chatWindow.appendChild(messageElement);
            if (!msg.streaming && window.MathJax && msg.domElement) {
                MathJax.typesetPromise([msg.domElement]); 
            }
        });
        dom.chatWindow.scrollTop = dom.chatWindow.scrollHeight;
    };

    const showError = (message) => {
        dom.errorBanner.textContent = message;
        dom.errorBanner.classList.remove('hidden', 'opacity-0');
        dom.errorBanner.classList.add('opacity-100');
        setTimeout(() => {
            dom.errorBanner.classList.remove('opacity-100');
            dom.errorBanner.classList.add('opacity-0');
            setTimeout(() => dom.errorBanner.classList.add('hidden'), 300);
        }, 5000);
    };
    
    const toggleSendButton = (enable) => {
        dom.sendButton.disabled = !enable;
        dom.messageInput.disabled = !enable;
    };

    const handleSend = async () => {
        const text = dom.messageInput.value.trim();
        if (!text || dom.sendButton.disabled) return;
        
        toggleSendButton(false);
        dom.messageInput.value = '';
        adjustTextareaHeight();

        if (messages.length === 0) dom.chatWindow.innerHTML = '';

        const userMessage = { sender: 'user', text };
        messages.push(userMessage);
        dom.chatWindow.appendChild(renderMessage(userMessage));
        dom.chatWindow.scrollTop = dom.chatWindow.scrollHeight;
        
        const modelConfig = MODEL_CONFIGS[selectedModel]; 
        const aiMessage = { sender: 'ai', text: '', streaming: true };
        messages.push(aiMessage);
        const aiMessageElement = renderMessage(aiMessage);
        dom.chatWindow.appendChild(aiMessageElement);
        dom.chatWindow.scrollTop = dom.chatWindow.scrollHeight;

        try {
            let payload;
            let fetchOptions;
            let apiUrl;

            if (modelConfig.type === 'openrouter') {
                apiUrl = modelConfig.apiUrl;
                
                const messagesForApi = [];
                if (systemPrompt) {
                    messagesForApi.push({ role: 'system', content: systemPrompt });
                }
                const visibleHistory = messages.slice(0, -1).map(m => ({
                    role: m.sender === 'user' ? 'user' : 'assistant',
                    content: m.text
                }));
                messagesForApi.push(...visibleHistory);

                payload = {
                    model: modelConfig.modelName,
                    messages: messagesForApi,
                    temperature: 0.7
                };

                fetchOptions = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${modelConfig.apiKey}`,
                        'HTTP-Referer': 'https://tbd-chat-app.com', // Example referrer
                        'X-Title': 'TBD Chat' // Example title
                    },
                    body: JSON.stringify(payload)
                };
            } else { // 'gemini'
                apiUrl = `${modelConfig.apiUrl}?key=${modelConfig.apiKey}`;
                
                const contentsForApi = [];
                if (systemPrompt) {
                    contentsForApi.push({ role: 'user', parts: [{ text: systemPrompt }] });
                    contentsForApi.push({ role: 'model', parts: [{ text: "Understood. I will act as the specified teacher and use LaTeX for all math, ensuring correct single backslashes and proper delimiters." }] });
                }
                const visibleHistory = messages.slice(0, -1).map(m => ({
                    role: m.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: m.text }]
                }));
                contentsForApi.push(...visibleHistory);
            
                payload = { 
                    contents: contentsForApi, 
                    generationConfig: { temperature: 0.7 } 
                };

                fetchOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                };
            }

            const response = await fetch(apiUrl, fetchOptions);
            const result = await response.json();

            if (!response.ok || result.error) {
                throw new Error(result.error?.message || `HTTP Error ${response.status}: ${JSON.stringify(result)}`);
            }
            
            let rawAiText;
            if (modelConfig.type === 'openrouter') {
                rawAiText = result.choices?.[0]?.message?.content || "No response received.";
            } else { // 'gemini'
                rawAiText = result.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
            }

            // --- ROBUST LATEX PRE-PROCESSING AND SANITIZATION ---
            const mathBlocks = [];
            const mathRegex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g; 
            let tempTextToProcess = rawAiText; 

            let match;
            mathRegex.lastIndex = 0; 
            let processedTextWithPlaceholders = rawAiText; 

            while ((match = mathRegex.exec(tempTextToProcess)) !== null) {
                const fullMatch = match[0]; 

                let latexContent = fullMatch;
                latexContent = latexContent.replace(/\\\\/g, '\\'); 
                
                const placeholder = `MATH_PLACEHOLDER_${mathBlocks.length}__`;
                mathBlocks.push({ placeholder: placeholder, latex: latexContent });

                processedTextWithPlaceholders = 
                    processedTextWithPlaceholders.substring(0, match.index) + 
                    placeholder + 
                    processedTextWithPlaceholders.substring(match.index + fullMatch.length);
                
                mathRegex.lastIndex = match.index + placeholder.length;
                tempTextToProcess = processedTextWithPlaceholders; 
            }

            let htmlContent = marked.parse(processedTextWithPlaceholders);

            mathBlocks.forEach(block => {
                const globalPlaceholderRegex = new RegExp(block.placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
                htmlContent = htmlContent.replace(globalPlaceholderRegex, block.latex);
            });

            aiMessage.text = htmlContent; 
            
        } catch (error) {
            aiMessage.text = `**Error:** ${error.message}`;
            console.error('API Error:', error);
            showError(error.message);
        } finally {
            aiMessage.streaming = false;
            const proseElement = aiMessage.domElement;
            const msgBubbleElement = proseElement.parentElement;
            
            proseElement.innerHTML = aiMessage.text; 
            
            if (window.MathJax) {
                MathJax.typesetPromise([proseElement]).then(() => {
                    dom.chatWindow.scrollTop = dom.chatWindow.scrollHeight;
                }).catch(err => {
                    console.error("MathJax rendering failed:", err);
                    showError("Failed to render math formulas.");
                });
            } else {
                dom.chatWindow.scrollTop = dom.chatWindow.scrollHeight;
            }
            
            if (msgBubbleElement && !msgBubbleElement.querySelector('.message-copy-button')) {
                msgBubbleElement.appendChild(createCopyButton(aiMessage.text));
            }
            
            dom.chatWindow.scrollTop = dom.chatWindow.scrollHeight;
            toggleSendButton(true);
        }
    };

    const adjustTextareaHeight = () => {
        const textarea = dom.messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 192)}px`;
    };
    
    const setTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            dom.themeToggle.style.backgroundColor = 'var(--accent-color)';
            dom.themeToggleKnob.style.transform = 'translateX(20px)';
            dom.themeLabel.textContent = 'Dark';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            dom.themeToggle.style.backgroundColor = 'var(--button-border)';
            dom.themeToggleKnob.style.transform = 'translateX(0px)';
            dom.themeLabel.textContent = 'Light';
        }
    };

    const toggleTheme = () => {
        const currentTheme = localStorage.getItem('theme') || 'light';
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    };
    
    const toggleSidebar = () => {
        dom.mainSidebar.classList.toggle('open');
        dom.sidebarOverlay.classList.toggle('open');
    };

    const startTeacherSession = (subjectKey) => {
        if (!subjectKey) return;
        
        const confirmAction = (message, onConfirm, onCancel) => {
            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
            modalOverlay.innerHTML = `
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm mx-auto text-center">
                    <p class="text-lg font-semibold mb-4 text-[var(--text-color)]">${message}</p>
                    <div class="flex justify-center space-x-4">
                        <button id="modal-cancel" class="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                        <button id="modal-confirm" class="px-4 py-2 rounded-md bg-[var(--send-button-bg)] text-white hover:bg-[var(--send-button-hover-bg)] transition-colors">Confirm</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modalOverlay);

            document.getElementById('modal-confirm').onclick = () => {
                modalOverlay.remove();
                onConfirm();
            };
            document.getElementById('modal-cancel').onclick = () => {
                modalOverlay.remove();
                onCancel();
            };
        };

        confirmAction(`Start a new chat session with the selected Teacher? This will clear your current conversation.`, () => {
            dom.chatWindow.style.opacity = '0';
            if(window.innerWidth < 768) {
                toggleSidebar();
            }
            setTimeout(() => {
                const teacher = TEACHER_PROMPTS[subjectKey];
                systemPrompt = teacher.prompt;
                messages = [{ sender: 'ai', text: teacher.initialEngagementMessage }];
                renderAllMessages(); 

                // Ensure model select is always enabled
                dom.modelSelect.disabled = false; 

                dom.chatWindow.style.opacity = '1';
            }, 300);
        }, () => {
            dom.subjectSelect.value = '';
        });
    }

    const init = () => {
        // Populate Model Select
        Object.keys(MODEL_CONFIGS).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.innerText = name;
            dom.modelSelect.appendChild(option);
        });
        selectedModel = Object.keys(MODEL_CONFIGS)[0]; 
        dom.modelSelect.value = selectedModel;
        
        // Populate Class Select
        const defaultClassOption = document.createElement('option');
        defaultClassOption.value = "";
        defaultClassOption.innerText = "Select a Class...";
        defaultClassOption.disabled = true;
        defaultClassOption.selected = true;
        dom.classSelect.appendChild(defaultClassOption);
        
        // ADDED CLASS 8
        const classOption8 = document.createElement('option');
        classOption8.value = "8";
        classOption8.innerText = "Class 8";
        dom.classSelect.appendChild(classOption8);

        const classOption910 = document.createElement('option');
        classOption910.value = "9-10";
        classOption910.innerText = "Class 9-10";
        dom.classSelect.appendChild(classOption910);

        // Add "No Class" option at the very bottom
        const noClassOption = document.createElement('option');
        noClassOption.value = "no-class";
        noClassOption.innerText = "No Class";
        dom.classSelect.appendChild(noClassOption);

        const populateSubjectSelect = (selectedClass) => {
            dom.subjectSelect.innerHTML = ''; 
            const defaultOption = document.createElement('option');
            defaultOption.value = "";
            defaultOption.innerText = "Select a Subject...";
            defaultOption.disabled = true;
            defaultOption.selected = true;
            dom.subjectSelect.appendChild(defaultOption);

            const subjects = CLASS_SUBJECTS[selectedClass];
            if (subjects) {
                Object.keys(subjects).forEach(displayName => {
                    const option = document.createElement('option');
                    option.value = subjects[displayName]; // The value is the key for TEACHER_PROMPTS
                    option.innerText = displayName; // The text is the user-friendly name
                    dom.subjectSelect.appendChild(option);
                });
            }
        };

        // Event listener for class selection
        dom.classSelect.addEventListener('change', (e) => {
            const selectedClass = e.target.value;
            if (selectedClass === '8' || selectedClass === '9-10') {
                populateSubjectSelect(selectedClass);
                dom.subjectContainer.classList.remove('hidden');
                dom.modelSelect.disabled = false;
            } else if (selectedClass === 'no-class') {
                dom.subjectContainer.classList.add('hidden');
                dom.subjectSelect.value = ''; 
                
                messages = []; 
                systemPrompt = null; 
                renderAllMessages(); 
                
                dom.modelSelect.disabled = false; 
                dom.modelSelect.value = Object.keys(MODEL_CONFIGS)[0]; 
                selectedModel = Object.keys(MODEL_CONFIGS)[0]; 
            } else {
                dom.subjectContainer.classList.add('hidden');
                dom.modelSelect.disabled = false;
            }
        });

        // Set icons
        dom.restartChatButton.innerHTML = ICONS.restart;
        dom.menuToggle.innerHTML = ICONS.menu;
        dom.sidebarCloseButton.innerHTML = ICONS.close;
        
        // Set theme
        const preferredTheme = localStorage.getItem('theme') || 'light';
        setTheme(preferredTheme);
        
        renderAllMessages();

        // Event Listeners
        dom.modelSelect.addEventListener('change', (e) => { 
            selectedModel = e.target.value;
        });
        dom.subjectSelect.addEventListener('change', (e) => {
            const subjectKey = e.target.value;
            startTeacherSession(subjectKey);
        });
        dom.themeToggle.addEventListener('click', toggleTheme);
        dom.restartChatButton.addEventListener('click', () => {
            const confirmAction = (message, onConfirm, onCancel) => {
                const modalOverlay = document.createElement('div');
                modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
                modalOverlay.innerHTML = `
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm mx-auto text-center">
                        <p class="text-lg font-semibold mb-4 text-[var(--text-color)]">${message}</p>
                        <div class="flex justify-center space-x-4">
                            <button id="modal-cancel" class="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                            <button id="modal-confirm" class="px-4 py-2 rounded-md bg-[var(--send-button-bg)] text-white hover:bg-[var(--send-button-hover-bg)] transition-colors">Confirm</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modalOverlay);

                document.getElementById('modal-confirm').onclick = () => {
                    modalOverlay.remove();
                    onConfirm();
                };
                document.getElementById('modal-cancel').onclick = () => {
                    modalOverlay.remove();
                    onCancel();
                };
            };

            confirmAction('Are you sure you want to clear this conversation and end the current session?', () => {
                dom.chatWindow.style.opacity = '0';
                setTimeout(() => {
                    messages = [];
                    systemPrompt = null;
                    renderAllMessages();
                    
                    dom.classSelect.value = "";
                    dom.subjectSelect.value = "";
                    dom.subjectContainer.classList.add('hidden');
                    dom.modelSelect.disabled = false; 
                    dom.modelSelect.value = Object.keys(MODEL_CONFIGS)[0]; 
                    selectedModel = Object.keys(MODEL_CONFIGS)[0]; 

                    dom.chatWindow.style.opacity = '1';
                }, 300);
            }, () => {
            });
        });
        dom.sendButton.addEventListener('click', handleSend);
        dom.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });
        dom.messageInput.addEventListener('input', adjustTextareaHeight);
        dom.menuToggle.addEventListener('click', toggleSidebar);
        dom.sidebarOverlay.addEventListener('click', toggleSidebar);
        dom.sidebarCloseButton.addEventListener('click', toggleSidebar);

        adjustTextareaHeight();
    };

    // Start the application
    init();
});