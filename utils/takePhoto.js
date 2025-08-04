import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

export async function takePhoto() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  const mediaStatus = await MediaLibrary.requestPermissionsAsync();

  if (status !== 'granted' || mediaStatus.status !== 'granted') {
    alert('Permissions required.');
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
  });

  if (!result.canceled) {
    const asset = await MediaLibrary.createAssetAsync(result.assets[0].uri);
    console.log("✅ Saved to gallery:", asset.uri);
  }
  return "Task completed successfully.";
}
