class QuestionGenerator {
    constructor() {
        this.roasts = [
            "Bruh, a 5-year-old could solve this! 🍼",
            "Are you even IIT material? 🤔",
            "Harvard rejects are faster than you! 🏃‍♂️",
            "My grandma solves these in her sleep! 😴",
            "Is this your first day with numbers? 🔢",
            "Maybe try finger counting? 👆",
            "The calculator is crying right now! 😭",
            "Even the boss question is laughing! 😂",
            "Did you skip math class... forever? 🏫",
            "The numbers are judging you! 👀",
            "This is why we can't have nice things! 💔",
            "Are you trying to set a world record for slowness? 🐌",
            "The answer was literally staring at you! 👁️",
            "Maybe math just isn't your thing... 🤷‍♂️",
            "I've seen snails solve faster! 🐌",
            "Did you use a random number generator? 🎲",
            "The math gods are disappointed! ⚡",
            "This is painful to watch! 😫",
            "Maybe stick to counting sheep? 🐑",
            "The universe just facepalmed! 🤦‍♂️"
        ];

        this.compliments = [
            "Math Genius! 🌟",
            "Unstoppable! 💪",
            "Brilliant! 🧠",
            "Perfect! ✅",
            "Amazing! 😲",
            "Incredible! 🚀",
            "Masterful! 🎯",
            "Flawless! 💎",
            "Phenomenal! 🌈",
            "Legendary! 🏆"
        ];

        this.difficultyLevels = {
            1: { name: "Easy", color: "#00ff7f", time: 30 },
            2: { name: "Medium", color: "#ffaa00", time: 25 },
            3: { name: "Hard", color: "#ff4444", time: 20 },
            4: { name: "Expert", color: "#cc00ff", time: 15 },
            5: { name: "Master", color: "#ff0066", time: 10 }
        };
    }

    generateQuestion(level) {
        const difficulty = this.getDifficulty(level);
        let question, answer, explanation, category;
        
        // Determine question type based on level and random selection
        const questionTypes = this.getQuestionTypes(level);
        const selectedType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        
        switch(selectedType) {
            case 'basic_arithmetic':
                ({ question, answer } = this.generateBasicArithmetic(level));
                category = 'Arithmetic';
                break;
                
            case 'algebra':
                ({ question, answer } = this.generateAlgebra(level));
                category = 'Algebra';
                break;
                
            case 'geometry':
                ({ question, answer } = this.generateGeometry(level));
                category = 'Geometry';
                break;
                
            case 'fractions':
                ({ question, answer } = this.generateFractions(level));
                category = 'Fractions';
                break;
                
            case 'sequences':
                ({ question, answer } = this.generateSequence(level));
                category = 'Sequences';
                break;
                
            case 'probability':
                ({ question, answer } = this.generateProbability(level));
                category = 'Probability';
                break;
                
            case 'calculus':
                ({ question, answer } = this.generateCalculus(level));
                category = 'Calculus';
                break;
                
            case 'word_problem':
                ({ question, answer } = this.generateWordProblem(level));
                category = 'Word Problem';
                break;
                
            default:
                ({ question, answer } = this.generateBasicArithmetic(level));
                category = 'Arithmetic';
        }

        const options = this.generateOptions(answer, level, selectedType);
        explanation = this.generateExplanation(question, answer, selectedType);

        return {
            question,
            answer: answer.toString(),
            options,
            explanation,
            category,
            difficulty: difficulty.name,
            timeLimit: difficulty.time
        };
    }

    getDifficulty(level) {
        if (level <= 5) return this.difficultyLevels[1];
        if (level <= 15) return this.difficultyLevels[2];
        if (level <= 30) return this.difficultyLevels[3];
        if (level <= 50) return this.difficultyLevels[4];
        return this.difficultyLevels[5];
    }

