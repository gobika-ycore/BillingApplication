import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const SettingScreen = ({ navigation }) => {
  const settings = [
    { id: "1", title: "Company", icon: "business-outline" },
    { id: "2", title: "Backup", icon: "cloud-upload-outline" },
    { id: "3", title: "Restore", icon: "cloud-download-outline" },
    { id: "4", title: "Registration", icon: "key-outline" },
    { id: "5", title: "User Login", icon: "log-in-outline" },
  ];

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {settings.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.settingCard}
              onPress={() => console.log(item.title + " clicked")}
            >
              <Icon name={item.icon} size={30} color={themeColor} />
              <Text style={styles.settingText}>{item.title}</Text>
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
  settingCard: {
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
  settingText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
});

export default SettingScreen;