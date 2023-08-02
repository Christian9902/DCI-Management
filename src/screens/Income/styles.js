import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  point: {
    marginHorizontal: 20,
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
  datePickerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  datePicker: {
    fontSize: 16,
    backgroundColor: '#eee',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  button: {
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 5,
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  separator: {
    height: 1,
    backgroundColor: 'gray',
    marginVertical: 10,
  },filterIcon: {
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
  dateRangeText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export default styles;