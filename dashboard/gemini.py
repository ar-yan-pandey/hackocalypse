from flask import Flask, jsonify, request
import google.generativeai as genai
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configure the Gemini API
genai.configure(api_key="AIzaSyBNAd6QgoHupSm9aYnwqF6xtXRnQJaM1cQ")
model = genai.GenerativeModel('gemini-1.5-pro')

@app.route('/generate', methods=['GET'])
def generate_content():
    try:
        prompt = "Give a basic music therapy plan."
        response = model.generate_content(prompt)
        print(response.text)
        return jsonify({"response": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/music-therapy', methods=['POST'])
def generate_music_therapy():
    try:
        # Get user profile data from request
        profile = request.json
        
        # Create personalized prompt using the profile data
        prompt = f"""I am a {profile.get('gender')} and i am {profile.get('age')} years old. 
My anxiety level is {profile.get('anxiety')} with {profile.get('depression')} depression symptoms, 
and i usually have {profile.get('sleep')} sleep quality. I have {profile.get('chronicPain', {}).get('hasPain', 'no')} chronic pain. 
I also have {profile.get('ptsd')} ptsd symptoms and {profile.get('adhd')} adhd issues and {profile.get('stress')} stress level. 
i do exercise {profile.get('exercise')} and i have {profile.get('diet')} diet quality with a daily screen time of {profile.get('screenTime')} hours 
with {profile.get('social')} social interaction frequency.

Kindly suggest me a music therapy plan based on the template below
Time of Day\tType of Music\tPurpose
Morning (7:00 AM)\tCalm, instrumental music (e.g., soft piano or flute)\tTo promote relaxation and set a positive tone for the day.
Afternoon (1:00 PM)\tUplifting classical tunes or acoustic guitar melodies\tTo enhance mood and focus during mid-day activities.
Evening (6:30 PM)\tLo-fi beats or rhythmic soft jazz\tTo unwind and reduce residual stress after a busy day.
Night (9:00 PM)\tAmbient sounds or binaural beats with slow, steady tempos\tTo prepare the mind and body for restful sleep and reduce insomnia.
Weekend Special\tUser's favorite genre with emotional resonance (e.g., soft rock)\tTo provide emotional catharsis and enhance creativity.

Please provide a personalized plan following exactly the same format but with recommendations tailored to my specific conditions.
Make sure to keep the table format with Time of Day, Type of Music, and Purpose columns.
Focus especially on addressing my anxiety ({profile.get('anxiety')}), depression ({profile.get('depression')}), and sleep quality ({profile.get('sleep')}).
The response should be tab-separated and maintain the exact same format as the template above.
"""
        
        response = model.generate_content(prompt)
        
        # Process the response to ensure it's in table format
        response_text = response.text.strip()
        
        # Split the response into lines and format as a table
        lines = response_text.split('\n')
        table_data = []
        
        for line in lines:
            if '\t' in line:  # Only process lines that are part of the table
                cells = line.split('\t')
                if len(cells) == 3:  
                    table_data.append({
                        "timeOfDay": cells[0].strip(),
                        "musicType": cells[1].strip(),
                        "purpose": cells[2].strip()
                    })
        
        return jsonify({
            "response": response_text,
            "table": table_data
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)