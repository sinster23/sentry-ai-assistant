import * as Contacts from 'expo-contacts';
import { Linking, Alert } from 'react-native';

export const callContactByName = async (name) => {
  try {
    // Ask for permission
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Can't access contacts");
      return;
    }

    // Fetch contacts
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });

    if (data.length === 0) {
      return "No contacts found.";
      return;
    }

    // Search for name (case-insensitive)
    const match = data.find(c =>
      c.name?.toLowerCase().includes(name.toLowerCase()) &&
      c.phoneNumbers && c.phoneNumbers.length > 0
    );

    if (!match) {
      return `Error calling contact. No contact found matching "${name}".`;
    }

    // Get first phone number
    const phoneNumber = match.phoneNumbers[0].number;

    // Open dialer
    const phoneUrl = `tel:${phoneNumber}`;
    const supported = await Linking.canOpenURL(phoneUrl);
    if (supported) {
      await Linking.openURL(phoneUrl);
    } else {
      return "Can't make call. Phone dialer not supported.";
    }
  } catch (err) {
    console.error("Error calling contact:", err);
    return "Error calling contact. Please try again.";
  }
  return `Contact ${name} has been called.`;
};
