from fastapi import APIRouter
from pydantic import BaseModel
import torch
from torch.nn.functional import softmax
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import random

from recommender.jiosaavn_client import get_songs_by_query

router = APIRouter()

# ==================================================
# MODEL SETUP
# ==================================================

MODEL_PATH = "./model/musicmitra_emotion_model"

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()

emotion_labels = [
    "happy",
    "sad",
    "calm",
    "romantic",
    "energetic",
    "angry",
    "neutral"
]

# ==================================================
# REQUEST SCHEMA
# ==================================================

class ChatRequest(BaseModel):
    message: str

# ==================================================
# CONVERSATION RESPONSES
# ==================================================

GREETINGS = [
    "Hi! I'm Music Mitra 🎧 How are you feeling today?",
    "Hey! Tell me your mood and I’ll find songs for you 🎶",
    "Hello! What kind of vibe are you in right now?"
]

HOW_ARE_YOU = [
    "I'm feeling musical today 😄 What about you?",
    "Doing great! Want songs that match your mood?",
]

EMOTION_RESPONSES = {
    "happy": [
        "You sound happy! 😄 Let’s keep the good vibes going!",
        "That happiness is contagious 🎉 Here are some songs!"
    ],
    "sad": [
        "I sense a little sadness 😔 Music can help.",
        "It’s okay to feel low sometimes. Let’s listen together."
    ],
    "calm": [
        "You seem calm and relaxed 🌿",
        "Peaceful vibes detected. Here’s some soothing music."
    ],
    "romantic": [
        "Romantic mood, huh? 💕 Let’s make it special.",
        "Love is in the air 💖 Here are some melodies."
    ],
    "energetic": [
        "You’re full of energy! 🔥 Let’s boost it!",
        "High-energy vibes ⚡ Time for bangers!"
    ],
    "angry": [
        "I sense some anger 😤 Music might help release it.",
        "Let’s channel that energy with powerful tracks."
    ],
    "neutral": [
        "Feeling neutral? No worries 🙂 Let’s find something nice."
    ]
}

# ==================================================
# WHY THIS SONG EXPLANATIONS
# ==================================================

WHY_THIS_SONG = {
    "happy": [
        "This song has upbeat rhythms and positive energy that match your happy mood 😄",
        "A feel-good track to keep your cheerful vibes going 🌈"
    ],
    "sad": [
        "This song resonates with emotional depth that helps you feel understood 💙",
        "A comforting melody to accompany your feelings 😔"
    ],
    "calm": [
        "Soft tunes and soothing rhythms make this perfect for a calm mood 🌿",
        "A peaceful track to help you relax and unwind 🧘"
    ],
    "romantic": [
        "This song carries romantic melodies and heartfelt emotions 💕",
        "Perfect for moments filled with love 💖"
    ],
    "energetic": [
        "High-energy beats to match your energetic vibe ⚡",
        "A powerful track to keep your momentum going 🔥"
    ],
    "angry": [
        "Strong beats to help channel intense emotions 😤",
        "An intense song to release pent-up energy 💥"
    ],
    "neutral": [
        "A balanced track suitable for a relaxed mood 🙂",
        "Easy-going music that feels just right 🎶"
    ]
}

# ==================================================
# SONG DESCRIPTIONS
# ==================================================

SONG_DESCRIPTIONS = {
    "happy": [
        "“{song}” by {artist} is an upbeat Telugu song filled with positive energy and cheerful vibes.",
        "A lively track by {artist} that brings joy with bright tunes and a happy rhythm."
    ],
    "sad": [
        "“{song}” by {artist} is an emotional track with soulful melodies and deep feelings.",
        "A heartfelt song that resonates with moments of sadness and reflection."
    ],
    "calm": [
        "A soothing Telugu song by {artist} with gentle music and peaceful vibes.",
        "Soft melodies and slow rhythm make this song deeply relaxing."
    ],
    "romantic": [
        "A romantic Telugu melody by {artist} that expresses love beautifully.",
        "“{song}” is filled with heartfelt emotions and romantic warmth."
    ],
    "energetic": [
        "A high-energy song by {artist} packed with powerful beats and excitement.",
        "This track pumps adrenaline and boosts enthusiasm instantly."
    ],
    "angry": [
        "A powerful song by {artist} with intense beats that help release emotions.",
        "Bold music that matches moments of frustration or anger."
    ],
    "neutral": [
        "A pleasant Telugu song by {artist} suitable for any relaxed moment.",
        "A balanced and easy-going track you can enjoy anytime."
    ]
}

