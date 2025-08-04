import { Linking } from 'react-native';

export function searchYouTube(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  Linking.openURL(url).catch((err) => {
      console.error("Failed to open YouTube:", err);
      return "Failed to perform YouTube search.";
    });
    return "Your task has been completed.";
}