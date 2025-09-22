import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const AccountsScreen = ({ navigation }) => {
  const accountsOptions = [
    { id: "1", title: "Daybook", icon: "book" },
    { id: "2", title: "Ledger", icon: "document-text" },
    { id: "3", title: "Group Summary", icon: "list" },
    { id: "4", title: "Cashbook", icon: "cash" },
    { id: "5", title: "Balance Sheet", icon: "stats-chart" },
    { id: "6", title: "Profit & Loss", icon: "trending-up" },
  ];

  return (
    <View style={styles.container}>
     
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accounts</Text>
        <View style={{ width: 24 }} /> 
      </View>

    
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {accountsOptions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => {
                console.log(item.title + " clicked");
              }}
            >
              <Icon name={item.icon} size={30} color={themeColor} />
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

  scrollContent: {
    padding: 15,
    paddingBottom: 30, 
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "47%",
    minHeight: 120,
    backgroundColor: "#E6EEFB",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    padding: 12,
  },
  cardText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
});

export default AccountsScreen;