def generate_song_description(song, mood):
    title = song.get("name", "This song")
    artist = song.get("artist", "the artist")
    template = random.choice(SONG_DESCRIPTIONS[mood])
    return template.format(song=title, artist=artist)

# ==================================================
# EMOJI → MOOD MAP
# ==================================================

EMOJI_MOOD_MAP = {
    "😄": "happy", "😊": "happy", "😁": "happy",
    "😢": "sad", "😭": "sad", "😔": "sad",
    "😌": "calm", "🧘": "calm", "🌿": "calm",
    "❤️": "romantic", "😍": "romantic", "💖": "romantic",
    "⚡": "energetic", "🔥": "energetic", "💪": "energetic",
    "😡": "angry", "😤": "angry",
    "😐": "neutral"
}

# ==================================================
# CHAT ENDPOINT
# ==================================================

@router.post("/chat")
def chat(request: ChatRequest):
    text = request.message.strip().lower()

    # ---------- GREETINGS ----------
    if any(word in text for word in ["hi", "hello", "hey"]):
        return {
            "success": True,
            "bot_message": random.choice(GREETINGS),
            "songs": []
        }

    if "how are you" in text:
        return {
            "success": True,
            "bot_message": random.choice(HOW_ARE_YOU),
            "songs": []
        }

    # ---------- EMOJI PRIORITY ----------
    for emoji, mood in EMOJI_MOOD_MAP.items():
        if emoji in text:
            all_songs = get_songs_by_query(f"{mood} telugu songs", limit=20)  # fetch more
            songs = random.sample(all_songs, min(5, len(all_songs)))  # pick 5 random songs


            for song in songs:
                song["why_this_song"] = random.choice(WHY_THIS_SONG[mood])
                song["description"] = generate_song_description(song, mood)

            return {
                "success": True,
                "bot_message": f"I see that mood {emoji}! Let me find the perfect songs 🎶",
                "detected_mood": mood,
                "source": "emoji",
                "songs": songs
            }

    # ---------- ML EMOTION DETECTION ----------
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)

    with torch.no_grad():
        outputs = model(**inputs)

    probs = softmax(outputs.logits, dim=1)[0].tolist()

    emotion_scores = {
        emotion_labels[i]: round(probs[i], 4)
        for i in range(len(emotion_labels))
    }

    sorted_emotions = sorted(
        emotion_scores.items(),
        key=lambda x: x[1],
        reverse=True
    )

    top_emotion, top_score = sorted_emotions[0]
    second_emotion, second_score = sorted_emotions[1]

    # ---------- MIXED MOOD LOGIC ----------
    is_mixed = top_score < 0.6 and second_score > 0.25

    if is_mixed:
        bot_message = (
            f"I sense a mix of {top_emotion} and {second_emotion} moods 🤔 "
            f"Let’s find songs that balance both."
        )
        moods = [top_emotion, second_emotion]
    else:
        bot_message = random.choice(EMOTION_RESPONSES[top_emotion])
        moods = [top_emotion]

    # ---------- FETCH SONGS ----------
    songs = []
    for mood in moods:
        all_songs = get_songs_by_query(f"{mood} telugu songs", limit=20)  # fetch more
        sampled_songs = random.sample(all_songs, min(5, len(all_songs)))  # random pick
        songs.extend(sampled_songs)

    # Remove duplicates
    seen = set()
    unique_songs = []
    for song in songs:
        if song["id"] not in seen:
            seen.add(song["id"])
            unique_songs.append(song)

    songs = unique_songs[:5]

    # Attach explanation + description
    for song in songs:
        song["why_this_song"] = random.choice(WHY_THIS_SONG[top_emotion])
        song["description"] = generate_song_description(song, top_emotion)

    return {
        "success": True,
        "bot_message": bot_message,
        "detected_mood": top_emotion,
        "emotion_scores": emotion_scores,
        "source": "ml",
        "songs": songs
    }
