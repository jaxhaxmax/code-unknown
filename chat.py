from flask import Flask, request, jsonify
from flask_cors import CORS
from recommend import recommend_tips  

app = Flask(__name__)
CORS(app)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '').lower()

    
    if "recommend" in message or "tip" in message:
        
        input_data = {
            "device_hours": 6,
            "streaming_hours": 3,
            "emails_sent": 100,
            "transport_mode": "car",
            "energy_kwh": 7.5
        }
        result = recommend_tips(input_data)
        reply = f"💡 Your Green Score: {result['green_score']}/100\n{result['tip']}"
    else:
        reply = "🌱 I can give eco tips! Try saying 'give me a sustainability tip'."

    return jsonify({"reply": reply})

if __name__ == '__main__':
    app.run(debug=True)