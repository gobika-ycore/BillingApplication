import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons"; 

const MasterScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back-outline" size={24} color="#fff" />
        </TouchableOpacity>

       
        <Text style={styles.headerText}>Master</Text>

        
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
       
        <Text style={styles.sectionHeader}>Stock Item</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardText}>Item</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardText}>Item Group</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardText}>Brand</Text>
            </View>
          </TouchableOpacity>
        </View>

        
        <Text style={styles.sectionHeader}>Customers</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardText}>Customer Profiles</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardText}>Customer Group</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardText}>Area</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardText}>Area Group</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardText}>Location Data</Text>
            </View>
          </TouchableOpacity>
        </View>

  
        <Text style={styles.sectionHeader}>Ledger</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardText}>Ledger</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardText}>Ledger Group</Text>
            </View>
          </TouchableOpacity>
        </View>

       
        <Text style={styles.sectionHeader}>Supplier</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardText}>Supplier</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardText}>Supplier Group</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const themeColor = "#1F49B6"; 
const lightTheme = "#EAF1FF"; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9faff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: themeColor,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 24,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    flex: 1,
  },
  content: {
    padding: 20,
  },
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardText: {
    fontSize: 16,
    fontWeight: "500",
    color: themeColor,
  },
});

export default MasterScreen;