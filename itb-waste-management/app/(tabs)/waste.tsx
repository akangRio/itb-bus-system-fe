import {
  ScrollView,
  Text,
  View,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useEffect, useState } from "react";
import CardSchedule from "@/components/cardSchedule";
import DatePickerModal from "@/components/datePickerComponent";
import { getSchedule } from "@/services/wasteService";

type ReportItem = {
  id: string;
  building: string;
  quota: string;
  collected: boolean;
};

type ScheduleSession = {
  session: number;
  id: string;
  date: string;
  trash_type: string;
  report_item: ReportItem[];
};

export default function WasteScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedules, setSchedules] = useState<ScheduleSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [trashFilter, setTrashFilter] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);

  const fetchSchedule = async (date: Date) => {
    try {
      setLoading(true);
      const dateParam = date.toISOString().split("T")[0];
      const result = await getSchedule(dateParam);
      setSchedules(result);

      // Determine current session index
      for (let i = 0; i < result.length; i++) {
        const session = result[i];
        const hasUncollected = session.report_item.some(
          (item: any) => !item.collected,
        );
        if (hasUncollected) {
          setCurrentSessionIndex(i);
          setTrashFilter(session.trash_type);
          return;
        }
      }

      // All sessions completed
      setCurrentSessionIndex(result.length - 1);
      setTrashFilter(result[result.length - 1]?.trash_type ?? null);
    } catch (err) {
      console.error("Failed to fetch schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule(selectedDate);
  }, [selectedDate]);

  const filteredSchedules = schedules.filter(
    (session) => session.trash_type === trashFilter,
  );

  const currentSession = filteredSchedules[0];
  const isSessionCompleted = currentSession?.report_item.every(
    (i) => i.collected,
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-blue-500 rounded-b-[40px] p-6">
        <Text className="text-white text-xl font-bold text-center">
          Schedule
        </Text>

        <View className="mt-4 border-2 border-blue-400 rounded-xl px-4 py-3 flex-row items-center space-x-4 bg-white shadow-sm">
          <View className="flex-1">
            <DatePickerModal
              date={selectedDate}
              onChangeDate={setSelectedDate}
            />
            <Text className="text-xs text-gray-400 mt-1">Koleksi Hari Ini</Text>

            <Pressable
              onPress={() => setShowFilterModal(true)}
              className="mt-1 bg-gray-100 rounded-md px-2 py-1"
            >
              <Text className="text-sm text-gray-700">
                {trashFilter || "-"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Cards */}
      <ScrollView
        className="px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {loading ? (
          <Text className="text-center text-gray-500 mt-6">Loading...</Text>
        ) : !filteredSchedules.length ? (
          <Text className="text-center text-gray-500 mt-6">
            Tidak ada jadwal hari ini
          </Text>
        ) : (
          filteredSchedules[0].report_item.map((item) => (
            <CardSchedule
              key={item.id}
              id={item.id}
              building={item.building}
              quota={item.quota}
              collected={item.collected}
            />
          ))
        )}

        {/* Show Next Session Button */}
        {!loading &&
          isSessionCompleted &&
          currentSessionIndex < schedules.length - 1 && (
            <Pressable
              onPress={() => {
                const nextSession = schedules[currentSessionIndex + 1];
                setCurrentSessionIndex(currentSessionIndex + 1);
                setTrashFilter(nextSession.trash_type);
              }}
              className="bg-blue-500 rounded-xl py-3 mt-6 mx-auto px-8"
            >
              <Text className="text-white text-center font-semibold">
                Lihat Jadwal Berikutnya
              </Text>
            </Pressable>
          )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowFilterModal(false)}>
          <View className="flex-1 justify-center items-center bg-black/30">
            <View className="bg-white p-4 rounded-xl w-64 items-center">
              {schedules.map((s, index) => {
                const disabled = index > currentSessionIndex;
                return (
                  <Pressable
                    key={s.trash_type}
                    disabled={disabled}
                    onPress={() => {
                      setTrashFilter(s.trash_type);
                      setShowFilterModal(false);
                    }}
                    className={`w-full py-2 border-b border-gray-200 ${
                      disabled ? "opacity-40" : ""
                    }`}
                  >
                    <Text className="text-center text-gray-700 text-base">
                      {s.trash_type}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
