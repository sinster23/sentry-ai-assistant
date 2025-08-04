import React, { useState, useRef, useEffect } from 'react';
import { IP_ADDRESS } from '@env'; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  ScrollView,
  TextInput,
  Keyboard,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase'; 
import { openApp } from '../utils/openApp';
import { searchYouTube } from '../utils/searchYt'; 
import { searchGoogle } from '../utils/searchGoogle';
import { takePhoto } from '../utils/takePhoto'; 
import { createDeviceCalendarEvent } from '../utils/Calendar';
import ScheduleModal from '../components/ScheduleModal'; 
import { getWeatherByCity } from '../utils/weather';
import { getUserCity } from '../components/location';
import ShowMusicModal from '../components/MusicModal';
import { callContactByName } from '../utils/Contact';
import CallContactModal from '../components/CallContact';

const { width, height } = Dimensions.get('window');

export default function Home() {
  const [userSpeech, setUserSpeech] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const insets = useSafeAreaInsets();
  const [chat, setChat] = useState([]);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  function extractNameFromEmail(email) {
  const localPart = email.split('@')[0];
  const cleaned = localPart.replace(/[0-9]/g, '');
  const parts = cleaned.split(/[._-]/);

  const capitalized = parts.map(
    part => part.charAt(0).toUpperCase() + part.slice(1)
  );

  return capitalized.join(' ');
  }

  onAuthStateChanged(auth, (user) => {
  if (user) {
    const email = user.email;
    const name = extractNameFromEmail(email);
      AsyncStorage.setItem("userName", name)
  }
});

  const greeted = useRef(false);

  const handleSignOut = () => {
    setShowLogoutConfirm(true);
  };



  const confirmSignOut = async () => {
    try {
      await signOut(auth);
      setShowLogoutConfirm(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
      console.error('Sign out error:', error);
    }
  };

const handleQuickAction = async(action) => {
  if (action.label === 'Schedule') {
    setShowScheduleModal(true);
  }
  if (action.label === 'Weather') {
    let aiResponse= '';
    const userCity = await getUserCity();
    aiResponse= await getWeatherByCity(userCity);
    Speech.speak(aiResponse, {
      voice: "en-in-x-ene-network", 
      rate: 1.0,
      pitch: 1.0,
    });
  }
   if (action.label === 'Music') {
    setShowMusicModal(true); 
  }
  if (action.label === 'Call Contact') {
    setShowContactModal(true); 
  }
};

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  useEffect(() => {
    // Continuous pulse animation for the mic button
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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

    // Wave animation for listening state
    const waveAnimation = Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    // Glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    waveAnimation.start();
    glowAnimation.start();

    return () => {
      pulseAnimation.stop();
      waveAnimation.stop();
      glowAnimation.stop();
    };
  }, []);

  const handleSendMessage = async () => {
      Keyboard.dismiss();
      if (!inputText.trim()) return;
      
      const userMsg = inputText.trim();
      setInputText('');
      setUserSpeech(userMsg);

    const aiResponse = await getAIResponse(userMsg);

    setChat((prev) => [...prev, { from: "ai", text: aiResponse }]);
    setAiResponse(aiResponse);

    // Speak the AI's response
    Speech.speak(aiResponse, {
      voice: "en-in-x-ene-network", 
      rate: 1.0,
      pitch: 1.0,
    });
  };
const getAIResponse = async (msg) => {
  const name= await AsyncStorage.getItem("userName");
  try {
    const response = await fetch(`http://10.5.15.219:3000/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, name: name || 'User'}),
    });

    const data = await response.json();
    const reply = data.reply;

    try {
      let cleaned = reply.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/```[a-zA-Z]*\n?/, "").replace(/```$/, "");
      }

      const commandObj = JSON.parse(cleaned);
      console.log(commandObj);
      return handleAssistantCommand(commandObj);
    } catch (err) {
      return reply;
    }

  } catch (err) {
    console.error("Failed to contact Gemini backend:", err);
    return "Error contacting AI.";
  }
};

function handleAssistantCommand(commandObj) {
  const { command, args } = commandObj;
  switch (command) {
    // case "setReminder":
    //   setReminder(args.text, args.time);
    //   break;
    case "openApp":
      return openApp(args.appName);
    case "searchYouTube":
      return searchYouTube(args.query);
    case "webSearch":
      return searchGoogle(args.query);
    case "takePhoto":
      return takePhoto();
    case "createSchedule":
      const eventText = args.event || args.description || args.text || args.type || "";
      const eventDate = args.date || args.time || "";
      return createDeviceCalendarEvent(eventText, eventDate);
    case "getweather":
      return getWeatherByCity(args.city);  
    case "callContact":
      return callContactByName(args.name);
    // case "saveNote":
    //   saveNote(args.text);
    //   break;
    default:
      console.warn("Unknown command");
  }
}

  const quickActions = [
    { icon: 'call-outline', label: 'Call Contact', color: '#FFB800' },
    { icon: 'calendar-outline', label: 'Schedule', color: '#00BCD4' },
    { icon: 'cloud-outline', label: 'Weather', color: '#4CAF50' },
    { icon: 'musical-notes-outline', label: 'Music', color: '#9C27B0' },
  ];

  function getTimeBasedGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  else if (hour < 17) return "Good afternoon";
  else return "Good evening";
}

 useEffect(() => {
      const greetUser = async () => {
      if (!greeted.current) {
        greeted.current = true;

        const greeting = getTimeBasedGreeting();
        const name = await AsyncStorage.getItem("userName");

        Speech.speak(`${greeting} ${name || ''}, I'm Sentry. How can I help you today?`, {
          voice: "en-in-x-ene-network",
          rate: 1.0,
          pitch: 1.0,
        });
      }
    };
    greetUser();

  }, []);



  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />
      
      <LinearGradient
        colors={['#0A0A0F', '#1A1A2E', '#16213E']}
        style={styles.gradient}
      >
        {/* Sign Out Button */}
        <TouchableOpacity 
          style={[styles.signOutButton, { top: insets.top + 10 }]}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
        </TouchableOpacity>

        <ScrollView 
          contentContainerStyle={[
            styles.scrollContainer, 
            { paddingBottom: (keyboardHeight > 0 ? keyboardHeight + 120 : 100) + insets.bottom }
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!showLogoutConfirm}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.statusIndicator}>
              <Animated.View 
                style={[
                  styles.statusDot,
                  { opacity: glowAnim }
                ]} 
              />
              <Text style={styles.statusText}>Sentry is ONLINE</Text>
            </View>
            
            <Text style={styles.greeting}>{getTimeBasedGreeting()}</Text>
            <Text style={styles.subGreeting}>How can I assist you today?</Text>
          </View>

          {/* Central AI Visualization */}
          <View style={styles.aiVisualization}>
            <Animated.View 
              style={[
                styles.outerRing,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
                 <Image source={require('../assets/logo1.png')} style={{ width: 130, height: 130 }} />
            </Animated.View>

            {/* Animated waves */}
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.wave,
                  {
                    opacity: waveAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 0],
                    }),
                    transform: [
                      {
                        scale: waveAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 2 + index * 0.5],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>

          {/* Conversation Display */}
          <View style={styles.conversationContainer}>
            <View style={styles.messageContainer}>
              <View style={styles.userMessage}>
                <Ionicons style={{marginTop: 10}} name="person-circle" size={24} color="#00F5FF" />
                <View style={styles.messageBubble}>
                  <Text style={styles.messageText}>
                    {userSpeech || 'Type a message to get started...'}
                  </Text>
                </View>
              </View>

              {aiResponse ? (
                <View style={styles.aiMessage}>
                  <View style={[styles.messageBubble, styles.aiMessageBubble]}>
                    <Text style={styles.messageText}>{aiResponse}</Text>
                  </View>
                    <View style={styles.aiAvatar}>
                    <LinearGradient
                      colors={['#00F5FF', '#0091EA']}
                      style={styles.avatarGradient}
                    >
                      <Ionicons name="hardware-chip" size={20} color="white" />
                    </LinearGradient>
                  </View>
                </View>
              ) : null}
            </View>
          </View>

          <ScheduleModal visible={showScheduleModal} onClose={() => setShowScheduleModal(false)} />
          <ShowMusicModal visible={showMusicModal}onClose={() => setShowMusicModal(false)}/>
          <CallContactModal visible={showContactModal} onClose={() => setShowContactModal(false)}/>
          
          {/* Logout Confirmation Modal */}
          {showLogoutConfirm && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.logoutModal}>
                  <LinearGradient
                    colors={['rgba(26, 26, 46, 0.95)', 'rgba(22, 33, 62, 0.95)']}
                    style={styles.modalGradient}
                  >
                    <View style={styles.modalContent}>
                      <Text style={styles.modalTitle}>Sign Out</Text>
                      <Text style={styles.modalMessage}>Are you sure you want to sign out?</Text>
                      
                      <View style={styles.modalButtons}>
                        <TouchableOpacity 
                          style={styles.cancelButton}
                          onPress={() => setShowLogoutConfirm(false)}
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
                          style={styles.confirmButton}
                          onPress={confirmSignOut}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={['#FF6B6B', '#FF4757']}
                            style={styles.buttonGradient}
                          >
                            <Text style={styles.confirmButtonText}>Sign Out</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              </View>
            </View>
          )}
          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              {quickActions.map((action, index) => (
                <TouchableOpacity key={index} style={styles.actionItem} onPress={() => handleQuickAction(action)}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={styles.actionGradient}
                  >
                    <Ionicons 
                      name={action.icon} 
                      size={24} 
                      color={action.color} 
                    />
                    <Text style={styles.actionLabel}>{action.label}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Input Section */}
        <View style={[
          styles.inputSection, 
          { 
            paddingBottom: insets.bottom + 16,
            bottom: keyboardHeight > 0 ? keyboardHeight + 20 : 0
          }
        ]}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor="#64748B"
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isProcessing}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={inputText.trim() ? ['#00F5FF', '#0091EA'] : ['#374151', '#4B5563']}
                style={styles.sendGradient}
              >
                {isProcessing ? (
                  <Animated.View 
                    style={[
                      styles.processingIcon,
                      { transform: [{ rotate: pulseAnim.interpolate({
                        inputRange: [1, 1.1],
                        outputRange: ['0deg', '360deg']
                      }) }] }
                    ]}
                  >
                    <Ionicons name="sync" size={20} color="white" />
                  </Animated.View>
                ) : (
                  <Ionicons 
                    name="send" 
                    size={20} 
                    color="white" 
                  />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  signOutButton: {
    position: 'absolute',
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00F5FF',
    marginRight: 8,
  },
  statusText: {
    color: '#00F5FF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subGreeting: {
    fontSize: 16,
    color: '#8892B0',
    textAlign: 'center',
  },
  aiVisualization: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginBottom: 40,
  },
  outerRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  ringGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    padding: 3,
  },
  innerRing: {
    flex: 1,
    borderRadius: 57,
    padding: 3,
  },
  centerCore: {
    flex: 1,
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#00F5FF',
  },
  conversationContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  messageContainer: {
    minHeight: 100,
  },
  userMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  aiMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    order: 2,
    marginTop: 5
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginLeft: 12,
    maxWidth: width * 0.7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  aiMessageBubble: {
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    borderColor: 'rgba(0, 245, 255, 0.2)',
    marginLeft: 0,
    marginRight: 12,
    order: 1,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: (width - 60) / 2,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  micContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    borderRadius: 35,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#00F5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  micGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#00F5FF',
    borderRadius: 50,
  },
  micRing1: {
    width: 90,
    height: 90,
  },
  micRing2: {
    width: 110,
    height: 110,
  },
  inputSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
    paddingRight: 12,
  },
  sendButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 2000,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoutModal: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalGradient: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalContent: {
    padding: 30,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#8892B0',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  confirmButton: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});