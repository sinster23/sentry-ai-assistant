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
  Dimensions,
  Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { callContactByName } from '../utils/Contact';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get('window');

const CallContactModal = ({ visible, onClose }) => {
  const [contactName, setContactName] = useState('');

  const handleCall = async () => {
    let aiResponse='';
    if (!contactName.trim()) {
      Alert.alert('Error', 'Please enter a contact name');
      return;
    }

    const name = contactName.trim();
    
    try {
      Alert.alert(
        'Call Contact',
        `Would you like to call ${name}?\n\nNote: This would search your contacts and initiate the call.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Call', 
            onPress: async() => {
              aiResponse= await callContactByName(name);
               Speech.speak(aiResponse, {
            voice: "en-in-x-ene-network", 
            rate: 1.0,
            pitch: 1.0,
          });
              setContactName('');
              onClose();
            }
          }
        ]
      );
      
    } catch (err) {
      console.warn("Failed to initiate call", err);
      Speech.speak("Failed to initiate call. Please try again.", {
            voice: "en-in-x-ene-network", 
            rate: 1.0,
            pitch: 1.0,
          });
    }

  };

  const handleQuickContact = (name) => {
    setContactName(name);
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
          <View style={styles.callModal}>
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
                    colors={['#4CAF50', '#2E7D32']}
                    style={styles.iconGradient}
                  >
                    <Ionicons name="call" size={32} color="white" />
                  </LinearGradient>
                </View>

                {/* Title */}
                <Text style={styles.title}>Call Contact</Text>
                <Text style={styles.subtitle}>Enter the name of the contact you want to call</Text>

                {/* Input Container */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="person" size={20} color="#8892B0" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., John Doe, Mom, Sarah"
                      placeholderTextColor="#64748B"
                      value={contactName}
                      onChangeText={setContactName}
                      autoFocus
                      autoCapitalize="words"
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
                    style={[styles.button, styles.callButton]}
                    onPress={handleCall}
                    activeOpacity={0.8}
                    disabled={!contactName.trim()}
                  >
                    <LinearGradient
                      colors={contactName.trim() ? ['#4CAF50', '#2E7D32'] : ['#374151', '#4B5563']}
                      style={styles.buttonGradient}
                    >
                      <Ionicons 
                        name="call" 
                        size={18} 
                        color="white" 
                        style={styles.buttonIcon} 
                      />
                      <Text style={styles.callButtonText}>Call Now</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Quick Contacts */}
                <View style={styles.quickContactsContainer}>
                  <Text style={styles.quickContactsTitle}>Quick Call:</Text>
                  <View style={styles.quickContactsRow}>
                    {['Mom', 'Dad', 'Emergency'].map((contact, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.quickContactChip}
                        onPress={() => handleQuickContact(contact)}
                        activeOpacity={0.7}
                      >
                        <Ionicons 
                          name={contact === 'Emergency' ? 'medical' : 'person'} 
                          size={12} 
                          color="#4CAF50" 
                          style={styles.chipIcon}
                        />
                        <Text style={styles.quickContactText}>{contact}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Recent Calls Hint */}
                <View style={styles.hintContainer}>
                  <Ionicons name="information-circle-outline" size={16} color="#64748B" />
                  <Text style={styles.hintText}>
                    Searches your contacts by name to make the call
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CallContactModal;

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
  callModal: {
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
    shadowColor: '#4CAF50',
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
  inputIcon: {
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
  callButton: {
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
  callButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  quickContactsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  quickContactsTitle: {
    fontSize: 14,
    color: '#8892B0',
    marginBottom: 12,
    fontWeight: '500',
  },
  quickContactsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  quickContactChip: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.4)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipIcon: {
    marginRight: 6,
  },
  quickContactText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
  },
  hintText: {
    color: '#64748B',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});