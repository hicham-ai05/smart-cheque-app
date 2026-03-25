import { YoutubeTranscript } from 'youtube-transcript';

YoutubeTranscript.fetchTranscript('EUstAnAAEfI', { lang: 'fr' })
  .then(transcript => {
    console.log(transcript.map(t => t.text).join(' '));
  })
  .catch(err => {
    // try fallback without lang
    YoutubeTranscript.fetchTranscript('EUstAnAAEfI')
      .then(transcript => {
        console.log(transcript.map(t => t.text).join(' '));
      })
      .catch(console.error);
  });
