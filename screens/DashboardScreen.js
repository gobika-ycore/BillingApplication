import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const DashboardScreen = ({ navigation }) => {
  const [activeMenu, setActiveMenu] = useState(null);

  const menus = [
    { id: 1, title: "Entry", route: "Entry", icon: "add-circle-outline" },
    { id: 2, title: "Report", route: "Report", icon: "bar-chart-outline" },
    { id: 3, title: "Accounts", route: "Accounts", icon: "wallet-outline" },
    { id: 4, title: "Master", route: "Master", icon: "person-outline" },
    { id: 5, title: "Features", route: "Features", icon: "star-outline" },
    { id: 6, title: "Settings", route: "Settings", icon: "settings-outline" },
  ];

  const dataCards = [
    { id: 1, title: "Customer Data", route: "CustomerData", icon: "people-outline", color: "#E6EEFB" },
    { id: 2, title: "Sales Bill", route: "SalesBill", icon: "receipt-outline", color: "#E6EEFB" },
    { id: 3, title: "Collection Bill", route: "CollectionBill", icon: "card-outline", color: "#E6EEFB" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      <View style={styles.header}>
        <View>
          <Text style={styles.userName}>user name</Text>
          <Text style={styles.userId}>1234567890</Text>
        </View>
        <Icon name="person-circle-outline" size={40} color="#fff" />
      </View>

      
      <View style={styles.searchBox}>
        <TextInput placeholder="search text" style={{ flex: 1 }} />
        <Icon name="search-outline" size={22} color="#1E40AF" />
      </View>

     
      <Text style={styles.quickAccess}>QUICK ACCESS</Text>

      <View style={styles.grid}>
        {menus.map((item) => {
          const isActive = activeMenu === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, isActive && styles.activeCard]}
              onPress={() => {
                setActiveMenu(item.id);
                navigation.navigate(item.route);
              }}
            >
              <Icon
                name={item.icon}
                size={28}
                color={isActive ? "#fff" : "#1E40AF"}
                style={{ marginBottom: 8 }}
              />
              <Text
                style={[styles.cardText, isActive && styles.activeCardText]}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Data Cards Section */}
      <Text style={styles.sectionTitle}>OTHER DATA</Text>
      
      <View style={styles.dataCardsContainer}>
        {dataCards.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.dataCard, { backgroundColor: item.color }]}
            onPress={() => navigation.navigate(item.route)}
          >
            <View style={styles.dataCardContent}>
              <Icon
                name={item.icon}
                size={32}
                color="#1E40AF"
                style={styles.dataCardIcon}
              />
              <Text style={styles.dataCardTitle}>{item.title}</Text>
              <Text style={styles.dataCardSubtitle}>View Details</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#1F49B6",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  userName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  userId: {
    color: "#E0E0E0",
    fontSize: 14,
    marginTop: 2,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  quickAccess: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "30%",
    backgroundColor: "#E6EEFB",
    borderRadius: 14,
    paddingVertical: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  activeCard: {
    backgroundColor: "#1E40AF",
  },
  cardText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  activeCardText: {
    color: "#fff",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 12,
    color: "#333",
  },
  dataCardsContainer: {
    flexDirection: "column",
    gap: 12,
  },
  dataCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  dataCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  dataCardIcon: {
    marginRight: 16,
  },
  dataCardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  dataCardSubtitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
});

export default DashboardScreen;
