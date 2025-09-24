// App.js
import "react-native-gesture-handler"; // must be first for react-navigation
import React, { useState, createContext, useContext } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  Alert,
  StyleSheet,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ScrollView
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

/* -------------------------
   Shared Context
   ------------------------- */
const CarContext = createContext<{ cars: any[]; addCar: (car: any) => void }>({
  cars: [],
  addCar: () => {}
});

/* -------------------------
   Login Screen
   ------------------------- */
import type { StackNavigationProp } from '@react-navigation/stack';

type LoginScreenProps = {
  navigation: StackNavigationProp<any>;
};

function LoginScreen({ navigation }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer"); // "customer" or "admin"

  const handleLogin = () => {
    if (!username.trim()) {
      Alert.alert("Validation", "Please enter a username.");
      return;
    }
    // Simple role-based navigation for assignment
    if (role === "admin") {
      navigation.replace("AdminAddCar", { user: username });
    } else {
      navigation.replace("CustomerRent", { user: username });
    }
  };

  return (
    <SafeAreaView style={styles.centered}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.loginCard}>
        <Text style={styles.appTitle}>ICE Car Booking</Text>

        <TextInput
          placeholder="Username"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[styles.roleBtn, role === "customer" && styles.roleBtnActive]}
            onPress={() => setRole("customer")}
          >
            <Text style={role === "customer" ? styles.roleActiveText : styles.roleText}>Customer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleBtn, role === "admin" && styles.roleBtnActive]}
            onPress={() => setRole("admin")}
          >
            <Text style={role === "admin" ? styles.roleActiveText : styles.roleText}>Admin</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin}>
          <Text style={styles.primaryBtnText}>Login as {role}</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>Tip: For testing choose role then Login</Text>
      </View>
    </SafeAreaView>
  );
}

/* -------------------------
   Admin - Add Car Screen
   ------------------------- */

type AdminAddCarScreenProps = {
  navigation: StackNavigationProp<any>;
  route: RouteProp<any, any>;
};

function AdminAddCarScreen({ navigation, route }: AdminAddCarScreenProps) {
  const { addCar, cars } = useContext(CarContext);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [costPerDay, setCostPerDay] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleAddCar = () => {
    if (!make.trim() || !model.trim() || !costPerDay.trim()) {
      Alert.alert("Validation", "Please fill make, model and cost per day.");
      return;
    }
    const parsed = Number(costPerDay);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert("Validation", "Cost per day must be a positive number.");
      return;
    }
    const newCar = {
      id: Date.now().toString(),
      make: make.trim(),
      model: model.trim(),
      costPerDay: parsed,
      image:
        imageUrl.trim() ||
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop"
    };
    addCar(newCar);
    // clear fields
    setMake("");
    setModel("");
    setCostPerDay("");
    setImageUrl("");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.adminContainer}>
          <Text style={styles.header}>Admin — Add a Car</Text>

          <TextInput placeholder="Make (e.g., Toyota)" style={styles.input} value={make} onChangeText={setMake} />
          <TextInput placeholder="Model (e.g., Corolla)" style={styles.input} value={model} onChangeText={setModel} />
          <TextInput
            placeholder="Cost per day (number)"
            style={styles.input}
            value={costPerDay}
            onChangeText={setCostPerDay}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Image URL (optional)"
            style={styles.input}
            value={imageUrl}
            onChangeText={setImageUrl}
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={handleAddCar}>
            <Text style={styles.primaryBtnText}>Add Car</Text>
          </TouchableOpacity>

          <Text style={{ marginTop: 18, fontWeight: "700", fontSize: 16 }}>Available Cars</Text>

          <FlatList
            data={cars}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.carRow}>
                <Image source={{ uri: item.image }} style={styles.thumb} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "700" }}>
                    {item.make} {item.model}
                  </Text>
                  <Text>R{item.costPerDay} / day</Text>
                </View>
              </View>
            )}
            style={{ marginTop: 12, width: "100%" }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />

          <TouchableOpacity
            style={[styles.secondaryBtn, { marginTop: 16 }]}
            onPress={() => navigation.replace("Login")}
          >
            <Text style={{ color: "#1e6fff", fontWeight: "600" }}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* -------------------------
   CarItem (internal)
   ------------------------- */
type Car = {
  id: string;
  make: string;
  model: string;
  costPerDay: number;
  image: string;
};

type CarItemProps = {
  car: Car;
  onSelect: (car: Car) => void;
  isSelected: boolean;
};

function CarItem({ car, onSelect, isSelected }: CarItemProps) {
  return (
    <TouchableOpacity
      onPress={() => onSelect(car)}
      style={[
        styles.carCard,
        isSelected ? { borderColor: "#1e6fff", borderWidth: 2 } : {}
      ]}
    >
      <Image source={{ uri: car.image }} style={styles.carImage} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "700" }}>{car.make} {car.model}</Text>
        <Text>R{car.costPerDay} / day</Text>
      </View>
    </TouchableOpacity>
  );
}

