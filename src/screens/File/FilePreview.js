import React from 'react';
import { View, Image } from 'react-native';
import WebView from 'react-native-webview';

const FilePreview = ({ fileUrl, fileType }) => {
  if (fileType.includes('image/')) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Image
          source={{ uri: fileUrl }}
          style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
        />
      </View>
    );
  } else {
    return (
      <View style={{ flex: 1 }}>
        <WebView source={{ uri: fileUrl }} style={{ flex: 1 }} />
      </View>
    );
  }
};

export default FilePreview;