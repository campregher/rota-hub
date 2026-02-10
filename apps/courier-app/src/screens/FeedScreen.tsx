import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { API_URL, getCourierFeed, isAuthExpiredError, Job } from "../api/client";

type Props = {
  onLogout: () => void;
  onSelectJob: (job: Job) => void;
};

export function FeedScreen({ onLogout, onSelectJob }: Props) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  async function loadFeed() {
    setLoading(true);
    setError("");
    try {
      const data = await getCourierFeed();
      setJobs(data);
    } catch (err) {
      if (isAuthExpiredError(err)) {
        onLogout();
        return;
      }
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeed();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
        <Text style={styles.bodyText}>Loading feed...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Feed</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.bodyText}>API URL: {API_URL}</Text>
        <Pressable onPress={loadFeed} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Feed</Text>
        <Pressable onPress={onLogout} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Logout</Text>
        </Pressable>
      </View>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.bodyText}>
            No open jobs found. Create jobs in Swagger or apply `supabase/seed.sql`.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => onSelectJob(item)} style={styles.card}>
            <Text style={styles.cardTitle}>{item.id}</Text>
            <Text style={styles.bodyText}>Status: {item.status}</Text>
          </Pressable>
        )}
      />
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  bodyText: {
    color: "#334155",
    marginTop: 8
  },
  errorText: {
    color: "#b91c1c"
  },
  secondaryButton: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  secondaryText: {
    color: "#1e293b",
    fontWeight: "600"
  },
  card: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#ffffff"
  },
  cardTitle: {
    fontWeight: "600",
    color: "#0f172a"
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start"
  },
  retryText: {
    color: "#ffffff",
    fontWeight: "600"
  }
});
