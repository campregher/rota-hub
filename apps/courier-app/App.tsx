import { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from "react-native";
import { type AuthTokens, Job } from "./src/api/client";
import { clearSession, loadSession, saveSession } from "./src/auth/session";
import { FeedScreen } from "./src/screens/FeedScreen";
import { JobDetailScreen } from "./src/screens/JobDetailScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { PODCaptureScreen } from "./src/screens/PODCaptureScreen";

type Screen = "login" | "feed" | "jobDetail" | "podCapture";

export default function App() {
  const [bootstrapping, setBootstrapping] = useState(true);
  const [screen, setScreen] = useState<Screen>("login");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function hydrateSession() {
      const session = await loadSession();
      if (cancelled) {
        return;
      }
      setScreen(session ? "feed" : "login");
      setBootstrapping(false);
    }

    hydrateSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    await clearSession();
    setSelectedJob(null);
    setScreen("login");
  }

  async function handleLoggedIn(tokens: AuthTokens) {
    await saveSession(tokens);
    setScreen("feed");
  }

  if (bootstrapping) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      {screen === "login" ? (
        <LoginScreen onLoggedIn={handleLoggedIn} />
      ) : null}

      {screen === "feed" ? (
        <FeedScreen
          onLogout={handleLogout}
          onSelectJob={(job) => {
            setSelectedJob(job);
            setScreen("jobDetail");
          }}
        />
      ) : null}

      {screen === "jobDetail" && selectedJob ? (
        <JobDetailScreen
          job={selectedJob}
          onLogout={handleLogout}
          onJobUpdated={(updatedJob) => setSelectedJob(updatedJob)}
          onBack={() => setScreen("feed")}
          onOpenPod={() => setScreen("podCapture")}
        />
      ) : null}

      {screen === "podCapture" && selectedJob ? (
        <PODCaptureScreen
          jobId={selectedJob.id}
          onLogout={handleLogout}
          onBack={() => setScreen("jobDetail")}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});
