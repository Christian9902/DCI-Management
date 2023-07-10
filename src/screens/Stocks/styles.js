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
    width: 250,
    justifyContent: "space-around",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: "grey",
  },
  searchInput: {
    backgroundColor: "#EDEDED",
    color: "black",
    flex: 1,
    height: 40,
    marginLeft: 5,
    marginRight: 5,
    paddingLeft: 5,
    paddingRight: 5,
    fontSize: 16,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginHorizontal: 10,
    padding: 10,
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth:1,
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
});

export default styles;