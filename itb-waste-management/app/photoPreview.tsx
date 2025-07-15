import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { submitReport } from "@/services/wasteService";

export default function PhotoPreview() {
  const { uri, id } = useLocalSearchParams<{ uri?: string; id?: string }>();
  const router = useRouter();

  const [trashOk, setTrashOk] = useState<boolean | null>(null);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!uri || !id) return Alert.alert("Error", "Data tidak lengkap.");
    if (trashOk === null)
      return Alert.alert("Validasi", "Pilih apakah sampah sesuai.");
    if (!weight) return Alert.alert("Validasi", "Masukkan berat sampah.");

    try {
      setLoading(true);

      const fileInfo: any = await FileSystem.getInfoAsync(uri);
      if (fileInfo.size && fileInfo.size > 4 * 1024 * 1024) {
        return Alert.alert(
          "Ukuran Gambar Besar",
          "Ukuran gambar melebihi 4MB.",
        );
      }

      const base64Image = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await submitReport({
        id,
        match: trashOk,
        collected: weight,
        note,
        image: `data:image/jpeg;base64,${base64Image}`,
      });

      Alert.alert("Sukses", "Laporan berhasil dikirim.", [
        { text: "OK", onPress: () => router.push("/waste") },
      ]);
    } catch (err: any) {
      Alert.alert("Gagal", err.message || "Terjadi kesalahan saat mengirim.");
    } finally {
      setLoading(false);
    }
  };
  const handleWeightChange = (raw: string) => {
    let txt = raw.replace(",", ".");
    txt = txt.replace(/[^\d.]/g, "");
    const parts = txt.split(".");
    if (parts.length > 2) txt = parts[0] + "." + parts.slice(1).join("");

    setWeight(txt);
  };

  return (
    <KeyboardAwareScrollView
      extraScrollHeight={20}
      enableOnAndroid
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1 bg-[#F5F7FF] px-6 pt-8">
          {/* Header */}
          <Pressable onPress={() => router.back()} className="mt-4 mb-4">
            <Ionicons name="close" size={32} color="#3B82F6" />
          </Pressable>

          {/* Image Preview */}
          <View className="items-center mb-4">
            {uri ? (
              <Image
                source={{ uri }}
                className="w-72 h-72 rounded-xl"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-red-500">No image preview available.</Text>
            )}
          </View>

          {/* Form */}
          <View className="flex-row justify-between">
            <View className="mb-4">
              <Text className="font-semibold text-gray-700 mb-1">
                Sampah Sesuai
              </Text>
              <View className="bg-white shadow-sm rounded-lg w-40">
                <View className="flex-col space-x-6 m-4 gap-2">
                  <Pressable
                    onPress={() => setTrashOk(true)}
                    className="flex-row items-center space-x-1"
                  >
                    <View
                      className={`w-4 h-4 rounded-full border border-gray-400 ${trashOk === true ? "bg-blue-500" : ""}`}
                    />
                    <Text>Ya</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setTrashOk(false)}
                    className="flex-row items-center space-x-1"
                  >
                    <View
                      className={`w-4 h-4 rounded-full border border-gray-400 ${trashOk === false ? "bg-blue-500" : ""}`}
                    />
                    <Text>Tidak</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <View className="mb-4 mr-2">
              <Text className="font-semibold text-gray-700 mb-1">
                Berat Sampah
              </Text>
              <View className="flex-row items-center space-x-2">
                <TextInput
                  className="flex-1 bg-white px-3 py-2 rounded-md border mr-2 border-gray-300 shadow-sm"
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={handleWeightChange}
                  placeholder="0"
                />
                <Text>kg</Text>
              </View>
            </View>
          </View>

          <View className="mb-4">
            <Text className="font-semibold text-gray-700 mb-1">
              Laporan Tambahan
            </Text>
            <TextInput
              className="bg-white shadow-sm p-3 rounded-md border border-gray-300 h-24 text-sm"
              multiline
              textAlignVertical="top"
              value={note}
              onChangeText={setNote}
              placeholder="Tulis laporan..."
            />
          </View>

          {/* Actions */}
          <View className="flex-row justify-between">
            <Pressable
              onPress={() => router.back()}
              className="border border-blue-500 rounded-xl px-4 py-2"
            >
              <Text className="text-blue-500 font-medium">Retake Photo</Text>
            </Pressable>

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              className={`rounded-xl px-4 py-2 ${loading ? "bg-blue-300" : "bg-blue-500"}`}
            >
              <Text className="text-white font-medium">
                {loading ? "Mengirim..." : "Submit"}
              </Text>
            </Pressable>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAwareScrollView>
  );
}
