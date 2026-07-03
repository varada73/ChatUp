import { useState } from "react";
import {Mail} from "lucide-react";
import LoginForm from "./partials/loginForm";
import RegisterForm from "./partials/registerForm";
const Auth : React.FC=() =>{
    const [isLogin,setIsLogin] = useState(false);
    return <>
   <div className="min-h-screen w-full bg-white flex flex-col md:flex-row">
    <div className="w-full md:w-6/12 bg-sky-500 p-8 text-white flex flex-col justify-center">
    <div className="text-center mb-8">
        <div className ="flex jstify-center mb-6">
            <div className="bg-white/20 p-4 rounded-full">
            <Mail className="size-10"/>
            </div>
            
        </div>
        <h1 className="text-3xl foont bold mb-2">Wekcome to Chatty</h1>
        <p className="text-lg">Connect with your friends and the world around you.</p>

    </div>
    <div className="mt-10 text-center">
        <p className="text-sm opacity-80">
            Join thousands of users today!
        </p>

    </div>
    </div> 
    <div className="w-full md:w-6/12 flex p-8 justify-center items-center">
    {isLogin ?(
        <div className="w-full md:w-[400px]">
            <LoginForm onSwitch={()=>setIsLogin(false)}/>
            </div>
    ):
    (
        <div className="w-full md:w-[400px]">
            <RegisterForm onSwitch={()=>setIsLogin(true)}/>
            </div>
    )
}
    </div>
      </div>
    </>
}
export default Auth;