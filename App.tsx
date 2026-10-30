/**
 * UPbrella App - WebView for upbrella.co.kr
 *
 * @format
 */

import React, {useEffect, useState, useRef} from 'react';
import {SafeAreaView, StatusBar, StyleSheet, Platform, View, ActivityIndicator, Text, BackHandler, Alert, PermissionsAndroid, Linking} from 'react-native';
import {WebView} from 'react-native-webview';

const APP_URL = __DEV__ ? 'https://porodev.asuscomm.com/upbrella-dev/' : 'https://upbrella.co.kr';
const allowedHosts = ['upbrella.co.kr', 'www.upbrella.co.kr', 'api.upbrella.co.kr', 'kauth.kakao.com', 'kapi.kakao.com', 'appleid.apple.com', 'pf.kakao.com', ...(__DEV__ ? ['porodev.asuscomm.com'] : [])];
function App(): JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef<WebView>(null);


  useEffect(() => {
    // Android 뒤로가기 버튼 핸들링
    const backAction = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      } else {
        Alert.alert('앱 종료', '앱을 종료하시겠습니까?', [
          {
            text: '취소',
            onPress: () => null,
            style: 'cancel',
          },
          {text: '확인', onPress: () => BackHandler.exitApp()},
        ]);
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [canGoBack]);

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleError = () => {
    setIsLoading(false);
  };

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setIsLoading(navState.loading);
  };

  const requestCamera = async () => {
    const permitted = Platform.OS !== 'android' || await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
      title: 'QR 스캔 카메라 권한', message: '우산 대여와 반납 QR을 스캔하기 위해 카메라를 사용합니다.', buttonPositive: '허용', buttonNegative: '취소',
    }) === PermissionsAndroid.RESULTS.GRANTED;
    webViewRef.current?.injectJavaScript(`window.dispatchEvent(new CustomEvent('upbrella-camera-result', { detail: ${permitted} })); true;`);
  };
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>로딩 중...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {isLoading && renderLoading()}
      <WebView
        ref={webViewRef}
        source={{uri: APP_URL}}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        incognito={false}
        applicationNameForUserAgent="UpbrellaApp"
        allowsInlineMediaPlayback={true}
        mediaCapturePermissionGrantType="grantIfSameHostElsePrompt"
        mixedContentMode="never"
        onMessage={event => { if (event.nativeEvent.data === 'upbrella:camera') requestCamera(); }}
        onShouldStartLoadWithRequest={request => {
          if (request.url === 'about:blank') return true;
          const host = /^https:\/\/([^/:?#]+)/i.exec(request.url)?.[1]?.toLowerCase();
          if (host && allowedHosts.includes(host)) return true;
          if (/^(https?:|kakaotalk:|kakaokompassauth:|mailto:|tel:)/i.test(request.url)) Linking.openURL(request.url).catch(() => {});
          return false;
        }}
        allowsBackForwardNavigationGestures={true}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onNavigationStateChange={handleNavigationStateChange}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333333',
  },
});

export default App;
