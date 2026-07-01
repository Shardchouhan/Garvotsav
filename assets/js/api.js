/**
 * Garvotsav Tuition Classes - API Service
 * Handles data fetching from Google Apps Script Backend
 */

// TODO: Replace with your deployed Google Apps Script Web App URL
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzncshXVTws9j4s5MaAeFwZGe8lYLOKPPlDqGWgaO0wn-UjuldbfOnCZGTlwjr0QrA/exec";
const USE_MOCK_DATA = false; // Set to false when connecting real backend

const MockData = {
    courses: [
        { grade: 'Grade 8', subject: 'Mathematics', desc: 'Build a strong foundation in algebra, geometry, and arithmetic with step-by-step teaching and regular practice.', duration: '1 Year', image: 'assets/images/class8mathematics.png' },
        { grade: 'Grade 8', subject: 'Science', desc: 'Understand Physics, Chemistry, and Biology through clear explanations, diagrams, and hands-on learning.', duration: '1 Year', image: 'assets/images/class8science.png' },
        { grade: 'Grade 9', subject: 'Mathematics', desc: 'Master advanced topics with focused problem-solving sessions that prepare you for higher classes and board exams.', duration: '1 Year', image: 'assets/images/class9mathematics.png' },
        { grade: 'Grade 9', subject: 'Science', desc: 'In-depth coverage of Physics, Chemistry, and Biology with emphasis on concepts, diagrams, and numericals.', duration: '1 Year', image: 'assets/images/class9science.png' },
        { grade: 'Grade 10', subject: 'Mathematics', desc: 'Board-focused preparation with rigorous practice, past paper solving, and strategies to score top marks.', duration: '1 Year', image: 'assets/images/class10mathematics.png' },
        { grade: 'Grade 10', subject: 'Science', desc: 'Complete board exam preparation covering theory, diagrams, and numericals across all three science subjects.', duration: '1 Year', image: 'assets/images/clss10science.png' }
    ],
    testimonials: [
        { name: 'Rahul Sharma', parent: 'Mr. Arvind Sharma', class: 'Grade 10', text: 'Garvotsav changed my perspective on Math. The teachers are incredibly supportive!', rating: 5, img: 'https://randomuser.me/api/portraits/men/32.jpg' },
        { name: 'Priya Patel', parent: 'Mrs. Sunita Patel', class: 'Grade 9', text: 'The mock tests here prepared me so well for my finals. Highly recommend!', rating: 5, img: 'https://randomuser.me/api/portraits/women/44.jpg' },
        { name: 'Amit Kumar', parent: 'Mr. Rajesh Kumar', class: 'Grade 8', text: 'Science practicals and concept clarity is unmatched.', rating: 5, img: 'https://randomuser.me/api/portraits/men/46.jpg' }
    ],
    teachers: [
        { 
            name: 'Sh. Devichand Chouhan', 
            subject: 'Science', 
            exp: '17+ Years', 
            img: '../assets/images/Science.jpeg',
            title: 'Unlock the World of Science.',
            desc: 'Science is everywhere. We create a learning environment where concepts come alive through practicals, experiments, and real-world examples. Here, students do not just memorise — they understand, apply, and grow.'
        },
        { 
            name: 'Sh. Dashrath Kanojia', 
            subject: 'Mathematics', 
            exp: '21+ Years', 
            img: '../assets/images/Mathematics.jpeg',
            title: 'Unlock Your Mathematical Potential',
            desc: 'Mathematics is not just about numbers — it is about understanding. We focus on building a rock-solid foundation, breaking down complex ideas into simple steps, and helping every student solve problems with confidence.'
        }
    ],
    faqs: [
        { q: 'How do I apply?', a: 'You can apply by filling out the registration page on our website or visiting our center.' },
        { q: 'What is the batch size?', a: 'We maintain a small batch size of maximum 20 students to ensure personal attention.' },
        { q: 'Do you provide study materials?', a: 'Yes, comprehensive notes, formula sheets, and mock tests are provided to all students.' },
        { q: 'Are there demo classes available?', a: 'Yes, we offer 2 free demo classes before you finalize your admission.' }
    ]
};

const GarvotsavAPI = {
    async fetchSheetData(sheetName) {
        if (USE_MOCK_DATA) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(MockData[sheetName.toLowerCase()] || []);
                }, 800); // Simulate network delay
            });
        }

        try {
            const response = await fetch(`${APPS_SCRIPT_URL}?action=getData&sheet=${sheetName}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) return data;
            return MockData[sheetName.toLowerCase()] || [];
        } catch (error) {
            console.error(`Error fetching ${sheetName}:`, error);
            return MockData[sheetName.toLowerCase()] || [];
        }
    },

    async submitForm(formType, formData) {
        if (USE_MOCK_DATA) {
            return new Promise(resolve => {
                setTimeout(() => resolve({ success: true, message: "Mock submission successful" }), 1500);
            });
        }

        try {
            // Using URLSearchParams for simpler POST to Apps Script without CORS preflight issues
            const data = new URLSearchParams();
            data.append('action', formType);
            for (const [key, value] of formData.entries()) {
                data.append(key, value);
            }

            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                body: data,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            return await response.json();
        } catch (error) {
            console.error(`Error submitting form ${formType}:`, error);
            return { success: false, message: error.message };
        }
    }
};
