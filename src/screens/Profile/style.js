import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  listContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  listItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  listItemActive: {
    backgroundColor: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    width: '45%',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: 'gray',
    marginBottom: 10,
  },
  passwordVisibilityButton: {
    color: 'blue',
    textDecorationLine: 'underline',
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default styles;