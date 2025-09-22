import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const FeatureScreen = ({ navigation }) => {
  const features = [
    { id: "1", title: "User", icon: "person-circle-outline" },
    { id: "2", title: "General Setup", icon: "settings-outline" },
    { id: "3", title: "Invoice Setup", icon: "document-text-outline" },
    { id: "4", title: "Ledger Setup", icon: "book-outline" },
    { id: "5", title: "Tally Updation", icon: "trending-up-outline" },
    { id: "6", title: "SMS / Email Setup", icon: "mail-outline" },
    { id: "7", title: "Server Setup", icon: "server-outline" },
  ];

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Features</Text>
        <View style={{ width: 24 }} />
      </View>

      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {features.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.featureCard}
              onPress={() => console.log(item.title + " clicked")}
            >
              <Icon name={item.icon} size={30} color={themeColor} />
              <Text style={styles.featureText}>{item.title}</Text>
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
  featureCard: {
    width: "47%",
    minHeight: 120,
    backgroundColor: "#E6EEFB",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    padding: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  featureText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
});

export default FeatureScreen;