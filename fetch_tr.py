import sys
from youtube_transcript_api import YouTubeTranscriptApi

try:
    transcript = YouTubeTranscriptApi.get_transcript('EUstAnAAEfI', languages=['fr', 'ar', 'en'])
    text = " ".join([i['text'] for i in transcript])
    print(text)
except Exception as e:
    print(f"Error fetching transcript: {e}")
