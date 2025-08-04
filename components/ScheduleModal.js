import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { createDeviceCalendarEvent } from '../utils/Calendar';

const { width, height } = Dimensions.get('window');

export default function ScheduleModal({ visible, onClose }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse animation for schedule button
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => pulseAnimation.stop();
    } else {
      // Exit animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleConfirm = (selectedDate) => {
    setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleSchedule = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    setIsScheduling(true);
    
    try {
      await createDeviceCalendarEvent(title.trim(), date.toISOString());
      setTitle('');
      Speech.speak(`Your event has been sheduled to ${date.toLocaleDateString()} `, {
        voice: "en-in-x-ene-network", 
        rate: 1.0,
        pitch: 1.0,
      });
      onClose();
    } catch (error) {
      Speech.speak(`Failed to create event. Please try again.`, {
        voice: "en-in-x-ene-network", 
        rate: 1.0,
        pitch: 1.0,
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const formatDateTime = (date) => {
    const options = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('en-US', options);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.8)" barStyle="light-content" />
      
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        <Animated.View 
          style={[
            styles.modalContainer,
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['#1A1A2E', '#16213E', '#0F172A']}
            style={styles.modalGradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <LinearGradient
                  colors={['#00F5FF', '#0091EA']}
                  style={styles.iconGradient}
                >
                  <Ionicons name="calendar" size={24} color="white" />
                </LinearGradient>
              </View>
              <Text style={styles.headerTitle}>Schedule Event</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={onClose}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* Title Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Event Title</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="text-outline" size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter event title..."
                    placeholderTextColor="#64748B"
                    maxLength={100}
                  />
                </View>
              </View>

              {/* Date & Time Picker */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Date & Time</Text>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setShowPicker(true)}
                >
                  <View style={styles.datePickerContent}>
                    <Ionicons name="time-outline" size={20} color="#00F5FF" />
                    <Text style={styles.dateText}>{formatDateTime(date)}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#64748B" />
                  </View>
                </TouchableOpacity>
              </View>

              <DateTimePickerModal
                isVisible={showPicker}
                mode="datetime"
                date={date}
                is24Hour={false}
                onConfirm={handleConfirm}
                onCancel={() => setShowPicker(false)}
                textColor="#000000"
              />

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <TouchableOpacity 
                    style={[styles.scheduleButton, isScheduling && styles.scheduleButtonDisabled]}
                    onPress={handleSchedule}
                    disabled={isScheduling}
                  >
                    <LinearGradient
                      colors={['#00F5FF', '#0091EA']}
                      style={styles.scheduleGradient}
                    >
                      {isScheduling ? (
                        <View style={styles.loadingContainer}>
                          <Animated.View 
                            style={[
                              styles.loadingSpinner,
                              { transform: [{ rotate: pulseAnim.interpolate({
                                inputRange: [1, 1.05],
                                outputRange: ['0deg', '360deg']
                              }) }] }
                            ]}
                          >
                            <Ionicons name="sync" size={20} color="white" />
                          </Animated.View>
                          <Text style={styles.scheduleButtonText}>Scheduling...</Text>
                        </View>
                      ) : (
                        <View style={styles.buttonContent}>
                          <Ionicons name="checkmark" size={20} color="white" />
                          <Text style={styles.scheduleButtonText}>Schedule</Text>
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>

            {/* Decorative Elements */}
            <View style={styles.decorativeElements}>
              <View style={[styles.decorativeDot, { backgroundColor: '#00F5FF', opacity: 0.3 }]} />
              <View style={[styles.decorativeDot, { backgroundColor: '#0091EA', opacity: 0.2 }]} />
              <View style={[styles.decorativeDot, { backgroundColor: '#3F51B5', opacity: 0.1 }]} />
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#00F5FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalGradient: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    height: '100%',
  },
  datePickerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
  },
  scheduleButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginLeft: 12,
  },
  scheduleButtonDisabled: {
    opacity: 0.7,
  },
  scheduleGradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingSpinner: {
    marginRight: 8,
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    paddingTop: 10,
    paddingRight: 10,
  },
  decorativeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
});