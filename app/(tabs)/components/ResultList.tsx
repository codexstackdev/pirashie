import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { increment, push, ref, update } from "firebase/database";
import { database } from "@/hooks/lib";

type ResultProps = {
  id: string;
  title: string;
  duration: string;
  viewCount: string;
  thumbMedium: string;
};

const ResultList = ({
  id,
  title,
  viewCount,
  thumbMedium,
  duration,
}: ResultProps) => {
  const [downloaded, setDownloaded] = useState(false);
  const [loading, setloading] = useState(false);

  const STORAGE_KEY = "@app_download_directory_uri";

  const handleDownload = async () => {
    if (downloaded) return;
    setDownloaded(true);

    try {
      setloading(true);
      const url = `https://youtube-mp36.p.rapidapi.com/dl?id=${id}`;
      const options = {
        method: "GET",
        headers: {
          "x-rapidapi-key":
            "880302e719msh67569ea7d652914p1e5d58jsn880e61920d4b",
          "x-rapidapi-host": "youtube-mp36.p.rapidapi.com",
          "Content-Type": "application/json",
        },
      };

      const response = await fetch(url, options);
      const result = await response.json();

      if (!result.link) {
        throw new Error("No download link found");
      }

      const fileUrl = result.link;
      const sanitizedTitle = result.title.replace(/[/\\?%*:|"<>\s]/g, "_");
      const fileName = `${sanitizedTitle}.mp3`;
      const mimeType = "audio/mpeg";

      const cacheUri = `${FileSystem.cacheDirectory}${fileName}`;
      const { uri } = await FileSystem.downloadAsync(fileUrl, cacheUri);

      if (Platform.OS === "android") {
        const { StorageAccessFramework } = FileSystem;

        let savedDirectoryUri = await AsyncStorage.getItem(STORAGE_KEY);

        if (!savedDirectoryUri) {
          alert(
            "Android requires you to choose or create a sub-folder (e.g. create a folder named 'My Downloads' inside your files) to save music securely.",
          );

          const permissions =
            await StorageAccessFramework.requestDirectoryPermissionsAsync();

          if (!permissions.granted) {
            setDownloaded(false);
            ToastAndroid.show("Permission denied", ToastAndroid.SHORT);
            return;
          }

          savedDirectoryUri = permissions.directoryUri;
          await AsyncStorage.setItem(STORAGE_KEY, savedDirectoryUri);
        }

        const base64Data = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const safUri = await StorageAccessFramework.createFileAsync(
          savedDirectoryUri,
          fileName,
          mimeType,
        );

        await FileSystem.writeAsStringAsync(safUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const newDownloadRef = ref(database, "stats");
        const songTracking = ref(database, `tracking/${id}`);
        await update(songTracking, {
          id: id,
          title: title,
          downloads: increment(1),
          thumbMedium: thumbMedium,
          createdAt: Date.now(),
        });
        await update(newDownloadRef, {
          totalDownloads: increment(1),
          lastUpdate: Date.now(),
        });

        ToastAndroid.showWithGravity(
          `${result.title} Downloaded`,
          ToastAndroid.SHORT,
          ToastAndroid.TOP,
        );
      } else if (Platform.OS === "ios") {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        } else {
          alert("Sharing is not available on this device");
        }
      }
    } catch (error) {
      setDownloaded(false);
      console.error(error);

      if (
        error instanceof Error &&
        error.message.includes("Directory might have been deleted")
      ) {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }

      if (Platform.OS === "android") {
        ToastAndroid.showWithGravity(
          "Download failed",
          ToastAndroid.SHORT,
          ToastAndroid.TOP,
        );
      } else {
        alert("Something went wrong with the download.");
      }
    } finally {
      setloading(false);
    }
  };
  return (
    <>
      <TouchableOpacity
        onPress={handleDownload}
        style={styles.musicCard}
        disabled={loading || downloaded}
      >
        <Image
          source={{ uri: thumbMedium }}
          style={styles.musicImage}
          contentFit="cover"
        />

        <View style={styles.musicInfo}>
          <Text style={styles.musicTitle} numberOfLines={1}>
            {title}
          </Text>

          <Text style={styles.musicArtist}>{duration}</Text>

          <View style={styles.downloadInfo}>
            <Ionicons name="eye" size={14} color="#777" />

            <Text style={styles.downloadText}>{viewCount} Views</Text>
          </View>
        </View>

        <TouchableOpacity
          disabled={loading || downloaded}
          onPress={handleDownload}
          style={styles.downloadBtn}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : downloaded ? (
            <Ionicons name="checkmark-done" size={18} color="#000" />
          ) : (
            <Ionicons name="download" size={18} color="#000" />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </>
  );
};

export default ResultList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0F",
    paddingTop: 50,
  },
  musicCard: {
    marginHorizontal: 20,
    backgroundColor: "#15151C",
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  musicImage: {
    width: 65,
    height: 65,
    borderRadius: 16,
  },

  musicInfo: {
    flex: 1,
    marginLeft: 14,
  },

  musicTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  musicArtist: {
    color: "#888",
    marginTop: 4,
    fontSize: 14,
  },

  downloadInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  downloadText: {
    color: "#777",
    fontSize: 13,
    marginLeft: 5,
  },

  downloadBtn: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
  },
});
