import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(); //创建了一个"数据存储库"，专门用来存放你需要共享的数据（比如用户信息、登录状态等）,为了使得AuthContextProvider这个新建组件包裹下的组件都能获得用户信息

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user") || null)
  );
  const login = async (inputs) => {
    try {
      const res = await axios.post(
        "http://localhost:8000/user/login",  // updated API endpoint
        inputs
      );
      setCurrentUser(res.data);
    } catch (error) {
      throw error;  // 将错误传递给调用者
    }
  };
  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    //返回标签时要提供全局的数据
    <AuthContext.Provider value={{ currentUser, login }}>
      {children}
    </AuthContext.Provider>
  );
};
