import AsyncStorage from "@react-native-async-storage/async-storage";
import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";
import type {UserProfile} from "./types";

interface UserStore {
  profile: UserProfile;
  setProfile: (profile: Partial<UserProfile>) => void;
  clearProfile: () => void;
}

const defaultProfile: UserProfile = {
  name: "",
  email: "",
  avatar: undefined,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      setProfile: (updates) =>
        set((state) => ({
          profile: {...state.profile, ...updates},
        })),
      clearProfile: () => set({profile: defaultProfile}),
    }),
    {
      name: "user-profile",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
