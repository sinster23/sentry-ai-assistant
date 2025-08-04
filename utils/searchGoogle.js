import { Linking } from 'react-native';

export function searchGoogle(query) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  Linking.openURL(url).catch((err) => {
      console.error("Failed to open Google:", err);
      return "Failed to perform Google search.";
    });
 return "Your task has been completed.";
}
