import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDEDED",
    borderRadius: 10,
    width: '100%',
    justifyContent: "space-around",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: "grey",
  },
  filterIcon: {
      width: 20,
      height: 20,
      marginHorizontal: 10,
  },
  searchInput: {
    backgroundColor: "#EDEDED",
    color: "black",
    flex: 1,
    height: 30,
    marginLeft: 5,
    marginRight: 5,
    paddingLeft: 5,
    paddingRight: 5,
    fontSize: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginHorizontal: 10,
    padding: 10,
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1,
  },
  itemContainer: {
    flex: 1,
    marginVertical: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  categoryContainer: {
    marginTop: 5,
  },
  category: {
    fontSize: 14,
    color: "gray",
  },
  filterIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginHorizontal: 16,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerColumn: {
    flex: 1,
    flexDirection: 'column',
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    width: '80%',
  },
  modalFilterGroup: {
    marginBottom: 16,
  },
  modalFilterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalFilterOption: {
    fontSize: 16,
    marginBottom: 4,
    color: '#007BFF',
  },
  modalFilterInput: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignContent: 'center',
    width: '100%',
  },
  modalApplyButton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'blue',
    textAlign: 'center',
  },
  modalResetButton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'lightgray',
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default styles;