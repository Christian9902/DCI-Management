import React, { useLayoutEffect } from 'react';
import { View } from 'react-native';
import FilePreview from './FilePreview';
import MenuImage from "../../components/MenuImage/MenuImage";

const FilePreviewScreen = ({ navigation, route }) => {
  const { fileURL, fileType } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitleStyle: {
        top: 0,
      },
      headerLeft: () => (
        <MenuImage
          onPress={() => {
            navigation.openDrawer();
          }}
        />
      ),
      headerRight: () => <View />,
    });
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <FilePreview fileUrl={fileURL} fileType={fileType} />
    </View>
  );
};

export default FilePreviewScreen;