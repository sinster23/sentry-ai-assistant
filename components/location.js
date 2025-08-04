import * as Location from 'expo-location';

const getUserCity = async () => {
  try {
    // Ask for permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    // Get GPS location
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    // Reverse geocode to get city
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
    const data = await res.json();

    const city = data.city || data.locality || data.principalSubdivision;
    return city;

  } catch (error) {
    console.error('Error getting user city:', error);
    return null;
  }
};

export { getUserCity };
