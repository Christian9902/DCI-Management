import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  container2: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button2: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText2: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button3: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'gray',
    borderWidth: 1,
  },
  buttonText3: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchButton: {
    marginRight: 10,
  },
  searchButtonImage: {
    width: 24,
    height: 24,
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
  separator: {
    height: 1,
    backgroundColor: 'gray',
    marginVertical: 10,
  },  
});

export default styles;