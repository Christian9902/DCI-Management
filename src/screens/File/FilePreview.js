import React from 'react';
import { View, Text, Image, WebView } from 'react-native';
import Pdf from 'react-native-pdf';

const FilePreview = ({ fileUrl, fileType }) => {
  if (fileType.includes('image/')) {
    return <Image source={{ uri: fileUrl }} style={{ width: 300, height: 300 }} />;
  } else if (fileType === 'application/pdf') {
    return (
      <View style={{ flex: 1 }}>
        <Pdf source={{ uri: fileUrl }} style={{ flex: 1 }} />
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