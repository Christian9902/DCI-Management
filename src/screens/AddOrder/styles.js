import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  rekomendasiContainer: {
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxText: {
    marginLeft: 8,
  },
  checkboxIcon: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  jumlahContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  jumlahText: {
    marginRight: 8,
  },
  jumlahContainer2: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    paddingHorizontal: 8,
    flex: 1,
    marginLeft: 8,
  },
  jumlahButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  jumlahButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  jumlahInput: {
    flex: 1,
    paddingVertical: 4,
    textAlign: 'center',
  },
  deadlineContainer: {
    marginBottom: 16,
  },
  deadlineButton: {
    backgroundColor: 'lightgray',
    padding: 10,
    borderRadius: 4,
    marginBottom: 8,
  },
  deadlineButtonText: {
    fontSize: 16,
  },
  additionalInfoInput: {
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  attachedFilesContainer: {
    marginBottom: 16,
  },
  attachedFilesTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  attachedFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachedFileName: {
    marginRight: 8,
  },
  attachedFileSize: {
    color: 'gray',
  },
  deleteButton: {
    marginLeft: 8,
    color: 'red',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: 'black',
    padding: 16,
    borderRadius: 4,
    marginBottom: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  attachIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  scrollViewContentContainer: {
    paddingBottom: 80,
  },
  uploadButton: {
    flexDirection: 'row', // Mengatur tata letak tombol dan ikon menjadi sejajar
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButtonIcon: {
    marginRight: 8,
    width: 24, // Mengatur lebar ikon tombol
    height: 24, // Mengatur tinggi ikon tombol
    resizeMode: 'contain',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  anotherButton: {
    backgroundColor: 'blue', // Ganti warna tombol Another Button menjadi biru
    padding: 16,
    borderRadius: 4,
    marginBottom: 16,
    alignItems: 'center',
    flexDirection: 'row', // Mengatur tata letak tombol Another Button dan ikon menjadi sejajar
  },
  anotherButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default styles;
