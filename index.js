/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { Text } from 'react-native';
import { enableScreens } from 'react-native-screens';
enableScreens();
if (Text.defaultProps == null) Text.defaultProps = {};
Text.defaultProps.allowFontScaling = false;
AppRegistry.registerComponent(appName, () => App);
