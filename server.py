from flask import Flask, render_template, request, jsonify, send_from_directory
import random
import os

app = Flask(__name__)

# Sample quotes data
quotes = {
    "short": [
        "The only way to do great work is to love what you do.",
        "Life is what happens when you're busy making other plans.",
        "The future belongs to those who believe in the beauty of their dreams.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "Believe you can and you're halfway there."
    ],
    "medium": [
        "Success is not final, failure is not fatal: It is the courage to continue that counts. The only limit to our realization of tomorrow is our doubts of today.",
        "Your time is limited, don't waste it living someone else's life. Don't be trapped by dogma, which is living the result of other people's thinking.",
        "The greatest glory in living lies not in never falling, but in rising every time we fall. The way to get started is to quit talking and begin doing.",
        "In the end, it's not the years in your life that count. It's the life in your years. The purpose of our lives is to be happy.",
        "Many of life's failures are people who did not realize how close they were to success when they gave up. Try not to become a person of success, but rather try to become a person of value."
    ],
    "long": [
        "The only person you are destined to become is the person you decide to be. Go confidently in the direction of your dreams! Live the life you've imagined. When you reach the end of your rope, tie a knot and hang on. Always remember that you are absolutely unique. Just like everyone else.",
        "Tell me and I forget. Teach me and I remember. Involve me and I learn. It does not matter how slowly you go as long as you do not stop. Our greatest weakness lies in giving up. The most certain way to succeed is always to try just one more time.",
        "Life is really simple, but we insist on making it complicated. The future depends on what you do today. Don't watch the clock; do what it does. Keep going. The best time to plant a tree was 20 years ago. The second best time is now.",
        "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do. So throw off the bowlines. Sail away from the safe harbor. Catch the trade winds in your sails. Explore. Dream. Discover.",
        "The two most important days in your life are the day you are born and the day you find out why. The difference between ordinary and extraordinary is that little extra. The best revenge is massive success."
    ]
}

# Common English words with difficulty levels
word_sets = {
    "easy": [
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
        'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
        'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
        'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
        'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me'
    ],
    "medium": [
        'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
        'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
        'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
        'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
        'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'
    ],
    "hard": [
        'experience', 'education', 'significant', 'development', 'government',
        'environment', 'community', 'technology', 'information', 'understanding',
        'management', 'international', 'organization', 'particularly', 'population',
        'university', 'successful', 'relationship', 'traditional', 'opportunity',
        'application', 'perspective', 'communication', 'conversation', 'administration',
        'establishment', 'responsibility', 'investigation', 'architecture', 'professional'
    ],
    "programming": [
        'function', 'variable', 'algorithm', 'parameter', 'interface',
        'database', 'framework', 'component', 'iteration', 'recursion',
        'inheritance', 'polymorphism', 'encapsulation', 'abstraction', 'middleware',
        'deployment', 'repository', 'dependency', 'optimization', 'refactoring',
        'asynchronous', 'synchronization', 'serialization', 'authentication', 'authorization',
        'implementation', 'documentation', 'architecture', 'integration', 'development'
    ]
}

# Code snippets for programming mode
code_snippets = [
    """function calculateFactorial(n) {
  if (n === 0 || n === 1) {
    return 1;
  }
  return n * calculateFactorial(n - 1);
}""",
    """def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)""",
    """public class BinarySearch {
    public static int search(int[] array, int target) {
        int left = 0;
        int right = array.length - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
            if (array[mid] == target) {
                return mid;
            }
            
            if (array[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return -1;
    }
}"""
]

@app.before_first_request
def create_directories():
    os.makedirs('static/sounds', exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

@app.route('/api/words', methods=['GET'])
def get_words():
    count = request.args.get('count', default=50, type=int)
    difficulty = request.args.get('difficulty', default='medium')
    
    if difficulty not in word_sets:
        difficulty = 'medium'
        
    words = []
    while len(words) < count:
        words.extend(random.sample(word_sets[difficulty], min(count - len(words), len(word_sets[difficulty]))))
    
    return jsonify(words)

@app.route('/api/quotes', methods=['GET'])
def get_quotes():
    length = request.args.get('length', default='medium')
    if length in quotes:
        quote = random.choice(quotes[length])
        return jsonify({"quote": quote})
    return jsonify({"error": "Invalid length parameter"}), 400

@app.route('/api/code', methods=['GET'])
def get_code():
    snippet = random.choice(code_snippets)
    return jsonify({"code": snippet})

if __name__ == '__main__':
    app.run(debug=True)