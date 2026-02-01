EMOTION_TO_TAGS = {
    "sad": ["sad telugu songs", "emotional telugu"],
    "happy": ["feel good telugu", "happy telugu songs"],
    "calm": ["melody telugu", "peaceful telugu"],
    "romantic": ["romantic telugu songs"],
    "energetic": ["mass telugu", "party telugu"],
    "angry": ["motivation telugu", "intense telugu"],
    "neutral": ["trending telugu songs"]
}

def get_active_moods(emotion_probs, threshold=0.1):
    return {k:v for k,v in emotion_probs.items() if v >= threshold}

def get_search_queries(active_moods):
    queries = []
    for emotion in active_moods:
        queries += EMOTION_TO_TAGS.get(emotion, [])
    return list(set(queries))