    getQuestionTypes(level) {
        if (level <= 5) return ['basic_arithmetic'];
        if (level <= 10) return ['basic_arithmetic', 'fractions'];
        if (level <= 20) return ['basic_arithmetic', 'algebra', 'geometry', 'fractions'];
        if (level <= 35) return ['algebra', 'geometry', 'sequences', 'probability'];
        if (level <= 50) return ['algebra', 'geometry', 'sequences', 'probability', 'word_problem'];
        return ['algebra', 'geometry', 'sequences', 'probability', 'word_problem', 'calculus'];
    }

    generateBasicArithmetic(level) {
        const operations = [
            { symbol: '+', method: (a, b) => a + b },
            { symbol: '-', method: (a, b) => a - b },
            { symbol: '×', method: (a, b) => a * b },
            { symbol: '÷', method: (a, b) => a / b }
        ];
        
        const op = operations[Math.floor(Math.random() * operations.length)];
        let a, b;
        
        switch(op.symbol) {
            case '+':
                a = this.getRandomInt(1, 10 + level * 3);
                b = this.getRandomInt(1, 10 + level * 3);
                break;
            case '-':
                a = this.getRandomInt(10 + level * 2, 20 + level * 4);
                b = this.getRandomInt(1, a - 1);
                break;
            case '×':
                a = this.getRandomInt(1, 5 + Math.floor(level / 2));
                b = this.getRandomInt(1, 5 + Math.floor(level / 2));
                break;
            case '÷':
                b = this.getRandomInt(2, 5 + Math.floor(level / 3));
                a = b * this.getRandomInt(2, 5 + Math.floor(level / 2));
                break;
        }
        
        const question = `What is ${a} ${op.symbol} ${b}?`;
        const answer = op.method(a, b);
        
        return { question, answer };
    }

    generateAlgebra(level) {
        const types = ['linear', 'quadratic', 'system'];
        const type = types[Math.min(Math.floor(level / 15), types.length - 1)];
        
        switch(type) {
            case 'linear':
                const x = this.getRandomInt(1, 10 + level);
                const coeff = this.getRandomInt(2, 5 + Math.floor(level / 5));
                const constant = this.getRandomInt(1, 10 + level);
                const question = `If ${coeff}x + ${constant} = ${coeff * x + constant}, what is x?`;
                return { question, answer: x };
                
            case 'quadratic':
                const a = 1;
                const b = this.getRandomInt(-10, 10);
                const c = this.getRandomInt(-20, 20);
                const discriminant = b * b - 4 * a * c;
                
                if (discriminant >= 0) {
                    const solution1 = (-b + Math.sqrt(discriminant)) / (2 * a);
                    const solution2 = (-b - Math.sqrt(discriminant)) / (2 * a);
                    const positiveSolution = Math.max(solution1, solution2);
                    const question = `Solve: x² + ${b}x + ${c} = 0. What is the positive solution?`;
                    return { question, answer: Math.round(positiveSolution) };
                } else {
                    // Fallback to linear
                    return this.generateAlgebra(5);
                }
                
            default:
                return this.generateAlgebra(5);
        }
    }

