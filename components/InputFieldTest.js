// Simple Input Field Test Component
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const InputFieldTest = ({ onClose }) => {
  const [testData, setTestData] = useState({
    field1: '',
    field2: '',
    field3: '',
    field4: '',
  });

  const handleChange = (field, value) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Input Field Test</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.instruction}>
          Test typing in these fields. Text should appear INSIDE the input boxes.
        </Text>

        {/* Test Field 1 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Test Field 1</Text>
          <TextInput
            style={styles.input}
            placeholder="Type here..."
            value={testData.field1}
            onChangeText={(value) => handleChange('field1', value)}
            placeholderTextColor="#999"
          />
        </View>

        {/* Test Field 2 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Test Field 2</Text>
          <TextInput
            style={styles.input}
            placeholder="Type here..."
            value={testData.field2}
            onChangeText={(value) => handleChange('field2', value)}
            placeholderTextColor="#999"
          />
        </View>

        {/* Test Field 3 - Multiline */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Test Field 3 (Multiline)</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Type multiple lines here..."
            value={testData.field3}
            onChangeText={(value) => handleChange('field3', value)}
            multiline={true}
            numberOfLines={3}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
        </View>

        {/* Test Field 4 - Numeric */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Test Field 4 (Numeric)</Text>
          <TextInput
            style={styles.input}
            placeholder="Type numbers here..."
            value={testData.field4}
            onChangeText={(value) => handleChange('field4', value)}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>

        {/* Results Display */}
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Current Values:</Text>
          <Text style={styles.resultText}>Field 1: "{testData.field1}"</Text>
          <Text style={styles.resultText}>Field 2: "{testData.field2}"</Text>
          <Text style={styles.resultText}>Field 3: "{testData.field3}"</Text>
          <Text style={styles.resultText}>Field 4: "{testData.field4}"</Text>
        </View>

        <TouchableOpacity 
          style={styles.clearButton}
          onPress={() => setTestData({ field1: '', field2: '', field3: '', field4: '' })}
        >
          <Text style={styles.clearButtonText}>Clear All Fields</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#1F49B6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  instruction: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1F49B6',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    minHeight: 48,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  resultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  clearButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default InputFieldTest;
