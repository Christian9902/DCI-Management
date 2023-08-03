import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  buttonContainer: {
    padding: 5,
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
    textAlignVertical: 'top',
  },
  createButton: {
    width: 0.85 * width,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  createButtonText: {
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
    marginBottom: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  deleteButton: {
    fontSize: 18,
    color: 'red',
    marginLeft: 10,
  },
  rekomendasiContainer: {
    marginBottom: 5,
    paddingHorizontal: 20,
    width: '95%',
  },
  attachIcon: {
    width: 25,
    height: 25,
    tintColor: 'grey',
    marginRight: 20,
  },
  attachedFilesContainer: {
    marginTop: 10,
    width: '95%',
  },
  attachedFilesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  attachedFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    justifyContent: 'space-between',
  },
  attachedFileName: {
    fontSize: 14,
    marginRight: 10,
  },
  attachedFileSize: {
    fontSize: 14,
    color: '#888',
  },
  deadlineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  deadlineButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 10,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deadlineButtonText: {
    fontSize: 14,
    textAlign: 'center',
  },
  listButton: {
    backgroundColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 10,
    marginBottom: 5,
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  modalBackdrop: {
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
  buttonContainerModal: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveButtonModal: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  saveButtonTextModal: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  supplierTextActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#ccc',
  },
  supplierText: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  supplierName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  separator: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  supplierPT: {
    fontSize: 16,
    fontWeight: 'normal',
    marginLeft: 5,
  },
  progressModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  progressModalContent: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    width: '80%',
  },
  progressModalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputHargaContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 5,
  },
  inputHarga: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    marginLeft: 10,
  },
});

export default styles;