    generateGeometry(level) {
        const shapes = ['square', 'rectangle', 'triangle', 'circle'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        
        switch(shape) {
            case 'square':
                const side = this.getRandomInt(3, 10 + level);
                return {
                    question: `What is the area of a square with side length ${side}?`,
                    answer: side * side
                };
                
            case 'rectangle':
                const length = this.getRandomInt(4, 12 + level);
                const width = this.getRandomInt(3, 8 + level);
                return {
                    question: `What is the area of a rectangle with length ${length} and width ${width}?`,
                    answer: length * width
                };
                
            case 'triangle':
                const base = this.getRandomInt(5, 15 + level);
                const height = this.getRandomInt(4, 12 + level);
                return {
                    question: `What is the area of a triangle with base ${base} and height ${height}?`,
                    answer: Math.round((base * height) / 2)
                };
                
            case 'circle':
                const radius = this.getRandomInt(2, 8 + Math.floor(level / 3));
                return {
                    question: `What is the area of a circle with radius ${radius}? (Use π=3.14)`,
                    answer: Math.round(3.14 * radius * radius)
                };
        }
    }

    generateFractions(level) {
        const operations = ['+', '-', '×', '÷'];
        const op = operations[Math.floor(Math.random() * operations.length)];
        
        const num1 = this.getRandomInt(1, 5 + Math.floor(level / 2));
        const den1 = this.getRandomInt(2, 6 + Math.floor(level / 2));
        const num2 = this.getRandomInt(1, 5 + Math.floor(level / 2));
        const den2 = this.getRandomInt(2, 6 + Math.floor(level / 2));
        
        let question, answer;
        
        switch(op) {
            case '+':
                question = `What is ${num1}/${den1} + ${num2}/${den2}?`;
                const lcmAdd = this.lcm(den1, den2);
                answer = `${(num1 * (lcmAdd/den1) + num2 * (lcmAdd/den2))}/${lcmAdd}`;
                break;
                
            case '-':
                question = `What is ${num1}/${den1} - ${num2}/${den2}?`;
                const lcmSub = this.lcm(den1, den2);
                answer = `${(num1 * (lcmSub/den1) - num2 * (lcmSub/den2))}/${lcmSub}`;
                break;
                
            case '×':
                question = `What is ${num1}/${den1} × ${num2}/${den2}?`;
                answer = `${num1 * num2}/${den1 * den2}`;
                break;
                
            case '÷':
                question = `What is ${num1}/${den1} ÷ ${num2}/${den2}?`;
                answer = `${num1 * den2}/${den1 * num2}`;
                break;
        }
        
        return { question, answer };
    }

    generateSequence(level) {
        const types = ['arithmetic', 'geometric', 'fibonacci'];
        const type = types[Math.min(Math.floor(level / 10), types.length - 1)];
        
        switch(type) {
            case 'arithmetic':
                const start = this.getRandomInt(1, 10);
                const diff = this.getRandomInt(2, 5);
                const position = this.getRandomInt(5, 8);
                return {
                    question: `What is the ${this.ordinal(position)} term in the sequence: ${start}, ${start + diff}, ${start + 2*diff}, ...?`,
                    answer: start + (position - 1) * diff
                };
                
            case 'geometric':
                const startG = this.getRandomInt(1, 5);
                const ratio = this.getRandomInt(2, 4);
                const positionG = this.getRandomInt(4, 6);
                return {
                    question: `What is the ${this.ordinal(positionG)} term in the sequence: ${startG}, ${startG * ratio}, ${startG * ratio * ratio}, ...?`,
                    answer: startG * Math.pow(ratio, positionG - 1)
                };
                
            case 'fibonacci':
                const fibPosition = this.getRandomInt(6, 10);
                return {
                    question: `What is the ${this.ordinal(fibPosition)} number in the Fibonacci sequence?`,
                    answer: this.fibonacci(fibPosition)
                };
        }
    }

    generateProbability(level) {
        const total = this.getRandomInt(10, 20);
        const favorable = this.getRandomInt(1, total - 1);
        const event = this.getRandomEvent();
        
        return {
            question: `${event} What is the probability?`,
            answer: `${favorable}/${total}`
        };
    }

    generateCalculus(level) {
        const types = ['derivative', 'integral'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        switch(type) {
            case 'derivative':
                const n = this.getRandomInt(2, 5);
                return {
                    question: `What is the derivative of x^${n}?`,
                    answer: `${n}x^${n-1}`
                };
                
            case 'integral':
                const m = this.getRandomInt(2, 4);
                return {
                    question: `What is the integral of ${m}x^${m-1}?`,
                    answer: `x^${m}`
                };
        }
    }

    generateWordProblem(level) {
        const problems = [
            {
                question: `If a train travels at ${60 + level * 5} km/h for 2 hours, how far does it travel?`,
                answer: (60 + level * 5) * 2
            },
            {
                question: `A pizza is cut into 8 equal slices. If you eat ${2 + Math.floor(level / 5)} slices, what fraction of the pizza remains?`,
                answer: `${8 - (2 + Math.floor(level / 5))}/8`
            },
            {
                question: `If a book has ${200 + level * 10} pages and you read ${20 + level} pages per day, how many days to finish?`,
                answer: Math.ceil((200 + level * 10) / (20 + level))
            }
        ];
        
        return problems[Math.floor(Math.random() * problems.length)];
    }

    generateOptions(correctAnswer, level, type) {
        let options = [correctAnswer.toString()];
        const correctNum = parseFloat(correctAnswer);
        
        // Generate wrong options based on difficulty and type
        while (options.length < 4) {
            let wrongAnswer;
            const variance = Math.max(1, Math.floor(level * 0.5));
            
            if (typeof correctAnswer === 'string' && correctAnswer.includes('/')) {
                // Handle fraction answers
                const [num, den] = correctAnswer.split('/').map(Number);
                wrongAnswer = `${num + this.getRandomInt(-variance, variance)}/${den + this.getRandomInt(-variance, variance)}`;
            } else if (!isNaN(correctNum)) {
                // Handle numeric answers
                if (Math.random() > 0.5) {
                    wrongAnswer = correctNum + this.getRandomInt(-variance * 2, variance * 2);
                } else {
                    wrongAnswer = correctNum * (1 + (this.getRandomInt(-variance, variance) / 10));
                    wrongAnswer = Math.round(wrongAnswer * 100) / 100;
                }
                
                if (wrongAnswer === correctNum) wrongAnswer += 1;
            } else {
                // Handle text answers
                wrongAnswer = "undefined";
            }
            
            if (!options.includes(wrongAnswer.toString()) && wrongAnswer.toString() !== correctAnswer.toString()) {
                options.push(wrongAnswer.toString());
            }
        }
        
        return this.shuffleArray(options);
    }

    generateExplanation(question, answer, type) {
        const explanations = {
            basic_arithmetic: `The solution involves basic arithmetic operations.`,
            algebra: `Solve for the variable using algebraic manipulation.`,
            geometry: `Apply the appropriate geometric formula.`,
            fractions: `Find common denominators or multiply across.`,
            sequences: `Identify the pattern in the sequence.`,
            probability: `Calculate favorable outcomes over total outcomes.`,
            calculus: `Apply differentiation or integration rules.`,
            word_problem: `Translate the word problem into a mathematical equation.`
        };
        
        return explanations[type] || `The correct answer is obtained by solving the given problem.`;
    }

    getRandomEvent() {
        const events = [
            `A bag has RED red marbles and BLUE blue marbles. You pick one marble at random.`,
            `A dice is rolled. What's the probability of rolling an even number?`,
            `A deck of cards has 52 cards. What's the probability of drawing a heart?`,
            `A spinner has 6 equal sections numbered 1-6. What's the probability of spinning a prime number?`
        ];
        return events[Math.floor(Math.random() * events.length)];
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    lcm(a, b) {
        return (a * b) / this.gcd(a, b);
    }

    gcd(a, b) {
        if (b === 0) return a;
        return this.gcd(b, a % b);
    }

    ordinal(n) {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    fibonacci(n) {
        if (n <= 1) return n;
        let a = 0, b = 1;
        for (let i = 2; i <= n; i++) {
            [a, b] = [b, a + b];
        }
        return b;
    }

    getRandomRoast() {
        return this.roasts[Math.floor(Math.random() * this.roasts.length)];
    }

    getRandomCompliment() {
        return this.compliments[Math.floor(Math.random() * this.compliments.length)];
    }

    getDifficultyColor(level) {
        return this.getDifficulty(level).color;
    }

    getTimeLimit(level) {
        return this.getDifficulty(level).time;
    }
}