document.addEventListener('DOMContentLoaded', function() {

    const welcomeScreen = document.getElementById('welcome-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultScreen = document.getElementById('result-screen');
    const startBtn = document.getElementById('start-btn');
    const nextBtn = document.getElementById('next-btn');
    const restartBtn = document.getElementById('restart-btn');
    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    const currentQuestionElement = document.getElementById('current-question');
    const totalQuestionsElement = document.getElementById('total-questions');
    const scoreElement = document.getElementById('score');
    const maxScoreElement = document.getElementById('max-score');
    const feedbackElement = document.getElementById('feedback');
    const timeElement = document.getElementById('time');
    const difficultySelect = document.getElementById('difficulty');
    const questionCountSelect = document.getElementById('question-count');

    let currentQuestionIndex = 0;
    let score = 0;
    let questions = [];
    let timer;
    let timeLeft = 30;
    let userAnswers = [];


const questionDatabase = {
    easy: [
        {
            question: "What should you do if you receive an email asking for your password?",
            options: [
                "Reply with your password",
                "Forward it to your IT department and delete it",
                "Click any links in the email to verify its legitimacy",
                "Ignore it and keep it in your inbox"
            ],
            answer: 1,
            explanation: "Never share your password via email. Legitimate organizations will never ask for your password this way."
        },
        {
            question: "Which of these is the strongest password?",
            options: [
                "password123",
                "JohnDoe1985",
                "P@ssw0rd!2023",
                "12345678"
            ],
            answer: 2,
            explanation: "Strong passwords include uppercase, lowercase, numbers, and special characters, and avoid personal information."
        },
        {
            question: "What's the best way to handle software updates?",
            options: [
                "Ignore them - they're not important",
                "Enable automatic updates when available",
                "Only update when your computer stops working",
                "Update once every 5 years"
            ],
            answer: 1,
            explanation: "Automatic updates ensure you get security patches as soon as they're available."
        },
        {
            question: "What should you do if a website asks for more personal information than necessary?",
            options: [
                "Provide all information requested",
                "Only provide required fields marked with asterisks",
                "Close the website immediately",
                "Contact the organization to verify why they need this information"
            ],
            answer: 3,
            explanation: "Be cautious with sharing personal information. When in doubt, verify with the organization through official channels."
        },
        {
            question: "How often should you change your passwords?",
            options: [
                "Never",
                "Every 5 years",
                "Every 3-6 months for sensitive accounts",
                "Every day"
            ],
            answer: 2,
            explanation: "Regular password changes (3-6 months) for important accounts helps maintain security."
        },
        {
            question: "What's the safest way to browse public WiFi?",
            options: [
                "Use it for all activities including banking",
                "Only visit encrypted websites (HTTPS)",
                "Disable your firewall for better speed",
                "Share the network password with friends"
            ],
            answer: 1,
            explanation: "HTTPS encrypts your connection, making it safer on public networks."
        },
        {
            question: "What should you do with suspicious USB drives you find?",
            options: [
                "Plug them in to see what's on them",
                "Format them and use them yourself",
                "Hand them in to IT/lost and found",
                "Give them to a friend who needs storage"
            ],
            answer: 2,
            explanation: "Unknown USB devices can contain malware. Never plug them into your computer."
        },
        {
            question: "Why should you lock your computer when stepping away?",
            options: [
                "To save electricity",
                "To prevent unauthorized access",
                "To make your computer run faster",
                "It's just company policy"
            ],
            answer: 1,
            explanation: "Locking prevents others from accessing your accounts and sensitive information."
        },
        {
            question: "What does HTTPS in a website address indicate?",
            options: [
                "The site has extra features",
                "The connection is encrypted",
                "The site is government-approved",
                "The site loads faster"
            ],
            answer: 1,
            explanation: "HTTPS means communications between you and the site are encrypted."
        },
        {
            question: "What's the best response to a pop-up saying you won a prize?",
            options: [
                "Click to claim your prize",
                "Close the pop-up without clicking",
                "Enter your email to learn more",
                "Forward it to friends"
            ],
            answer: 1,
            explanation: "Most prize pop-ups are scams attempting to install malware or steal information."
        }
    ],
    medium: [
        // Medium difficulty questions...
        {
            question: "You're working in a coffee shop. What's the safest way to connect to the internet?",
            options: [
                "Use the free public WiFi without protection",
                "Use a VPN if you must use public WiFi",
                "Ask someone nearby for their hotspot password",
                "Don't connect at all - wait until you're home"
            ],
            answer: 1,
            explanation: "Public WiFi is often unsecured. A VPN encrypts your connection, protecting your data."
        },
        {
            question: "What should you do before clicking a shortened URL?",
            options: [
                "Click it immediately if it's from a friend",
                "Hover over it to see the real destination",
                "Assume all shortened URLs are safe",
                "Forward it to 10 friends first"
            ],
            answer: 1,
            explanation: "Hovering reveals the actual URL. Shortened links can hide malicious destinations."
        },
        {
            question: "What's the purpose of two-factor authentication?",
            options: [
                "To make logging in more annoying",
                "To provide backup if you forget one password",
                "To verify identity using two different methods",
                "To double your internet speed"
            ],
            answer: 2,
            explanation: "2FA adds an extra layer of security by requiring two forms of verification."
        },
        {
            question: "What's the safest way to store your passwords?",
            options: [
                "In a notebook by your computer",
                "In a text file on your desktop",
                "Using a reputable password manager",
                "All using the same easy-to-remember password"
            ],
            answer: 2,
            explanation: "Password managers securely store and generate strong, unique passwords for all your accounts."
        },
        {
            question: "What should you check before entering credentials on a website?",
            options: [
                "That the page looks nice",
                "The URL is correct and connection is HTTPS",
                "That your friends use the same site",
                "How many ads are on the page"
            ],
            answer: 1,
            explanation: "Always verify the URL is correct and look for HTTPS to avoid phishing sites."
        },
        {
            question: "Why shouldn't you use the same password everywhere?",
            options: [
                "It's harder to remember one password",
                "If one site is breached, all accounts are vulnerable",
                "Websites prohibit password reuse",
                "It makes logging in too fast"
            ],
            answer: 1,
            explanation: "Password reuse means a breach on one site compromises all your accounts."
        },
        {
            question: "What's the best practice for social media privacy?",
            options: [
                "Accept all friend requests",
                "Share your vacation plans publicly",
                "Regularly review and adjust privacy settings",
                "Post your work schedule"
            ],
            answer: 2,
            explanation: "Regular privacy checkups help control who sees your information."
        },
        {
            question: "What should you do with old devices that stored personal data?",
            options: [
                "Throw them in the trash",
                "Sell them without wiping data",
                "Perform factory reset or physical destruction",
                "Give them to strangers"
            ],
            answer: 2,
            explanation: "Proper data sanitization prevents your information from being recovered."
        },
        {
            question: "Why is it risky to jailbreak/root your mobile device?",
            options: [
                "It voids your warranty",
                "It removes built-in security protections",
                "It makes the device slower",
                "The battery drains faster"
            ],
            answer: 1,
            explanation: "Jailbreaking removes security layers that protect against malware."
        },
        {
            question: "What's a common sign of a phishing attempt?",
            options: [
                "Urgent requests for personal information",
                "Professional-looking logos",
                "Links to familiar websites",
                "All of the above"
            ],
            answer: 3,
            explanation: "Phishing often combines urgency, familiar elements, and requests for sensitive data."
        }
    ],
    hard: [
        // Hard difficulty questions...
        {
            question: "Your company was breached. As CISO, what's your first step?",
            options: [
                "Delete all logs to hide the breach",
                "Publicly announce the breach immediately",
                "Contain the breach and preserve evidence",
                "Wait to see if anyone notices"
            ],
            answer: 2,
            explanation: "Containment prevents further damage, while preserving evidence helps investigation."
        },
        {
            question: "What does 'zero trust' architecture mean?",
            options: [
                "Trust all devices inside your network perimeter",
                "Never verify users or devices - trust is unnecessary",
                "Verify explicitly and maintain least-privilege access",
                "Only trust devices manufactured by your company"
            ],
            answer: 2,
            explanation: "Zero trust means verifying all access attempts regardless of origin."
        },
        {
            question: "What's the most secure way to dispose of old hard drives?",
            options: [
                "Throw them in the trash",
                "Format them and sell on eBay",
                "Use physical destruction or certified wiping",
                "Keep them in a drawer just in case"
            ],
            answer: 2,
            explanation: "Physical destruction or certified wiping ensures data cannot be recovered."
        },
        {
            question: "What should you do if you suspect your computer has malware?",
            options: [
                "Continue using it normally",
                "Disconnect from the internet and run antivirus scans",
                "Delete all your files",
                "Share the suspicious files with friends to warn them"
            ],
            answer: 1,
            explanation: "Disconnecting prevents spread while you clean the system."
        },
        {
            question: "What's the primary risk of shadow IT?",
            options: [
                "Increased electricity costs",
                "Unauthorized systems lacking security controls",
                "Too many devices on the network",
                "Employees working longer hours"
            ],
            answer: 1,
            explanation: "Shadow IT refers to unauthorized systems that bypass security policies."
        },
        {
            question: "Why is encryption important for data at rest?",
            options: [
                "It makes files open faster",
                "It prevents unauthorized access if storage is compromised",
                "It reduces storage space needed",
                "It makes backups unnecessary"
            ],
            answer: 1,
            explanation: "Encryption protects data even if physical media is stolen."
        },
        {
            question: "What's the key benefit of network segmentation?",
            options: [
                "Limiting breach impact by isolating network zones",
                "Making the network easier to manage",
                "Reducing hardware costs",
                "Allowing unlimited internet access"
            ],
            answer: 0,
            explanation: "Segmentation contains breaches to limited network areas."
        },
        {
            question: "What's the purpose of a security operations center (SOC)?",
            options: [
                "To monitor and respond to security incidents 24/7",
                "To enforce physical building security",
                "To manage employee benefits",
                "To oversee office cleaning schedules"
            ],
            answer: 0,
            explanation: "A SOC continuously monitors for and responds to threats."
        },
        {
            question: "Why is patch management critical for security?",
            options: [
                "Patches often fix security vulnerabilities",
                "Patches make systems run slower",
                "Patches are required for warranty compliance",
                "Patches change system colors"
            ],
            answer: 0,
            explanation: "Unpatched systems are vulnerable to known exploits."
        },
        {
            question: "What's the main security benefit of multi-factor authentication?",
            options: [
                "It prevents all password attacks",
                "It compensates for weak passwords",
                "It requires multiple proofs of identity",
                "It eliminates the need for passwords"
            ],
            answer: 2,
            explanation: "MFA makes compromise significantly harder by requiring multiple factors."
        }
    ]
};

    startBtn.addEventListener('click', startQuiz);
    nextBtn.addEventListener('click', showNextQuestion);
    restartBtn.addEventListener('click', restartQuiz);

    function startQuiz() {
        const difficulty = difficultySelect.value;
        const questionCount = parseInt(questionCountSelect.value);
        
        questions = getQuestionsFromDatabase(difficulty, questionCount);
        
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = [];
        
        showScreen(quizScreen);
        totalQuestionsElement.textContent = questions.length;
        showQuestion();
    }

    function getQuestionsFromDatabase(difficulty, count) {
        const allQuestions = questionDatabase[difficulty] || [];
        return allQuestions.slice(0, Math.min(count, allQuestions.length));
    }

    function showScreen(screen) {
        welcomeScreen.classList.remove('active');
        quizScreen.classList.remove('active');
        resultScreen.classList.remove('active');
        
        screen.classList.add('active');
    }


    function showQuestion() {
        resetState();
        
        if (currentQuestionIndex >= questions.length) {
            showResults();
            return;
        }
        
        const currentQuestion = questions[currentQuestionIndex];
        
        currentQuestionElement.textContent = currentQuestionIndex + 1;
        questionElement.textContent = currentQuestion.question;
        
        currentQuestion.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.classList.add('option');
            button.addEventListener('click', () => selectAnswer(index));
            optionsElement.appendChild(button);
        });
        
        nextBtn.disabled = true;
        startTimer();
    }

    function resetState() {
        clearInterval(timer);
        timeLeft = 30;
        timeElement.textContent = timeLeft;
        
        while (optionsElement.firstChild) {
            optionsElement.removeChild(optionsElement.firstChild);
        }
    }

    function startTimer() {
        timer = setInterval(() => {
            timeLeft--;
            timeElement.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                handleTimeOut();
            }
        }, 1000);
    }

    function handleTimeOut() {
        const options = document.querySelectorAll('.option');
        options.forEach(option => {
            option.disabled = true;
        });
        
        const currentQuestion = questions[currentQuestionIndex];
        const correctIndex = currentQuestion.answer;
        options[correctIndex].classList.add('correct');
        
        userAnswers.push({
            question: currentQuestion.question,
            selected: null,
            correct: currentQuestion.answer,
            explanation: currentQuestion.explanation
        });
        
        nextBtn.disabled = false;
    }

    function selectAnswer(index) {
        clearInterval(timer);
        
        const currentQuestion = questions[currentQuestionIndex];
        const options = document.querySelectorAll('.option');
        const correctIndex = currentQuestion.answer;
        
        options.forEach(option => {
            option.disabled = true;
        });
        

        options[index].classList.add('selected');
        
        options[correctIndex].classList.add('correct');
        
        if (index !== correctIndex) {
            options[index].classList.add('incorrect');
        } else {
            score++;
        }
        

        userAnswers.push({
            question: currentQuestion.question,
            selected: index,
            correct: correctIndex,
            explanation: currentQuestion.explanation
        });
        
        nextBtn.disabled = false;
    }

    function showNextQuestion() {
        currentQuestionIndex++;
        showQuestion();
    }

    function showResults() {
        showScreen(resultScreen);
        scoreElement.textContent = score;
        maxScoreElement.textContent = questions.length;
        
        let feedbackHTML = '<h3>Question Review</h3><ol>';
        
        userAnswers.forEach((answer, index) => {
            const question = answer.question;
            const selected = answer.selected !== null ? 
                questions[index].options[answer.selected] : 'Time out (no answer)';
            const correct = questions[index].options[answer.correct];
            const explanation = answer.explanation;
            
            feedbackHTML += `
                <li>
                    <p><strong>Question:</strong> ${question}</p>
                    <p class="${answer.selected === answer.correct ? 'correct-text' : 'incorrect-text'}">
                        <strong>Your answer:</strong> ${selected}
                    </p>
                    <p><strong>Correct answer:</strong> ${correct}</p>
                    <p><strong>Explanation:</strong> ${explanation}</p>
                </li>
            `;
        });
        
        feedbackHTML += '</ol>';
        feedbackElement.innerHTML = feedbackHTML;
    }

    function restartQuiz() {
        showScreen(welcomeScreen);
    }
});