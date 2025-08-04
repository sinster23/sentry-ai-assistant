import * as Calendar from 'expo-calendar';
import { Alert, Platform } from 'react-native';

export async function createDeviceCalendarEvent(title, isoDateString) {
  const startDate = new Date(isoDateString);

  if (isNaN(startDate.getTime())) {
    console.error("❌ Invalid date format:", isoDateString);
    return "Invalid date format. Please provide a valid date.";
  }

  const endDate = new Date(startDate.getTime() + 30 * 60 * 1000); // +30 mins

  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Calendar access is required.');
      return;
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const defaultCalendar = calendars.find(cal => cal.allowsModifications);

    if (!defaultCalendar) {
      Alert.alert('No calendar found that allows modifications.');
      return "No calendar found that allows modifications.";
      return;
    }

    await Calendar.createEventAsync(defaultCalendar.id, {
      title,
      startDate,
      endDate,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      location: 'Assistant App',
    });

    return "Task completed successfully.";
  } catch (err) {
    console.error('Error creating calendar event:', err);
    return "Failed to create calendar event. Please try again.";
  }
}

