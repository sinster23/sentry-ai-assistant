import { Linking, Platform } from 'react-native';

const schemeMap = {
  flipkart: 'flipkart://',
  spotify: 'spotify://',
  facebook: 'fb://',
  whatsapp: 'whatsapp://send?text=Hi',
  youtube: 'vnd.youtube://',
  chrome: 'googlechrome://',
  gmail: 'mailto:',
  instagram: 'instagram://user?username=instagram',
  maps: 'geo:0,0?q=',
};

const pkgNameMap = {
  flipkart: 'com.flipkart.android',
  spotify: 'com.spotify.music',
  facebook: 'com.facebook.katana',
  whatsapp: 'com.whatsapp',
  youtube: 'com.google.android.youtube',
  chrome: 'com.android.chrome',
  gmail: 'com.google.android.gm',
  instagram: 'com.instagram.android',
  maps: 'com.google.android.apps.maps',
};

export async function openApp(appName) {
  const lower = appName.toLowerCase();
  const scheme = schemeMap[lower];
  const pkg = pkgNameMap[lower];

  if (!scheme || !pkg) {
    return "Sorry but this app is not supported.";
    return;
  }

  try {
    const supported = await Linking.canOpenURL(scheme);
    if (supported) {
      await Linking.openURL(scheme);
    } else {
      const storeUrl = `https://play.google.com/store/apps/details?id=${pkg}`;
      await Linking.openURL(storeUrl);
    }
    return `Successfully opened ${appName}`;
  } catch (err) {
    console.error(`Failed to open ${appName}`, err);
    return `Failed to open ${appName}. Please check if it's installed.`;
  }
}
