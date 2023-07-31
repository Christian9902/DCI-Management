import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  input: {
    width: 0.85 * width,
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  additionalInfoInput: {
    width: 0.85 * width,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: 7.5,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  addButton: {
    width: 0.85 * width,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  cancelButton: {
    width: 0.85 * width,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  imageButton: {
    width: 0.85 * width,
    height: 200,
    borderRadius: 10,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 5,
  },
  imageButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  removePictureButton: {
    width: 0.85 * width,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  removePictureButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  jumlahContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 20,
    width: '95%',
  },  
  jumlahContainer2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  jumlahButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  jumlahButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  jumlahInput: {
    height: 40,
    width: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
  },
  jumlahText: {
    fontSize: 15,
    color: '#000',
  },
  rekomendasiContainer: {
    marginBottom: 5,
    paddingHorizontal: 20,
    width: '95%',
  },
  checkboxContainer: {
    width: '95%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'space-between',
    paddingHorizontal: 20,
    marginVertical: 5,
  },
  checkboxText: {
    fontSize: 16,
  },
  checkboxIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },  
});

export default styles;