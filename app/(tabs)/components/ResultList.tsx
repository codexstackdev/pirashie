import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import {
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

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

  const handleDownload = async () => {
    if (downloaded) return;
    setDownloaded(true);
    try {
      const url = `https://youtube-mp36.p.rapidapi.com/dl?id=${id}`;
      const options = {
        method: "GET",
        headers: {
          "x-rapidapi-key":
            "5d4bc41001msh8061d58e712e8ffp1520edjsn72515b36a183",
          "x-rapidapi-host": "youtube-mp36.p.rapidapi.com",
          "Content-Type": "application/json",
        },
      };

      try {
        const response = await fetch(url, options);
        const result = await response.json();
        const fileUrl = result.link;
        const fileUri = FileSystem.documentDirectory + `${result.title}.mp3`;
        const { uri } = await FileSystem.downloadAsync(fileUrl, fileUri);
        const permission = await MediaLibrary.requestPermissionsAsync();
        if(permission.status === "granted"){
          const asset = await MediaLibrary.createAssetAsync(uri);
          await MediaLibrary.createAlbumAsync("Downloads", asset, false);
        }
        ToastAndroid.showWithGravity(
        `${result.title} Downloaded`,
        ToastAndroid.SHORT,
        ToastAndroid.TOP,
      );
      } catch (error) {
        setDownloaded(false);
        console.error(error);
      }
    } catch (error) {
      setDownloaded(false);
      ToastAndroid.showWithGravity(
        "Something went wrong",
        ToastAndroid.SHORT,
        ToastAndroid.TOP,
      );
    }
  };
  return (
    <>
      <TouchableOpacity
        onPress={handleDownload}
        key={id}
        style={styles.musicCard}
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
            <Ionicons name="download-outline" size={14} color="#777" />

            <Text style={styles.downloadText}>{viewCount} Views</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleDownload}
          style={styles.downloadBtn}
        >
          {downloaded ? (
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
