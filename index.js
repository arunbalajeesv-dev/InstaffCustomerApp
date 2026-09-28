/**
 * @format
 */

import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { initSentry } from './src/services/sentry';

// As early as possible, before anything else can throw.
initSentry();

// Required by RNFirebase even though our messages are plain "notification"
// payloads that Android already displays automatically when the app is
// backgrounded/killed — this just has to exist to register the app for
// background delivery. No extra handling needed here.
setBackgroundMessageHandler(getMessaging(), async () => {});

AppRegistry.registerComponent(appName, () => App);
