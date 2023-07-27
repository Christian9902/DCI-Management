import React from 'react';
import { View, Text } from 'react-native';
import FilePreview from './FilePreview';

const FilePreviewScreen = ({ route }) => {
  const { fileURL, fileType } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <FilePreview fileUrl={fileURL} fileType={fileType} />
    </View>
  );
};

export default FilePreviewScreen;