import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Platform, 
  Linking, 
  Modal, 
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get('window');

const ShowMusicModal = ({ visible, onClose }) => {
  const [musicQuery, setMusicQuery] = useState('');

  const handleMusicSearch = async () => {
    if (!musicQuery.trim()) return;

    const query = encodeURIComponent(musicQuery.trim());
    const url = Platform.OS === 'android'
      ? `vnd.youtube://results?search_query=${query}`
      : `https://www.youtube.com/results?search_query=${query}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(`https://www.youtube.com/results?search_query=${query}`);
      }
    } catch (err) {
      console.warn("Failed to open YouTube", err);
      Speech.speak("Sorry, I can't find the result of your search", {
            voice: "en-in-x-ene-network", 
            rate: 1.0,
            pitch: 1.0,
        });
    }

    setMusicQuery('');
    onClose(); // Close the modal after search
   Speech.speak(`Here is the result of your search: ${musicQuery}`, {
         voice: "en-in-x-ene-network", 
         rate: 1.0,
         pitch: 1.0,
       });
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.musicModal}>
            <LinearGradient
              colors={['rgba(26, 26, 46, 0.98)', 'rgba(22, 33, 62, 0.98)']}
              style={styles.modalGradient}
            >
              {/* Close Button */}
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#8892B0" />
              </TouchableOpacity>

              <View style={styles.modalContent}>
                {/* Icon Container */}
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={['#9C27B0', '#E91E63']}
                    style={styles.iconGradient}
                  >
                    <Ionicons name="musical-notes" size={32} color="white" />
                  </LinearGradient>
                </View>

                {/* Title */}
                <Text style={styles.title}>Search Music</Text>
                <Text style={styles.subtitle}>Enter a song or artist name</Text>

                {/* Input Container */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="search" size={20} color="#8892B0" style={styles.searchIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., Blinding Lights, The Weeknd"
                      placeholderTextColor="#64748B"
                      value={musicQuery}
                      onChangeText={setMusicQuery}
                      autoFocus
                    />
                  </View>
                </View>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={[styles.button, styles.cancelButton]}
                    onPress={onClose}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.button, styles.playButton]}
                    onPress={handleMusicSearch}
                    activeOpacity={0.8}
                    disabled={!musicQuery.trim()}
                  >
                    <LinearGradient
                      colors={musicQuery.trim() ? ['#9C27B0', '#E91E63'] : ['#374151', '#4B5563']}
                      style={styles.buttonGradient}
                    >
                      <Ionicons 
                        name="play" 
                        size={18} 
                        color="white" 
                        style={styles.buttonIcon} 
                      />
                      <Text style={styles.playButtonText}>Play</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Quick Suggestions */}
                <View style={styles.suggestionsContainer}>
                  <Text style={styles.suggestionsTitle}>Quick Search:</Text>
                  <View style={styles.suggestionsRow}>
                    {['Pop Hits', 'Rock Classics', 'Chill Vibes'].map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionChip}
                        onPress={() => setMusicQuery(suggestion)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ShowMusicModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
  },
  musicModal: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalGradient: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  modalContent: {
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8892B0',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    paddingVertical: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 24,
  },
  button: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cancelButton: {
    marginRight: 8,
  },
  playButton: {
    marginLeft: 8,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderRadius: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  playButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  suggestionsTitle: {
    fontSize: 14,
    color: '#8892B0',
    marginBottom: 12,
    fontWeight: '500',
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  suggestionChip: {
    backgroundColor: 'rgba(156, 39, 176, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(156, 39, 176, 0.4)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  suggestionText: {
    color: '#9C27B0',
    fontSize: 12,
    fontWeight: '600',
  },
});