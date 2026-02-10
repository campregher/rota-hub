import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { isAuthExpiredError, uploadPod } from "../api/client";

type Props = {
  jobId: string;
  onBack: () => void;
  onLogout: () => void;
};

export function PODCaptureScreen({ jobId, onBack, onLogout }: Props) {
  const [receiverName, setReceiverName] = useState("");
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setResult("Permission denied for photo library");
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images as any,
      quality: 0.8
    });
    if (!picked.canceled && picked.assets[0]) {
      setPhotoUri(picked.assets[0].uri);
    }
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setResult("Permission denied for camera");
      return;
    }

    const captured = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images as any,
      quality: 0.8
    });

    if (!captured.canceled && captured.assets[0]) {
      setPhotoUri(captured.assets[0].uri);
    }
  }

  async function submit() {
    if (!receiverName.trim()) {
      setResult("receiverName e obrigatorio.");
      return;
    }
    setLoading(true);
    try {
      const data = await uploadPod({
        jobId,
        receiverName: receiverName.trim(),
        photoUri
      });
      setResult(JSON.stringify(data));
    } catch (err) {
      if (isAuthExpiredError(err)) {
        onLogout();
        return;
      }
      setResult(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>POD Capture</Text>
      <Text style={styles.bodyText}>Job: {jobId}</Text>
      <TextInput
        placeholder="Receiver name"
        value={receiverName}
        onChangeText={setReceiverName}
        style={styles.input}
      />

      <View style={styles.buttonRow}>
        <Pressable onPress={pickImage} style={styles.secondaryButton}>
          <Text style={styles.bodyText}>Select Photo</Text>
        </Pressable>
        <Pressable onPress={takePhoto} style={styles.secondaryButton}>
          <Text style={styles.bodyText}>Take Photo</Text>
        </Pressable>
        <Pressable
          onPress={submit}
          disabled={loading || !receiverName.trim()}
          style={styles.primaryButton}
        >
          <Text style={{ color: "white" }}>Upload POD</Text>
        </Pressable>
      </View>

      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.preview} />
      ) : (
        <Text style={styles.bodyText}>No photo selected yet.</Text>
      )}

      {result ? <Text style={styles.bodyText}>{result}</Text> : null}

      <Pressable onPress={onBack} style={styles.secondaryButton}>
        <Text style={styles.bodyText}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8fafc"
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    color: "#0f172a"
  },
  bodyText: {
    color: "#334155",
    marginTop: 12
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginTop: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#ffffff"
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 12
  },
  secondaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    marginTop: 16,
    marginRight: 12
  },
  primaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#14b8a6",
    borderRadius: 8,
    marginTop: 16
  },
  preview: {
    width: 120,
    height: 120,
    marginTop: 12
  }
});
