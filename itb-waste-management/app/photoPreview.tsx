import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { submitReport } from "@/services/wasteService";
import { usePhotoStore } from "@/store/photoStore";
import { useReportFormStore } from "@/store/formStore";

export default function PhotoPreview() {
  const { uri, id } = useLocalSearchParams<{ uri?: string; id?: string }>();
  const router = useRouter();

  const {
    weight,
    note,
    isTrashCorrect,
    setWeight,
    setNote,
    setIsTrashCorrect,
    resetForm,
  } = useReportFormStore();
  const [loading, setLoading] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const { uris, addUri, removeUri, clearUris } = usePhotoStore();
  const handleAddPhoto = (newUri: string) => {
    addUri(newUri);
  };

  const handleRemovePhoto = (uri: string) => {
    removeUri(uri);
  };

  const handleSubmit = async () => {
    if (!uris || uris.length === 0 || !id)
      return Alert.alert("Error", "Data tidak lengkap.");
    if (!weight) return Alert.alert("Validasi", "Masukkan berat sampah.");
    if (isTrashCorrect == null)
      return Alert.alert("Validasi", "Pilih apakah sampah sesuai.");

    try {
      setLoading(true);

      const imagesBase64: string[] = [];

      for (const uri of uris) {
        const fileInfo: any = await FileSystem.getInfoAsync(uri);
        if (fileInfo.size && fileInfo.size > 4 * 1024 * 1024) {
          setLoading(false);
          return Alert.alert(
            "Ukuran Gambar Besar",
            "Salah satu gambar melebihi 4MB.",
          );
        }

        const base64Image = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        imagesBase64.push(`data:image/jpeg;base64,${base64Image}`);
      }

      await submitReport({
        id,
        match: isTrashCorrect,
        collected: weight,
        note,
        image: imagesBase64, // now an array
      });

      Alert.alert("Sukses", "Laporan berhasil dikirim.", [
        {
          text: "OK",
          onPress: () => {
            clearUris();
            resetForm();
            router.replace("/waste");
          },
        },
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

  const handleNewPhoto = () => {
    router.push({
      pathname: "/camera",
      params: { id }, // pass the report_item id
    });
  };

  const handleBack = () => {
    setConfirmVisible(true);
  };

  const confirmBack = () => {
    clearUris();
    resetForm();
    setConfirmVisible(false);
    router.replace("/waste");
  };

  useEffect(() => {
    if (uri) handleAddPhoto(uri);
  }, []);

  return (
    <>
      <KeyboardAwareScrollView
        extraScrollHeight={20}
        enableOnAndroid
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View className="flex-1 bg-[#F5F7FF] px-6 pt-8">
            {/* Header */}
            <Pressable onPress={() => handleBack()} className="mt-4 mb-4">
              <Ionicons name="close" size={32} color="#3B82F6" />
            </Pressable>

            {/* Image Preview */}
            <View className="flex-row justify-between mb-4">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                className="mb-4 p-2 flex-row"
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                scrollEventThrottle={16}
              >
                {uris.map((u) => (
                  <Pressable
                    key={u}
                    onPress={() => setPreviewUri(u)}
                    className="relative mr-2"
                  >
                    <Image
                      source={{ uri: u }}
                      className="w-32 h-32 rounded-xl"
                      resizeMode="cover"
                    />
                    <Pressable
                      onPress={() => handleRemovePhoto(u)}
                      hitSlop={10}
                      className="absolute -top-2 -right-2 bg-black rounded-full p-1"
                    >
                      <Ionicons name="close" size={16} color="#fff" />
                    </Pressable>
                  </Pressable>
                ))}

                {uris.length < 5 && (
                  <Pressable
                    onPress={handleNewPhoto}
                    className="w-32 h-32 bg-white rounded-xl shadow-sm items-center justify-center"
                  >
                    <Ionicons name="add" size={28} color="#3B82F6" />
                  </Pressable>
                )}
              </ScrollView>
            </View>

            {/* Form */}
            <View className="flex-col">
              <View className="mb-4 mr-2 w-full">
                <Text className="font-semibold text-gray-700 mb-1">
                  Sampah Sesuai
                </Text>
                <View className="bg-white flex-row justify-between items-center px-4 py-3 rounded-xl border border-gray-200 shadow-sm w-full">
                  {/* Yes Option */}
                  <TouchableOpacity
                    className="flex-row items-center w-[45%]"
                    onPress={() => setIsTrashCorrect(true)}
                  >
                    <View
                      className={`w-5 h-5 rounded-full border-2 mr-2 ${
                        isTrashCorrect === true
                          ? "border-blue-500 bg-blue-500"
                          : "border-blue-500"
                      } items-center justify-center`}
                    >
                      {isTrashCorrect === true && (
                        <View className="w-2.5 h-2.5 rounded-full bg-white" />
                      )}
                    </View>
                    <Text className="text-blue-700">Ya</Text>
                  </TouchableOpacity>

                  {/* No Option */}
                  <TouchableOpacity
                    className="flex-row items-center"
                    onPress={() => setIsTrashCorrect(false)}
                  >
                    <View
                      className={`w-5 h-5 rounded-full border-2 mr-2 ${
                        isTrashCorrect === false
                          ? "border-blue-500 bg-blue-500"
                          : "border-blue-500"
                      } items-center justify-center`}
                    >
                      {isTrashCorrect === false && (
                        <View className="w-2.5 h-2.5 rounded-full bg-white" />
                      )}
                    </View>
                    <Text className="text-blue-700 pr-28">Tidak</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View className="mb-4 mr-2 w-full">
                <Text className="font-semibold text-gray-700 mb-1">
                  Berat Sampah (Kg)
                </Text>
                <View className="flex-row items-center space-x-2 w-full ">
                  <TextInput
                    className="w-full bg-white px-3 py-2 rounded-md border mr-2 border-gray-300 shadow-sm"
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={handleWeightChange}
                    placeholder="0"
                  />
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
              {/*<Pressable
              onPress={() => router.back()}
              className="border border-blue-500 rounded-xl px-4 py-2"
            >
              <Text className="text-blue-500 font-medium">Retake Photo</Text>
            </Pressable>*/}

              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                className={`rounded-xl px-4 py-2 w-full items-center ${loading ? "bg-blue-300" : "bg-blue-500"}`}
              >
                <Text className="text-white font-medium">
                  {loading ? "Mengirim..." : "Submit"}
                </Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
      <Modal visible={!!previewUri} transparent={true}>
        <View className="flex-1 bg-black items-center justify-center">
          {previewUri && (
            <>
              <Image
                source={{ uri: previewUri }}
                className="w-full h-full"
                resizeMode="contain"
              />
              <Pressable
                onPress={() => setPreviewUri(null)}
                className="absolute top-10 right-5 bg-black/60 rounded-full p-2"
              >
                <Ionicons name="close" size={28} color="#fff" />
              </Pressable>
            </>
          )}
        </View>
      </Modal>
      <Modal visible={confirmVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-4 rounded-md">
            <Text className="mb-2 text-xl font-semibold">Are you sure?</Text>
            <Text className="mb-6">All Form will be lost.</Text>
            <View className="flex-row space-x-4 gap-10">
              <TouchableOpacity
                className="w-fit h-10 bg-white border-blue-500 border-2 justify-center px-5 rounded-xl"
                onPress={() => setConfirmVisible(false)}
              >
                <Text className="text-blue-500">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-fit h-10 bg-blue-500 justify-center px-5 rounded-xl"
                onPress={confirmBack}
              >
                <Text className="text-white">Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
