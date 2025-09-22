import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const ReportScreen = ({ navigation }) => {
  const reports = [
    { id: "1", title: "Daily Sales/Collection Report", icon: "stats-chart" },
    { id: "2", title: "Loan Customer Line List Report", icon: "list" },
    { id: "3", title: "Loan Customer Due Pending Report", icon: "alert-circle" },
    { id: "4", title: "Loan Customer Take Care Report", icon: "people" },
    { id: "5", title: "Sales Report", icon: "cart" },
    { id: "6", title: "Collection Report", icon: "cash" },
    { id: "7", title: "Customer Account Summary", icon: "person" },
    { id: "8", title: "Stock Report", icon: "cube" },
  ];

  return (
    <View style={styles.container}>
     
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports</Text>
        <View style={{ width: 24 }} />
      </View>

     
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {reports.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.reportCard}
              onPress={() => {
                console.log(item.title + " clicked");
              }}
            >
              <Icon name={item.icon} size={30} color={themeColor} />
              <Text style={styles.reportText}>{item.title}</Text>
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
  reportCard: {
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
  reportText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
});

export default ReportScreen;