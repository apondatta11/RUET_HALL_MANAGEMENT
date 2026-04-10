// src/store/hooks.ts
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./index";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

// Usage example in any component:
// const dispatch = useAppDispatch()
// const user = useAppSelector(state => state.auth.user)
// dispatch(setUser({ id: "123", ... }))