/* -------------------------
   Customer - Rent Screen
   ------------------------- */

type CustomerRentScreenProps = {
  navigation: StackNavigationProp<any>;
  route: RouteProp<any, any>;
};

function CustomerRentScreen({ navigation, route }: CustomerRentScreenProps) {
  const { cars } = useContext(CarContext);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [days, setDays] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const calculateTotal = () => {
    const d = Number(days);
    if (!selectedCar || isNaN(d) || d <= 0) return null;
    return d * selectedCar.costPerDay;
  };

  const onRentPress = () => {
    if (!selectedCar) {
      Alert.alert("Select a car", "Please select a car to rent.");
      return;
    }
    const total = calculateTotal();
    if (!total) {
      Alert.alert("Enter days", "Please enter a valid number of days (>=1).");
      return;
    }
    setModalVisible(true);
  };

  const confirmBooking = () => {
    const total = calculateTotal();
    setModalVisible(false);
    // navigate to Confirmation
    navigation.navigate("Confirmation", {
      car: selectedCar,
      days: Number(days),
      total
    });
    // reset selection
    setSelectedCar(null);
    setDays("");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.customerContainer}>
        <Text style={styles.header}>Rent a Car</Text>

        {cars.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Text>No cars available yet. Ask admin to add cars.</Text>
          </View>
        ) : (
          <FlatList
            data={cars}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CarItem car={item} onSelect={setSelectedCar} isSelected={selectedCar?.id === item.id} />
            )}
            style={{ width: "100%" }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        )}

        <Text style={{ marginTop: 10 }}>Selected: {selectedCar ? `${selectedCar.make} ${selectedCar.model}` : "None"}</Text>

        <TextInput
          placeholder="Number of days"
          value={days}
          onChangeText={setDays}
          keyboardType="numeric"
          style={styles.input}
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={onRentPress}>
          <Text style={styles.primaryBtnText}>Rent Car</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.replace("Login")}>
          <Text style={{ color: "#1e6fff", fontWeight: "600" }}>Logout</Text>
        </TouchableOpacity>

        {/* Modal */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={{ fontWeight: "700", fontSize: 18 }}>Booking Summary</Text>
              <Text style={{ marginTop: 8 }}>{selectedCar?.make} {selectedCar?.model}</Text>
              <Text>Days: {days}</Text>
              <Text style={{ marginTop: 8, fontWeight: "700" }}>Total: R{calculateTotal()}</Text>

              <View style={{ flexDirection: "row", marginTop: 16 }}>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#28a745" }]} onPress={confirmBooking}>
                  <Text style={{ color: "#fff" }}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#dc3545", marginLeft: 8 }]} onPress={() => setModalVisible(false)}>
                  <Text style={{ color: "#fff" }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

/* -------------------------
   Confirmation Screen
   ------------------------- */
import type { RouteProp } from '@react-navigation/native';

type ConfirmationScreenProps = {
  route: RouteProp<any, any>;
  navigation: StackNavigationProp<any>;
};

function ConfirmationScreen({ route, navigation }: ConfirmationScreenProps) {
  const params = route.params || {};
  const { car, days, total } = params;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.confirmContainer}>
        <Text style={styles.header}>Booking Confirmed</Text>

        {car ? (
          <>
            <Image source={{ uri: car.image }} style={styles.confirmImage} />
            <Text style={{ fontWeight: "700", fontSize: 18, marginTop: 10 }}>{car.make} {car.model}</Text>
            <Text>Days booked: {days}</Text>
            <Text style={{ marginTop: 8, fontWeight: "700" }}>Amount Due on pickup: R{total}</Text>

            <TouchableOpacity style={[styles.primaryBtn, { marginTop: 18 }]} onPress={() => navigation.popToTop()}>
              <Text style={styles.primaryBtnText}>Back to Home</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text>No booking details found.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

/* -------------------------
   App (root)
   ------------------------- */
const Stack = createStackNavigator();

export default function App() {
  // initial demo cars
  const [cars, setCars] = useState([
    {
      id: "1",
      make: "Toyota",
      model: "Corolla",
      costPerDay: 300,
      image: "https://images.unsplash.com/photo-1638618164682-12b986ec2a75?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      id: "2",
      make: "BMW",
      model: "1 Series",
      costPerDay: 280,
      image: "https://images.unsplash.com/photo-1746426758698-184dbf2fffdb?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    }
  ]);

  const addCar = (car: Car) => setCars(prev => [car, ...prev]);

  return (
    <CarContext.Provider value={{ cars, addCar }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AdminAddCar" component={AdminAddCarScreen} options={{ title: "Admin — Add Car" }} />
          <Stack.Screen name="CustomerRent" component={CustomerRentScreen} options={{ title: "Rent a Car" }} />
          <Stack.Screen name="Confirmation" component={ConfirmationScreen} options={{ title: "Booking Confirmation" }} />
        </Stack.Navigator>
      </NavigationContainer>
    </CarContext.Provider>
  );
}

/* -------------------------
   Styles
   ------------------------- */
const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f9ff",
    padding: 16
  },
  loginCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3
  },
  appTitle: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center"
  },
  input: {
    width: "100%",
    padding: 12,
    backgroundColor: "#f9fbff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 10
  },
  roleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12
  },
  roleBtn: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: "#ddd"
  },
  roleBtnActive: {
    backgroundColor: "#1e6fff",
    borderColor: "#1e6fff"
  },
  roleText: {
    color: "#333"
  },
  roleActiveText: {
    color: "#fff",
    fontWeight: "700"
  },
  primaryBtn: {
    marginTop: 6,
    backgroundColor: "#1e6fff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center"
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700"
  },
  secondaryBtn: {
    marginTop: 12,
    alignItems: "center",
    padding: 10,
    borderRadius: 8
  },
  hint: {
    marginTop: 12,
    color: "#666",
    textAlign: "center"
  },
  adminContainer: {
    padding: 16,
    alignItems: "center",
    backgroundColor: "#fff",
    minHeight: "100%"
  },
  header: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12
  },
  carRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
    padding: 10,
    borderRadius: 8
  },
  thumb: {
    width: 96,
    height: 60,
    borderRadius: 6,
    marginRight: 12
  },
  carCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee"
  },
  carImage: {
    width: 100,
    height: 64,
    marginRight: 12,
    borderRadius: 6
  },
  customerContainer: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    backgroundColor: "#f2f6ff"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12
  },
  modalBtn: {
    padding: 10,
    borderRadius: 8
  },
  confirmContainer: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    backgroundColor: "#fff"
  },
  confirmImage: {
    width: 320,
    height: 180,
    borderRadius: 10
  }
});
