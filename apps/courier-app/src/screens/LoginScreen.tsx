import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { API_URL, login, type AuthTokens } from "../api/client";

type Props = {
  onLoggedIn: (session: AuthTokens) => void | Promise<void>;
};

export function LoginScreen({ onLoggedIn }: Props) {
  const [email, setEmail] = useState("courier1@rotahub.dev");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submitLogin() {
    setLoading(true);
    setError("");
    try {
      const auth = await login(email.trim(), password);
      await onLoggedIn(auth);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Courier Login</Text>
      <Text style={styles.bodyText}>API URL: {API_URL}</Text>

      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.input}
      />
      <TextInput
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        style={styles.input}
      />

      <Pressable
        onPress={submitLogin}
        disabled={loading || !email.trim() || !password}
        style={styles.primaryButton}
      >
        <Text style={styles.primaryText}>{loading ? "Entrando..." : "Entrar"}</Text>
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
    marginBottom: 12
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    backgroundColor: "#ffffff"
  },
  primaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#0ea5e9",
    borderRadius: 8,
    marginTop: 6
  },
  primaryText: {
    color: "#ffffff",
    fontWeight: "600"
  },
  errorText: {
    color: "#b91c1c",
    marginTop: 12
  }
});
