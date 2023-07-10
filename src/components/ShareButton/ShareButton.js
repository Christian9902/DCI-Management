import React from "react";
import { TouchableHighlight, Image, Share, Alert } from "react-native";
import PropTypes from "prop-types";
import styles from "./styles";

export default function ShareButton(props) {
    
    const onShare = props.shareHandler;

  return (
    <TouchableHighlight style={styles.btnContainer} onPress={onShare}>
      <Image source={require("../../../assets/icons/shareButton.png")} style={styles.btnIcon} />
    </TouchableHighlight>
  );
}

ShareButton.propTypes = {
  onPress: PropTypes.func,
  source: PropTypes.number,
  title: PropTypes.string,
};
