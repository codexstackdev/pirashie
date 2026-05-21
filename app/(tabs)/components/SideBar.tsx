import { database } from "@/hooks/lib";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

type SidebarProps = {
  sideBarOpen: boolean;
  setSideBarOpen: (val: boolean) => void;
};

type songProps = {
  title: string;
  thumbMedium: string;
  downloads: number;
};

const SideBar = ({ sideBarOpen, setSideBarOpen }: SidebarProps) => {
  const translateX = useSharedValue(-320);
  const overlayOpacity = useSharedValue(0);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [topSongs, setTopSongs] = useState<songProps | null>(null);

  useEffect(() => {
    const statsRef = ref(database, "stats");
    const unsubscribeStats = onValue(statsRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.totalDownloads) {
        setTotalDownloads(data.totalDownloads);
      }
    });
    const trackingRef = ref(database, "tracking");
    const unsubscribeTracking = onValue(trackingRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedArray = Object.keys(data).map((key) => ({
          firebaseId: key,
          ...data[key],
        }));
        formattedArray.sort((a, b) => b.downloads - a.downloads);
        setTopSongs(formattedArray[0]);
      } else {
        setTopSongs(null);
      }
      return () => {
        unsubscribeStats();
        unsubscribeTracking();
      };
    });
  }, []);

  useEffect(() => {
    if (sideBarOpen) {
      translateX.value = withTiming(0, { duration: 250 });
      overlayOpacity.value = withTiming(1, { duration: 200 });
    } else {
      translateX.value = withTiming(-320, { duration: 250 });
      overlayOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [sideBarOpen]);

  const animatedSidebar = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const animatedOverlay = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
    };
  });

  return (
    <>
      {sideBarOpen && (
        <Animated.View style={[styles.overlay, animatedOverlay]}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setSideBarOpen(false)}
          />
        </Animated.View>
      )}

      <Animated.View
        style={[styles.sidebar, animatedSidebar]}
        pointerEvents={sideBarOpen ? "auto" : "none"}
      >
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>PiraShie Stats</Text>

          <TouchableOpacity onPress={() => setSideBarOpen(false)}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="download" size={22} color="#8B5CF6" />
          <Text style={styles.statNumber}>{totalDownloads}</Text>
          <Text style={styles.statLabel}>Total Downloads</Text>
        </View>

        {topSongs && (
          <View style={styles.topSongCard}>
            <Text style={styles.topSongTitle}>Top Downloaded</Text>

            <View style={styles.topSongContent}>
              <Image
                source={{
                  uri: topSongs?.thumbMedium,
                }}
                style={styles.topSongImage}
              />

              <View style={styles.topSongInfo}>
                <Text
                  style={styles.topSongName}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {topSongs?.title}
                </Text>
                <Text style={styles.topSongArtist}>
                  Downloads: {topSongs?.downloads}
                </Text>
              </View>
            </View>
          </View>
        )}
      </Animated.View>
    </>
  );
};

export default SideBar;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 5,
  },
  topSongInfo: {
    flex: 1,
  },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: "#121218",
    zIndex: 10,
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },

  sidebarTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },

  statCard: {
    backgroundColor: "#1A1A22",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },

  statNumber: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 12,
  },

  statLabel: {
    color: "#777",
    marginTop: 6,
  },

  topSongCard: {
    backgroundColor: "#8B5CF6",
    borderRadius: 24,
    padding: 18,
    marginTop: 10,
  },

  topSongTitle: {
    color: "#EDE2FF",
    marginBottom: 16,
    fontWeight: "600",
  },

  topSongContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  topSongImage: {
    width: 60,
    height: 60,
    borderRadius: 16,
    marginRight: 14,
  },

  topSongName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    flexShrink: 1,
  },

  topSongArtist: {
    color: "#EDE2FF",
    marginTop: 4,
  },
});
