import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import SideBar from "./components/SideBar";
import ResultList from "./components/ResultList";

const results = [
  {
    id: 1,
    title: "Blinding Lights",
    artist: "The Weeknd",
    downloads: "12.4K",
    image: "https://i.scdn.co/image/ab67616d0000b2730d3c5b9f7e1d0f0d7f4c2d9f",
  },
  {
    id: 2,
    title: "Starboy",
    artist: "The Weeknd",
    downloads: "8.1K",
    image: "https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258f9c6d7e6",
  },
  {
    id: 3,
    title: "One Dance",
    artist: "Drake",
    downloads: "6.9K",
    image: "https://i.scdn.co/image/ab67616d0000b273b1c65c5f7c1d8a9d5e4b3e8c",
  },
];

type DataProps = {
  id: string;
  title: string;
  duration: string;
  viewCount: string;
  thumbMedium: string;
};

export default function HomeScreen() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState<DataProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = async () => {
    if (query.trim().length <= 0) {
      ToastAndroid.showWithGravity("Search is empty", ToastAndroid.SHORT, ToastAndroid.TOP);
      return;
    }
    setLoading(true);
    try {
      const req = await fetch(
        `https://jeextract.vercel.app/api/proxy?q=${query}`,
      );
      const data = await req.json();
      if (data) {
        setData(data.items);
      } else {
        setData([]);
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <SideBar sideBarOpen={sidebarOpen} setSideBarOpen={setSidebarOpen} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setSidebarOpen(true)}
          >
            <Ionicons name="menu" size={26} color="#fff" />
          </TouchableOpacity>

          <View>
            <Text style={styles.logo}>PiraShie</Text>
            <Text style={styles.subtitle}>Download music instantly</Text>
          </View>
        </View>

        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={20} color="#777" />

          <TextInput
            placeholder="Search music..."
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            placeholderTextColor="#777"
            style={styles.input}
            editable={!loading}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#8B5CF6" />
          ) : (
            <TouchableOpacity
              disabled={loading}
              onPressIn={handleSearch}
              style={styles.searchBtn}
            >
              <Ionicons name="arrow-forward" size={18} color="#000" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>Total Results: {data.length}</Text>
        </View>

        {data.map((music) => (
          <ResultList
            viewCount={music.viewCount}
            id={music.id}
            title={music.title}
            thumbMedium={music.thumbMedium}
            duration={music.duration}
          />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0F",
    paddingTop: 50,
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 5,
  },

  header: {
    paddingHorizontal: 20,
    marginBottom: 30,
    flexDirection: "row",
    alignItems: "center",
  },

  menuButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#16161D",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  logo: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
  },

  subtitle: {
    color: "#777",
    marginTop: 2,
  },

  resultsHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 10,
  },

  resultsTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  searchWrapper: {
    height: 60,
    backgroundColor: "#15151C",
    borderRadius: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    color: "#fff",
    marginLeft: 10,
    fontSize: 15,
  },

  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
  },
});
