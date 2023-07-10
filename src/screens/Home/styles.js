import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemText: {
    flex: 1,
  },
  button: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  jumlahText: {
    fontSize: 16,
    marginHorizontal: 5,
  },
  buttonOke: {
    backgroundColor: '#337ab7',
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonTextOke: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2196F3",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  addButtonIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    tintColor: "#FFF",
  },
});

export default styles;
