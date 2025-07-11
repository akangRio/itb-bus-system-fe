import {
  CameraView,
  useCameraPermissions,
  CameraType,
  CameraCapturedPicture,
} from "expo-camera";
import { useState, useRef } from "react";
import { Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as ImageManipulator from "expo-image-manipulator";

export default function CameraPage() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const cameraRef = useRef<CameraView>(null);
  const [capturing, setCapturing] = useState(false);
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center px-4">
        <Text className="text-center text-gray-700 text-lg mb-4">
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-blue-500 px-6 py-2 rounded-xl"
        >
          <Text className="text-white font-semibold">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current && !capturing) {
      setCapturing(true);
      try {
        const photo: CameraCapturedPicture =
          await cameraRef.current.takePictureAsync({ skipProcessing: true });

        const manipulated = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
        );

        router.push(
          `/photoPreview?uri=${encodeURIComponent(manipulated.uri)}&id=${id}`,
        );
      } catch (err) {
        console.error("Error taking or processing picture", err);
      } finally {
        setCapturing(false);
      }
    }
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing} />

      {/* Bottom Controls */}
      <View className="absolute bottom-10 w-full px-10 flex-row justify-between items-center">
        {/* Flip Camera */}
        <TouchableOpacity
          onPress={() => setFacing(facing === "back" ? "front" : "back")}
          className="bg-black/40 p-3 rounded-full"
        >
          <Ionicons name="camera-reverse-outline" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Capture Button */}
        <TouchableOpacity
          onPress={takePicture}
          className={`p-4 rounded-full border-4 border-white ${
            capturing ? "bg-gray-400" : "bg-blue-500"
          }`}
          disabled={capturing}
        >
          {capturing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="scan-circle-outline" size={60} color="#fff" />
          )}
        </TouchableOpacity>

        {/* Close Camera */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-black/40 p-3 rounded-full"
        >
          <Ionicons name="close-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
