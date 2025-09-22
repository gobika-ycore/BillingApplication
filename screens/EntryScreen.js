import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
const EntryScreen = ({ navigation }) => {
  const entryOptions = {
    Sales: [
      { id: "1", title: "Loan Sales" },
      { id: "2", title: "Cash Sales" },
      { id: "3", title: "Sales Return" },
    ],
    Collection: [
      { id: "4", title: "Collection Bill" },
      { id: "5", title: "Collection Alter/Delete" },
    ],
    Purchase: [
      { id: "6", title: "Purchase Bill" },
      { id: "7", title: "Purchase Return" },
      { id: "8", title: "Purchase Alter" },
    ],
    Vochers: [
      { id: "9", title: "Voucher Create" },
      { id: "10", title: "Display" },
    ],
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Entry</Text>
        <View style={{ width: 24 }} />
      </View>

      
      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.sectionHeader}>Sales</Text>
        <View style={styles.cardGroup}>
          {entryOptions.Sales.map((item) => (
            <TouchableOpacity key={item.id} style={styles.card}>
              <Text style={styles.cardText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

       
        <Text style={styles.sectionHeader}>Collection</Text>
        <View style={styles.cardGroup}>
          {entryOptions.Collection.map((item) => (
            <TouchableOpacity key={item.id} style={styles.card}>
              <Text style={styles.cardText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

       
        <Text style={styles.sectionHeader}>Purchase</Text>
        <View style={styles.cardGroup}>
          {entryOptions.Purchase.map((item) => (
            <TouchableOpacity key={item.id} style={styles.card}>
              <Text style={styles.cardText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

       
        <Text style={styles.sectionHeader}>Vouchers</Text>
        <View style={styles.cardGroup}>
          {entryOptions.Vochers.map((item) => (
            <TouchableOpacity key={item.id} style={styles.card}>
              <Text style={styles.cardText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const themeColor = "#1F49B6"; 

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: themeColor,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: { padding: 20 },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 15,
    color: "#222",
  },
  cardGroup: {
    backgroundColor: "#F3F6FF",
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  card: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  cardText: {
    fontSize: 16,
    fontWeight: "500",
    color: themeColor,
  },
});

export default EntryScreen;
