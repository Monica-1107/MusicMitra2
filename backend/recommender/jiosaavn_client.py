import requests

BASE_URL = "http://localhost:3000/api"

def get_song_details(song_id: str):
    try:
        url = f"{BASE_URL}/songs"
        params = {"ids": song_id}   # ✅ FIX HERE

        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        song = data.get("data", [{}])[0]
        download_urls = song.get("downloadUrl", [])

        if download_urls:
            return download_urls[-1]["url"]  # 320kbps

        return ""

    except Exception as e:
        print("Song details error:", e)
        return ""


def get_songs_by_query(query: str, limit: int = 5):
    try:
        url = f"{BASE_URL}/search/songs"
        params = {
            "query": query,
            "limit": limit
        }

        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        results = data.get("data", {}).get("results", [])

        songs = []

        for song in results:
            song_id = song.get("id")

            # 🔥 SECOND API CALL
            audio_url = get_song_details(song_id)

            # image
            image = ""
            if isinstance(song.get("image"), list) and len(song["image"]) > 0:
                image = song["image"][-1].get("url", "")

            songs.append({
                "id": song_id,
                "name": song.get("name"),
                "artists": song.get("artists", []),
                "album": song.get("album", {}).get("name", "Unknown"),
                "image": image,
                "audio": audio_url,
                "url": song.get("url")
            })

        return songs

    except Exception as e:
        print("JioSaavn API Error:", e)
        return []
    
if __name__ == "__main__":
    songs = get_songs_by_query("happy telugu", 1)

    print("SONGS OUTPUT:")
    print(songs)

    if songs and songs[0]["audio"]:
        print("\nAUDIO URL:")
        print(songs[0]["audio"])
