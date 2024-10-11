import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: { userInfo: {} },
  reducers: {
    changeUserInfo: (state, action) => {
      state.userInfo = action.payload; // Cập nhật dữ liệu
    },
  }
});

export const { changeUserInfo} = userSlice.actions; // Export các action

export default userSlice.reducer; // Export reducer
